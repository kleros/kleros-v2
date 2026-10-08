/**
 * `close-operation <id> --as failed|completed [--note "..."]`: the operator's way out of `attention`, the one state
 * the bot never leaves by itself. Through the journal's own API (both stored forms of the status in one fenced
 * write), only for an operation in `attention`, with the operator's note kept on the record. The ledger is never
 * touched: what the operation's scopes still hold is printed so the operator can see what the chain must be
 * compared with.
 */
import type { JsonValue, Operation } from "../../domain";
import type { Holding, Journal } from "../../ports";

export const CLOSE_AS = ["failed", "completed"] as const;
export type CloseAs = (typeof CLOSE_AS)[number];

export interface CloseOperationArgs {
  id: string;
  as: CloseAs;
  note: string;
}

export const CLOSE_OPERATION_USAGE =
  'close-operation <operation id> --as failed|completed [--note "what you verified on the explorer"]';

/** A usage problem or a refused close: reported with exit code 2, never a stack trace. */
export class CloseOperationRefused extends Error {}

/** `argv` after the command name. */
export function parseCloseOperationArgs(argv: readonly string[]): CloseOperationArgs {
  let id: string | undefined;
  let as: string | undefined;
  let note = "";
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]!;
    if (arg === "--as" || arg === "--note") {
      const value = argv[i + 1];
      if (value === undefined) throw new CloseOperationRefused(`${arg} needs a value\nusage: ${CLOSE_OPERATION_USAGE}`);
      if (arg === "--as") as = value;
      else note = value;
      i += 1;
    } else if (arg.startsWith("--")) {
      throw new CloseOperationRefused(`unknown option ${arg}\nusage: ${CLOSE_OPERATION_USAGE}`);
    } else if (id === undefined) {
      id = arg;
    } else {
      throw new CloseOperationRefused(`unexpected argument ${arg}\nusage: ${CLOSE_OPERATION_USAGE}`);
    }
  }
  if (!id) throw new CloseOperationRefused(`missing the operation id\nusage: ${CLOSE_OPERATION_USAGE}`);
  if (!as || !(CLOSE_AS as readonly string[]).includes(as)) {
    throw new CloseOperationRefused(`--as must be one of ${CLOSE_AS.join(", ")}\nusage: ${CLOSE_OPERATION_USAGE}`);
  }
  return { id, as: as as CloseAs, note: note.trim() };
}

export interface CloseOperationResult {
  operation: Operation;
  /** What the operation's scopes still hold in the ledger; the close changes none of it. */
  holdings: Holding[];
  /** Child operations (a refill's transfer) still `open` or in `attention`: each needs its own decision. */
  children: Operation[];
}

/**
 * Refuses an unknown operation and any status other than `attention`. The previous `lastError` is kept inside the
 * new one so the record still says why the operation needed the operator.
 */
export async function closeOperation(
  journal: Journal,
  args: CloseOperationArgs,
  now: Date
): Promise<CloseOperationResult> {
  const current = await journal.getOperation(args.id);
  if (!current) throw new CloseOperationRefused(`no operation ${args.id} in the journal`);
  if (current.status !== "attention") {
    throw new CloseOperationRefused(
      `operation ${args.id} is ${current.status}, not attention; only an operation in attention is closed by hand`
    );
  }
  const note = args.note ? `: ${args.note}` : "";
  const was = current.lastError ? ` (was: ${current.lastError})` : "";
  const operation = await journal.updateOperation(args.id, {
    status: args.as,
    lastError: `closed by the operator as ${args.as} at ${now.toISOString()}${note}${was}`,
  });
  const holdings: Holding[] = [];
  for (const scope of operation.scopes) holdings.push(...(await journal.ledger.holdings({ scope })));
  const children = (await journal.listOperations({ parentId: operation.id })).filter(
    (child) => child.status === "open" || child.status === "attention"
  );
  return { operation, holdings, children };
}

function prettyJson(value: JsonValue): string {
  return JSON.stringify(value, null, 2);
}

function operationJson(operation: Operation): JsonValue {
  return {
    id: operation.id,
    kind: operation.kind,
    status: operation.status,
    step: operation.step,
    description: operation.description,
    pairId: operation.pairId ?? null,
    routeId: operation.routeId ?? null,
    parentId: operation.parentId ?? null,
    attempts: operation.attempts,
    lastError: operation.lastError,
    createdAt: operation.createdAt.toISOString(),
    updatedAt: operation.updatedAt.toISOString(),
  };
}

/** The JSON `close-operation` prints: the closed record, the scopes' holdings and the children left open. */
export function closeOperationJson(result: CloseOperationResult): string {
  return prettyJson({
    operation: operationJson(result.operation),
    holdings: result.holdings.map((h) => ({
      scope: { ...h.scope },
      chainId: h.chainId,
      asset: h.asset,
      location: h.location,
      /** Decimal string in the asset's smallest unit. */
      amount: h.amount.toString(),
    })),
    children: result.children.map(operationJson),
  });
}
