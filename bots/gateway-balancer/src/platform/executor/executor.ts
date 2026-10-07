import { keccak256, type LocalAccount } from "viem";
import type { Address, ChainId, Hex, TxRequest } from "../../domain";
import {
  DuplicateTransaction,
  type Clock,
  type Journal,
  type Logger,
  type Notifier,
  type RecoveryReport,
  type SubmitOptions,
  type SubmitOutcome,
  type TransactionRecord,
  type TxExecutor,
  type TxStatus,
} from "../../ports";
import { revertSuffix } from "../chains/rpcError";
import { readGasReserve } from "../gas/reserve";
import type { Redact } from "../redact";
import { boundedRpc, RpcFailure, type ExecutorRpc, type FeeData } from "./rpc";

export interface ExecutorChain {
  chainId: ChainId;
  name: string;
  confirmations: number;
  rpc: ExecutorRpc;
}

export interface ExecutorOptions {
  waitMs: number;
  pollIntervalMs: number;
  /** Age in `signed`/`broadcast` after which one warning per record is raised. */
  stuckAfterMs: number;
  baseFeeMultiplier: number;
  /** The gas limit is the simulated estimate plus this percentage (ignored when the request sets `gas`). */
  gasLimitBufferPercent: number;
  /**
   * An on-chain revert whose replay is inconclusive (timeout, transport, a node that cannot replay the block) stays
   * pending and is replayed again on later inspections; after this many inconclusive replays (counted once per
   * `submit`/`resolve`/`recover` call and persisted in the journal), or once the record is `replayMaxAgeMs` old
   * (from its `createdAt`) with at least `replayMinAttempts` of them, it is made final `reverted` with a
   * `replay unavailable` note (decisions [L66]).
   */
  replayMaxAttempts: number;
  replayMaxAgeMs: number;
  /** Default 2. */
  replayMinAttempts?: number;
}

export interface ExecutorDeps {
  account: LocalAccount;
  chains: ReadonlyMap<ChainId, ExecutorChain>;
  journal: Journal;
  clock: Clock;
  logger: Logger;
  notifier: Notifier;
  redact: Redact;
  /** The platform's shutdown signal: every confirmation wait returns `pending` as soon as it aborts. */
  signal: AbortSignal;
  options: ExecutorOptions;
}

/** Records that hold a nonce until they become `confirmed`, `reverted` or `replaced`. */
const NONCE_HOLDING: TxStatus[] = ["signed", "broadcast", "unknown"];
/**
 * Records the executor still settles from the chain. `unknown` holds its nonce but is terminal for the executor
 * (decisions [L29]): it is never re-inspected or rebroadcast, also after its chain is configured again.
 */
const SETTLEABLE: TxStatus[] = ["prepared", "signed", "broadcast"];
const FINAL_OUTCOMES: Array<SubmitOutcome["status"]> = ["confirmed", "reverted", "replaced", "failed"];

type Inspection =
  | { kind: "final"; outcome: SubmitOutcome }
  | { kind: "pending"; outcome: SubmitOutcome; rebroadcast: boolean; transportError: string | null };

const GAS_RESERVE = "gas-reserve:";
/** The fixed prefix of a failure before signing caused by shutdown or an expired wait budget (decisions [L57]). */
export const ABORTED = "aborted:";
const REPLAY = "replay:";

/** The operator gas reserve cannot pay for a request: refused before signing. */
class GasReserveRefusal extends Error {}

/** Shutdown or the wait budget stopped a submit before it signed. */
class AbortedBeforeSigning extends Error {}

/**
 * The replay of an on-chain revert at its block: `revert` with the bytes, `none` when it is conclusive without bytes
 * (an empty-data revert, or the replay did not revert), `inconclusive` when the replay itself failed (decisions
 * [L63]).
 */
type Replay =
  | { kind: "revert"; reason: string }
  | { kind: "none"; reason: string }
  | { kind: "inconclusive"; error: string };

/** The persisted replay bound of one record (a journal observation keyed by its idempotency key, [L62]). */
interface ReplayAttempts {
  attempts: number;
  firstAt: string;
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function failureText(error: unknown): string {
  const revertData = error instanceof RpcFailure ? error.revertData : null;
  return `${errorText(error)} ${revertSuffix(revertData)}`;
}

function isAbort(error: unknown): boolean {
  return error instanceof AbortedBeforeSigning || (error instanceof RpcFailure && error.aborted);
}

/**
 * `failed.error` of a submit that did not sign: `aborted: ... revertData=none` for shutdown, budget expiry or any
 * other RPC failure that is not a contract revert (HTTP error, refused connection, timeout; decisions [L65]).
 */
function unsignedFailureText(error: unknown): string {
  const transient = isAbort(error) || (error instanceof RpcFailure && !error.revert);
  return transient ? `${ABORTED} ${errorText(error)} ${revertSuffix(null)}` : failureText(error);
}

function requestOf(record: TransactionRecord): TxRequest {
  return { chainId: record.chainId, to: record.to, value: record.value, ...(record.data ? { data: record.data } : {}) };
}

/**
 * The only code that signs. Per chain, nonces are assigned under a mutex as
 * `max(pending count, 1 + highest nonce held by a signed/broadcast/unknown record)`. A record is `failed` (null
 * nonce) only when nothing was signed; once signed it is settled from the chain alone: rebroadcast while its nonce
 * is free, `confirmed`/`reverted` from the receipt at the chain's depth, `replaced` once its nonce is consumed
 * `confirmations` deep and a second read still does not know the hash. No node error string is ever parsed.
 */
export class PlatformExecutor implements TxExecutor {
  readonly signer: Address;
  private readonly locks = new Map<ChainId, Promise<unknown>>();
  private readonly inFlight = new Map<string, Promise<SubmitOutcome>>();
  private readonly warned = new Set<string>();

  constructor(private readonly deps: ExecutorDeps) {
    this.signer = deps.account.address;
  }

  submit(request: TxRequest, options: SubmitOptions): Promise<SubmitOutcome> {
    const running = this.inFlight.get(options.idempotencyKey);
    if (running) return running;
    const promise = this.submitOnce(request, options).finally(() => this.inFlight.delete(options.idempotencyKey));
    this.inFlight.set(options.idempotencyKey, promise);
    return promise;
  }

  async resolve(idempotencyKey: string): Promise<SubmitOutcome | undefined> {
    // A submit of this key is still running in this process: its record may be transiently `prepared`.
    const running = this.inFlight.get(idempotencyKey);
    if (running) return running;
    const record = await this.deps.journal.getTransaction(idempotencyKey);
    if (!record) return undefined;
    if (record.status === "unknown") return unknownOutcome(record);
    const chain = this.deps.chains.get(record.chainId);
    // A final record keeps its journal outcome once its chain is removed; only a non-final one needs the chain
    // (decisions [L22]).
    if (!chain) return (await this.finalOutcome(record, null)) ?? this.unknownChain(record);
    const rpc = this.bounded(chain, this.deps.options.waitMs);
    return (await this.inspect(record, chain, rpc, chain.confirmations, "runtime", new Set())).outcome;
  }

  async recover(): Promise<RecoveryReport> {
    const report: RecoveryReport = { resolved: 0, rebroadcast: 0, unknown: [] };
    const mine = (r: TransactionRecord) => r.from.toLowerCase() === this.signer.toLowerCase();
    // Already `unknown`: reported, never re-inspected or rebroadcast ([L29]).
    for (const record of (await this.deps.journal.listTransactions({ status: "unknown" })).filter(mine)) {
      report.unknown.push(record.idempotencyKey);
    }
    const records = await this.deps.journal.listTransactions({ status: SETTLEABLE });
    const replayCounted = new Set<string>();
    const rebroadcast: Array<{ record: TransactionRecord; chain: ExecutorChain }> = [];
    for (const record of records.filter(mine)) {
      const chain = this.deps.chains.get(record.chainId);
      if (!chain) {
        if (await this.settleUnconfiguredChain(record)) report.resolved += 1;
        else report.unknown.push(record.idempotencyKey);
        continue;
      }
      const rpc = this.bounded(chain, this.deps.options.waitMs);
      const inspection = await this.inspect(record, chain, rpc, chain.confirmations, "recover", replayCounted);
      if (inspection.kind === "pending" && inspection.rebroadcast) {
        report.rebroadcast += 1;
        rebroadcast.push({ record, chain });
        continue;
      }
      if (inspection.kind === "final") report.resolved += 1;
      else if (inspection.outcome.status === "unknown") report.unknown.push(record.idempotencyKey);
    }
    // The rebroadcast transactions share one wait budget, so startup (and with it the scheduler and the health
    // endpoint) is delayed by at most `waitMs` however many there are; what is still pending is resolved by its loop.
    const deadline = this.deps.clock.now().getTime() + this.deps.options.waitMs;
    for (const { record, chain } of rebroadcast) {
      const current = (await this.deps.journal.getTransaction(record.idempotencyKey)) ?? record;
      const remaining = Math.max(0, deadline - this.deps.clock.now().getTime());
      const outcome = await this.wait(current, chain, chain.confirmations, remaining, replayCounted);
      if (FINAL_OUTCOMES.includes(outcome.status)) report.resolved += 1;
    }
    return report;
  }

  /**
   * A non-final record on a chain no longer in the topology cannot be resolved (decisions [L22]): a signed one is
   * persisted `unknown`, so reconciliation sends its operation to `attention`; an unsigned one is `failed`. True
   * when the record is now final.
   */
  private async settleUnconfiguredChain(record: TransactionRecord): Promise<boolean> {
    const detail = `chain ${record.chainId} is not configured`;
    this.deps.logger.error("a non-final transaction is on a chain missing from the topology", {
      key: record.idempotencyKey,
      chainId: record.chainId,
      status: record.status,
    });
    if (record.status === "prepared" || record.nonce === null || record.signedRaw === null) {
      await this.deps.journal.updateTransaction(record.idempotencyKey, {
        status: "failed",
        error: `${detail}; interrupted before signing ${revertSuffix(null)}`,
      });
      return true;
    }
    await this.deps.journal.updateTransaction(record.idempotencyKey, { status: "unknown", error: detail });
    return false;
  }

  // ---- submit ----------------------------------------------------------------------------------------------

  private async submitOnce(request: TxRequest, options: SubmitOptions): Promise<SubmitOutcome> {
    const { journal } = this.deps;
    const existing = await journal.getTransaction(options.idempotencyKey);
    const chain = this.deps.chains.get(request.chainId);
    const waitMs = options.waitMs ?? this.deps.options.waitMs;
    // One budget for the whole submit: the pre-signing reads, the first broadcast and the confirmation wait.
    const deadline = this.deps.clock.now().getTime() + waitMs;
    if (existing) {
      if (existing.status === "failed") return { status: "failed", error: existing.error ?? "failed" };
      if (existing.status === "unknown") return unknownOutcome(existing);
      const existingChain = this.deps.chains.get(existing.chainId);
      if (!existingChain) return (await this.finalOutcome(existing, null)) ?? this.unknownChain(existing);
      return this.wait(existing, existingChain, options.confirmations ?? existingChain.confirmations, waitMs);
    }
    if (!chain) {
      const error = `chain ${request.chainId} is not configured ${revertSuffix(null)}`;
      await this.recordFailed(request, options, error);
      return { status: "failed", error };
    }
    const record = await this.withChainLock(chain.chainId, () =>
      this.signAndBroadcast(request, options, chain, deadline)
    );
    if (record.status === "failed") {
      if (record.error?.startsWith(GAS_RESERVE)) await this.notifyGasReserve(chain, record);
      return { status: "failed", error: record.error ?? "failed" };
    }
    const remaining = Math.max(0, deadline - this.deps.clock.now().getTime());
    return this.wait(record, chain, options.confirmations ?? chain.confirmations, remaining);
  }

  private async recordFailed(request: TxRequest, options: SubmitOptions, error: string): Promise<void> {
    await this.deps.journal
      .recordTransaction({ ...this.newRecord(request, options), status: "failed", error })
      .catch(() => undefined);
  }

  private newRecord(request: TxRequest, options: SubmitOptions) {
    return {
      idempotencyKey: options.idempotencyKey,
      operationId: options.operationId,
      chainId: request.chainId,
      from: this.signer,
      to: request.to,
      value: request.value,
      data: request.data ?? null,
      nonce: null,
      hash: null,
      signedRaw: null,
      status: "prepared" as TxStatus,
      error: null,
      replacedByHash: null,
      blockNumber: null,
    };
  }

  /**
   * Inside the chain's mutex: record, simulate, estimate, assign the nonce, sign, persist, broadcast. Every RPC call
   * up to the first broadcast is bounded by what is left of the submit's budget and aborts on shutdown; right before
   * signing the shutdown signal, the budget and the journal ownership (a fenced write) are checked again, and right
   * before broadcasting the persisted `signed` record the shutdown signal is.
   */
  private async signAndBroadcast(
    request: TxRequest,
    options: SubmitOptions,
    chain: ExecutorChain,
    deadline: number
  ): Promise<TransactionRecord> {
    const { journal, logger, account, clock, signal } = this.deps;
    try {
      await journal.recordTransaction(this.newRecord(request, options));
    } catch (error) {
      if (error instanceof DuplicateTransaction) {
        const recorded = await journal.getTransaction(options.idempotencyKey);
        if (recorded) return recorded;
      }
      throw error;
    }
    // Nothing was signed: the record is failed and holds no nonce.
    const fail = (error: unknown) =>
      journal.updateTransaction(options.idempotencyKey, {
        status: "failed",
        error: this.deps.redact(unsignedFailureText(error)),
      });
    const checkNotAborted = () => {
      if (signal.aborted) throw new AbortedBeforeSigning("shutdown requested before signing");
      if (clock.now().getTime() >= deadline) {
        throw new AbortedBeforeSigning("the wait budget expired before signing");
      }
    };
    const rpc = this.bounded(chain, deadline - clock.now().getTime());
    let prepared: { gas: bigint; fees: FeeData; nonce: number };
    try {
      checkNotAborted();
      let gas = request.gas;
      if (gas === undefined) {
        await rpc.call(request, this.signer);
        gas = withBuffer(await rpc.estimateGas(request, this.signer), this.deps.options.gasLimitBufferPercent);
      }
      const fees = await rpc.feeData(this.deps.options.baseFeeMultiplier);
      await this.checkGasReserve(
        request,
        chain,
        rpc,
        gas * (fees.type === "eip1559" ? fees.maxFeePerGas : fees.gasPrice)
      );
      const nonce = await this.nextNonce(chain, rpc);
      checkNotAborted();
      prepared = { gas, fees, nonce };
    } catch (error) {
      return fail(error);
    }
    // Ownership right before signing: a fenced write throws when another instance holds the journal.
    await journal.updateTransaction(options.idempotencyKey, {});
    let raw: Hex;
    try {
      const { gas, fees, nonce } = prepared;
      const common = { chainId: chain.chainId, to: request.to, value: request.value, data: request.data, nonce, gas };
      raw =
        fees.type === "eip1559"
          ? await account.signTransaction({
              ...common,
              type: "eip1559",
              maxFeePerGas: fees.maxFeePerGas,
              maxPriorityFeePerGas: fees.maxPriorityFeePerGas,
            })
          : await account.signTransaction({ ...common, type: "legacy", gasPrice: fees.gasPrice });
    } catch (error) {
      return fail(error);
    }
    const hash = keccak256(raw);
    // The fenced write that reserves the nonce: a fenced-out executor throws here and never broadcasts.
    let record = await journal.updateTransaction(options.idempotencyKey, {
      nonce: prepared.nonce,
      hash,
      signedRaw: raw,
      status: "signed",
    });
    if (signal.aborted) {
      // Signed and persisted but not sent: the next start's `recover()` broadcasts it.
      logger.warn("shutdown before broadcast; the signed transaction is sent by recovery", {
        key: options.idempotencyKey,
        chainId: chain.chainId,
      });
      return record;
    }
    try {
      await rpc.sendRawTransaction(raw);
      record = await journal.updateTransaction(options.idempotencyKey, { status: "broadcast", error: null });
    } catch (error) {
      if (!(error instanceof RpcFailure)) throw error;
      // The node may have accepted it anyway: the record stays signed and is settled from the chain.
      const text = this.deps.redact(errorText(error));
      logger.warn("broadcast failed; settling from the chain", {
        key: options.idempotencyKey,
        chainId: chain.chainId,
        error: text,
      });
      record = await journal.updateTransaction(options.idempotencyKey, { error: `broadcast: ${text}` });
    }
    return record;
  }

  /**
   * Under the chain lock, before a nonce is assigned: what the operator reserve keeps after this request's value
   * (already debited from its holding by the loop) must cover this transaction's gas at its fee cap.
   */
  private async checkGasReserve(
    request: TxRequest,
    chain: ExecutorChain,
    rpc: ExecutorRpc,
    maxGasCost: bigint
  ): Promise<void> {
    const reserve = await readGasReserve({
      rpc,
      journal: this.deps.journal,
      chainId: chain.chainId,
      signer: this.signer,
    });
    const left = reserve.reserveWei - request.value;
    if (left >= maxGasCost) return;
    throw new GasReserveRefusal(
      `${GAS_RESERVE} operator gas reserve on ${chain.name} is ${left} wei after this transaction's value ` +
        `(balance ${reserve.balanceWei} at block ${reserve.blockNumber}, ledger holdings ${reserve.ledgerHeldWei}, ` +
        `unmined transactions ${reserve.inFlightWei}, value ${request.value}); it needs ${maxGasCost} wei of gas`
    );
  }

  private async notifyGasReserve(chain: ExecutorChain, record: TransactionRecord): Promise<void> {
    await this.deps.notifier.notify({
      severity: "critical",
      title: `Out of operator gas on ${chain.name}: transactions are refused`,
      body:
        `The executor refused ${record.idempotencyKey} before signing: ${record.error}. Every transaction on ` +
        `${chain.name} is refused until the reserve covers it; the loops retry each tick.`,
      dedupKey: `gas-reserve:${chain.chainId}`,
      chainId: chain.chainId,
      operationId: record.operationId,
      action: `Send native gas to ${this.signer} on ${chain.name} (README: "Gas reserve").`,
    });
  }

  private async nextNonce(chain: ExecutorChain, rpc: ExecutorRpc): Promise<number> {
    const pending = await rpc.getNonce(this.signer, "pending");
    const held = (await this.deps.journal.listTransactions({ chainId: chain.chainId, status: NONCE_HOLDING }))
      .filter((r) => r.from.toLowerCase() === this.signer.toLowerCase() && r.nonce !== null)
      .map((r) => r.nonce as number);
    return Math.max(pending, held.length ? Math.max(...held) + 1 : 0);
  }

  private async withChainLock<T>(chainId: ChainId, run: () => Promise<T>): Promise<T> {
    const previous = this.locks.get(chainId) ?? Promise.resolve();
    const next = previous.then(run, run);
    this.locks.set(
      chainId,
      next.catch(() => undefined)
    );
    return next;
  }

  // ---- settling --------------------------------------------------------------------------------------------

  /** Polls on the platform clock until final, the wait budget is spent, or shutdown aborts. */
  private async wait(
    record: TransactionRecord,
    chain: ExecutorChain,
    confirmations: number,
    waitMs: number,
    replayCounted = new Set<string>()
  ): Promise<SubmitOutcome> {
    const { clock, signal, options } = this.deps;
    const deadline = clock.now().getTime() + waitMs;
    let current = record;
    for (;;) {
      // Every chain read of this round gets what is left of the budget, and shutdown aborts it mid-call.
      const rpc = this.bounded(chain, deadline - clock.now().getTime());
      const inspection = await this.inspect(current, chain, rpc, confirmations, "runtime", replayCounted);
      if (inspection.kind === "final") return inspection.outcome;
      const remaining = deadline - clock.now().getTime();
      if (signal.aborted || remaining <= 0) return inspection.outcome;
      try {
        await clock.sleep(Math.min(options.pollIntervalMs, remaining), signal);
      } catch {
        return inspection.outcome;
      }
      current = (await this.deps.journal.getTransaction(record.idempotencyKey)) ?? current;
    }
  }

  /**
   * One read of the chain for a record, persisting what it learns. A record still `signed` or `broadcast` is
   * `pending` in every mode: after a transport error (it stays as it is and is settled later) and while its nonce is
   * consumed by an unknown transaction that is not yet `confirmations` deep (that becomes `replaced` once deep).
   */
  private async inspect(
    record: TransactionRecord,
    chain: ExecutorChain,
    rpc: ExecutorRpc,
    confirmations: number,
    mode: "runtime" | "recover",
    replayCounted: Set<string>
  ): Promise<Inspection> {
    const final = await this.finalOutcome(record, rpc);
    if (final) return { kind: "final", outcome: final };
    const { journal } = this.deps;
    if (record.status === "prepared" || record.hash === null || record.signedRaw === null || record.nonce === null) {
      // Interrupted before signing (a crash inside submit): nothing can be on chain.
      const error = `interrupted before signing ${revertSuffix(null)}`;
      await journal.updateTransaction(record.idempotencyKey, { status: "failed", error });
      return { kind: "final", outcome: { status: "failed", error } };
    }
    const hash = record.hash;
    const nonce = record.nonce;
    const pending = (transportError: string | null, rebroadcast = false): Inspection => ({
      kind: "pending",
      outcome: { status: "pending", hash },
      rebroadcast,
      transportError,
    });
    try {
      const receipt = await rpc.getReceipt(hash);
      if (receipt) {
        const head = await rpc.getBlockNumber();
        if (head - receipt.blockNumber + 1n < BigInt(confirmations)) {
          await this.markBroadcast(record);
          return pending(null);
        }
        if (receipt.status === "success") {
          await journal.updateTransaction(record.idempotencyKey, {
            status: "confirmed",
            blockNumber: receipt.blockNumber,
            error: null,
          });
          return {
            kind: "final",
            outcome: { status: "confirmed", hash, blockNumber: receipt.blockNumber, gasUsed: receipt.gasUsed },
          };
        }
        const replay = await this.replayRevert(record, rpc, receipt.blockNumber);
        let reason: string;
        if (replay.kind === "inconclusive") {
          const exhausted = await this.replayExhausted(record, replay.error, replayCounted);
          if (!exhausted) {
            // Keep it pending: the bytes are replayed again on a later inspection rather than lost.
            await this.markBroadcast(record);
            this.deps.logger.warn("the revert replay was inconclusive; the transaction stays pending", {
              key: record.idempotencyKey,
              chainId: chain.chainId,
              error: replay.error,
            });
            return pending(replay.error);
          }
          reason =
            `reverted on chain; replay unavailable after ${exhausted.attempts} attempt(s) since ` +
            `${exhausted.firstAt} (last: ${replay.error}) ${revertSuffix(null)}`;
        } else {
          reason = replay.reason;
        }
        await journal.updateTransaction(record.idempotencyKey, {
          status: "reverted",
          blockNumber: receipt.blockNumber,
          error: reason,
        });
        return { kind: "final", outcome: { status: "reverted", hash, reason } };
      }
      if (await rpc.getTransaction(hash)) {
        await this.markBroadcast(record);
        await this.warnIfStuck(record, chain);
        return pending(null);
      }
      // The node does not know the hash.
      const latest = await rpc.getNonce(this.signer, "latest");
      if (latest <= nonce) {
        let rebroadcast = false;
        const operation = await journal.getOperation(record.operationId);
        if (operation && operation.status !== "open") {
          // Its operation was closed (failed, completed, or attention handed to the operator): never send it again.
          this.deps.logger.warn("not rebroadcasting a transaction whose operation is closed", {
            key: record.idempotencyKey,
            chainId: chain.chainId,
            operationStatus: operation.status,
          });
          return pending(null);
        }
        // Ownership right before broadcasting a signed record: a fenced write throws when another instance holds it.
        await journal.updateTransaction(record.idempotencyKey, {});
        try {
          await rpc.sendRawTransaction(record.signedRaw);
          rebroadcast = true;
          await this.markBroadcast(record);
          this.deps.logger.info("rebroadcast a transaction the node did not know", {
            key: record.idempotencyKey,
            chainId: chain.chainId,
            nonce,
          });
        } catch (error) {
          this.deps.logger.warn("rebroadcast failed", {
            key: record.idempotencyKey,
            chainId: chain.chainId,
            error: this.deps.redact(errorText(error)),
          });
        }
        await this.warnIfStuck(record, chain);
        return pending(null, rebroadcast);
      }
      // The nonce is consumed by a transaction we do not know: replaced only once it is deep and still unknown.
      const head = await rpc.getBlockNumber();
      const depthBlock = head - BigInt(confirmations) + 1n;
      const consumedDeep = depthBlock >= 0n && (await rpc.getNonce(this.signer, depthBlock)) > nonce;
      if (consumedDeep) {
        if (await rpc.getReceipt(hash)) return this.inspect(record, chain, rpc, confirmations, mode, replayCounted);
        if (!(await rpc.getTransaction(hash))) {
          await journal.updateTransaction(record.idempotencyKey, {
            status: "replaced",
            replacedByHash: null,
            error: `nonce ${nonce} consumed by another transaction ${confirmations} blocks deep`,
          });
          return { kind: "final", outcome: { status: "replaced", hash, replacedByHash: null } };
        }
        return pending(null);
      }
      // Consumed on `latest` only: not yet ambiguous. It stays pending until it is deep (replaced) or the hash shows.
      this.deps.logger.info("nonce consumed by an unknown transaction; waiting for depth", {
        key: record.idempotencyKey,
        chainId: chain.chainId,
        nonce,
        confirmations,
        mode,
      });
      return pending(null);
    } catch (error) {
      // Only a chain read failed (journal errors such as lost ownership propagate): the record stays as it is and
      // is settled later, never `unknown`.
      if (!(error instanceof RpcFailure)) throw error;
      const text = this.deps.redact(errorText(error));
      this.deps.logger.warn("chain read failed; the transaction stays pending", {
        key: record.idempotencyKey,
        chainId: chain.chainId,
        error: text,
      });
      return pending(text);
    }
  }

  /**
   * The outcome of a record already final in the journal. Without `rpc` (its chain is no longer configured) a
   * `confirmed` one reports `gasUsed` 0, as when its receipt cannot be read.
   */
  private async finalOutcome(record: TransactionRecord, rpc: ExecutorRpc | null): Promise<SubmitOutcome | null> {
    switch (record.status) {
      case "failed":
        return { status: "failed", error: record.error ?? "failed" };
      case "reverted":
        return { status: "reverted", hash: record.hash as Hex, reason: record.error };
      case "replaced":
        return { status: "replaced", hash: record.hash as Hex, replacedByHash: record.replacedByHash };
      case "unknown":
        return unknownOutcome(record);
      case "confirmed": {
        const gasUsed = rpc
          ? await rpc.getReceipt(record.hash as Hex).then(
              (r) => r?.gasUsed ?? 0n,
              () => 0n
            )
          : 0n;
        return { status: "confirmed", hash: record.hash as Hex, blockNumber: record.blockNumber ?? 0n, gasUsed };
      }
      default:
        return null;
    }
  }

  /**
   * Replays the call at the receipt's block (its post-state) to recover the revert bytes. Only a genuine revert of
   * the replay (or a replay that does not revert) is conclusive; a timeout, abort or transport failure is not.
   */
  private async replayRevert(record: TransactionRecord, rpc: ExecutorRpc, blockNumber: bigint): Promise<Replay> {
    try {
      await rpc.call(requestOf(record), this.signer, blockNumber);
      return {
        kind: "none",
        reason: `reverted on chain; the replay at block ${blockNumber} did not revert ${revertSuffix(null)}`,
      };
    } catch (error) {
      if (!(error instanceof RpcFailure)) throw error;
      if (!error.revert) return { kind: "inconclusive", error: this.deps.redact(errorText(error)) };
      return { kind: error.revertData ? "revert" : "none", reason: this.deps.redact(failureText(error)) };
    }
  }

  /**
   * Counts one inconclusive replay in the journal (so a restart does not reset the bound), at most once per
   * `submit`/`resolve`/`recover` call (`replayCounted`), and returns the count once the bound is reached (attempts,
   * or the record's age since `createdAt` on the platform clock with at least `replayMinAttempts`; decisions [L66]);
   * `null` while the record should stay pending.
   */
  private async replayExhausted(
    record: TransactionRecord,
    error: string,
    replayCounted: Set<string>
  ): Promise<ReplayAttempts | null> {
    const { journal, clock, options } = this.deps;
    const key = `${REPLAY}${record.idempotencyKey}`;
    const previous = (await journal.observations(key)).find((o) => o.key === key)?.value as
      | (ReplayAttempts & { lastError?: string })
      | undefined;
    const now = clock.now();
    const counted = replayCounted.has(key);
    const attempts = (previous?.attempts ?? 0) + (counted ? 0 : 1);
    const firstAt = previous?.firstAt ?? now.toISOString();
    if (!counted) {
      await journal.recordObservation(key, { attempts, firstAt, lastError: error }, now);
      replayCounted.add(key);
    }
    const age = now.getTime() - record.createdAt.getTime();
    const minAttempts = options.replayMinAttempts ?? 2;
    return attempts >= options.replayMaxAttempts || (age >= options.replayMaxAgeMs && attempts >= minAttempts)
      ? { attempts, firstAt }
      : null;
  }

  /** The chain's RPC with each call bounded by `budgetMs` and the shutdown signal. */
  private bounded(chain: ExecutorChain, budgetMs: number): ExecutorRpc {
    return boundedRpc(chain.rpc, budgetMs, this.deps.signal);
  }

  private async markBroadcast(record: TransactionRecord): Promise<void> {
    if (record.status === "signed") {
      await this.deps.journal.updateTransaction(record.idempotencyKey, { status: "broadcast" });
    }
  }

  /** One warning per record once it has waited longer than `stuckAfterMs` without confirming. */
  private async warnIfStuck(record: TransactionRecord, chain: ExecutorChain): Promise<void> {
    const age = this.deps.clock.now().getTime() - record.createdAt.getTime();
    if (age < this.deps.options.stuckAfterMs || this.warned.has(record.idempotencyKey)) return;
    this.warned.add(record.idempotencyKey);
    const queued = (await this.deps.journal.listTransactions({ chainId: chain.chainId, status: NONCE_HOLDING })).filter(
      (r) => r.nonce !== null && record.nonce !== null && r.nonce > record.nonce
    ).length;
    await this.deps.notifier.notify({
      severity: "warning",
      title: `Transaction stuck on ${chain.name} at nonce ${record.nonce}`,
      body:
        `Transaction ${record.hash} (nonce ${record.nonce}, ${record.idempotencyKey}) has not confirmed after ` +
        `${Math.round(age / 60_000)} min. ${queued} later transaction(s) on ${chain.name} are queued behind it ` +
        `and stay pending until it clears.`,
      dedupKey: `tx-stuck:${record.idempotencyKey}`,
      chainId: chain.chainId,
      operationId: record.operationId,
      txHashes: record.hash ? [record.hash] : [],
      action:
        `Check the fee market on ${chain.name}. Rebroadcast the stored signed transaction, or cancel by sending a ` +
        `0-value self-transfer at nonce ${record.nonce} with a higher fee (README: "Stuck transaction").`,
    });
  }

  private unknownChain(record: TransactionRecord): SubmitOutcome {
    return { status: "unknown", hash: record.hash, detail: `chain ${record.chainId} is not configured` };
  }
}

/** A record persisted `unknown` is terminal for the executor: its outcome is read from the journal alone. */
function unknownOutcome(record: TransactionRecord): SubmitOutcome {
  return { status: "unknown", hash: record.hash, detail: record.error ?? "unknown" };
}

/** `estimate * (100 + percent) / 100`, rounded up. */
export function withBuffer(estimate: bigint, percent: number): bigint {
  const scaled = estimate * BigInt(100 + percent);
  return (scaled + 99n) / 100n;
}
