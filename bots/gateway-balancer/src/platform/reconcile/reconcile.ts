import type { Journal, Logger, Notifier, RecoveryReport, TransactionRecord, TxExecutor } from "../../ports";

export interface ReconcileReport {
  recovery: RecoveryReport;
  /** Open operations left open (resumable by their owning loop). */
  resumable: string[];
  /** Operations moved to `attention`. */
  attention: string[];
}

function describe(records: TransactionRecord[]): string {
  return records
    .map(
      (r) =>
        `${r.idempotencyKey} is ${r.status} (chain ${r.chainId}, nonce ${r.nonce ?? "none"}, hash ${r.hash ?? "none"})`
    )
    .join("; ");
}

/**
 * Startup reconciliation, after the `owner` row is held: `executor.recover()` settles every non-final transaction
 * record, then each open operation whose transactions include an `unknown` or `replaced` record goes to
 * `attention` with `lastError` and one notification. Everything else stays `open` and untouched: the owning loop
 * resumes it from its own `step`. Nothing is submitted here and no balance is read.
 */
export async function reconcile(deps: {
  journal: Journal;
  executor: TxExecutor;
  notifier: Notifier;
  logger: Logger;
}): Promise<ReconcileReport> {
  const { journal, executor, notifier, logger } = deps;
  const recovery = await executor.recover();
  const report: ReconcileReport = { recovery, resumable: [], attention: [] };
  for (const operation of await journal.listOperations({ status: "open" })) {
    const records = await journal.listTransactions({ operationId: operation.id });
    const ambiguous = records.filter((r) => r.status === "unknown" || r.status === "replaced");
    if (ambiguous.length === 0) {
      report.resumable.push(operation.id);
      continue;
    }
    const lastError = `reconciliation: ${describe(ambiguous)}`;
    await journal.updateOperation(operation.id, { status: "attention", lastError });
    report.attention.push(operation.id);
    const chainId = ambiguous[0]?.chainId;
    await notifier.notify({
      severity: "critical",
      title: `Operation ${operation.id} needs attention after restart`,
      body: `${operation.kind} operation "${operation.description}" (step ${operation.step}): ${lastError}`,
      dedupKey: `attention:${operation.id}`,
      ...(operation.pairId ? { pairId: operation.pairId } : {}),
      ...(operation.routeId ? { routeId: operation.routeId } : {}),
      ...(chainId === undefined ? {} : { chainId }),
      operationId: operation.id,
      txHashes: ambiguous.flatMap((r) => (r.hash ? [r.hash] : [])),
      action:
        "Inspect the transactions on the explorer, settle the ledger by hand if funds moved, then mark the " +
        'operation completed or failed (README: "Operations in attention").',
    });
  }
  logger.info("reconciliation finished", {
    resolved: recovery.resolved,
    rebroadcast: recovery.rebroadcast,
    unknown: recovery.unknown.length,
    resumable: report.resumable.length,
    attention: report.attention.length,
  });
  return report;
}
