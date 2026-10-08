/**
 * The operator's two journal commands, both run with the bot stopped (they take journal ownership like `reconcile`):
 *
 * - `close-operation <id> --as failed|completed [--debit SPEC]... [--credit SPEC]... [--note "..."]`: the way out of
 *   `attention`, the one state the bot never leaves by itself. Applies the operator's ledger corrections, releases the
 *   operation's open claims (after a close nothing withdraws under them, and the next on-chain read is the truth),
 *   then sets the status with the operator's note kept on the record.
 * - `correct-ledger <id> (--debit SPEC | --credit SPEC)... --note "..."`: the same corrections for an operation that is
 *   already closed (`failed` or `completed`), when the ledger audit finds the chain and the ledger apart afterwards
 *   (a transaction that landed late, a hand swap of a released continuation token).
 *
 * A correction is `<scope>@<chainId>:<asset>[:<location>]=<amount>`, the amount in the asset's smallest unit (wei),
 * for example `arbitration:base-arbitrum@8453:native=1500000000000000` or
 * `bridging:base->arbitrum@8453:0x8335…2913:in-transit=25000000` (the full token address). The scope must be one of
 * the operation's own scopes, so a correction never lands on an unrelated holding. Every correction is validated
 * before anything is written (a debit never exceeds the holding), and each ledger entry carries the operation id and
 * the operator's note.
 */
import {
  scopeKey,
  type AccountingScope,
  type AssetAddress,
  type ChainId,
  type JsonValue,
  type Operation,
} from "../../domain";
import type { Claim, Holding, HoldingLocation, Journal } from "../../ports";

export const CLOSE_AS = ["failed", "completed"] as const;
export type CloseAs = (typeof CLOSE_AS)[number];

export interface Correction {
  direction: "debit" | "credit";
  scope: AccountingScope;
  chainId: ChainId;
  asset: AssetAddress;
  location: HoldingLocation;
  amount: bigint;
}

export interface CloseOperationArgs {
  id: string;
  as: CloseAs;
  note: string;
  corrections: Correction[];
}

export interface CorrectLedgerArgs {
  id: string;
  note: string;
  corrections: Correction[];
}

const SPEC = "<scope>@<chainId>:<asset>[:eoa|in-transit]=<amount in the smallest unit>";
export const CLOSE_OPERATION_USAGE =
  `close-operation <operation id> --as failed|completed [--debit ${SPEC}]... [--credit ${SPEC}]... ` +
  '[--note "what you verified on the explorer"]';
export const CORRECT_LEDGER_USAGE =
  `correct-ledger <operation id> (--debit ${SPEC} | --credit ${SPEC})... ` + '--note "why the ledger was wrong"';

/** A usage problem or a refused command: reported with exit code 2, never a stack trace. */
export class CloseOperationRefused extends Error {}

function parseScope(text: string): AccountingScope {
  const index = text.indexOf(":");
  const kind = index < 0 ? "" : text.slice(0, index);
  const rest = index < 0 ? "" : text.slice(index + 1);
  if (!rest) throw new Error(`scope "${text}" is not arbitration:<pair>, bridging:<route> or gas:<chainId>`);
  if (kind === "arbitration") return { kind, pairId: rest };
  if (kind === "bridging") return { kind, routeId: rest };
  if (kind === "gas" && /^\d+$/.test(rest)) return { kind, chainId: Number(rest) };
  throw new Error(`scope "${text}" is not arbitration:<pair>, bridging:<route> or gas:<chainId>`);
}

/** `<scope>@<chainId>:<asset>[:<location>]=<amount>`; throws with the reason. */
export function parseCorrection(direction: Correction["direction"], spec: string): Correction {
  const at = spec.lastIndexOf("@");
  const eq = spec.lastIndexOf("=");
  if (at <= 0 || eq < at) throw new Error(`--${direction} "${spec}" is not ${SPEC}`);
  const scope = parseScope(spec.slice(0, at));
  const parts = spec.slice(at + 1, eq).split(":");
  const amountText = spec.slice(eq + 1);
  if (parts.length < 2 || parts.length > 3 || !/^\d+$/.test(parts[0]!)) {
    throw new Error(`--${direction} "${spec}" is not ${SPEC}`);
  }
  const asset = parts[1]!;
  if (asset !== "native" && !/^0x[0-9a-fA-F]{40}$/.test(asset)) {
    throw new Error(`--${direction} "${spec}": the asset is "native" or a 0x token address`);
  }
  const location = parts[2] ?? "eoa";
  if (location !== "eoa" && location !== "in-transit") {
    throw new Error(`--${direction} "${spec}": the location is eoa or in-transit`);
  }
  if (!/^\d+$/.test(amountText) || BigInt(amountText) <= 0n) {
    throw new Error(`--${direction} "${spec}": the amount is a positive integer in the asset's smallest unit (wei)`);
  }
  return {
    direction,
    scope,
    chainId: Number(parts[0]),
    asset: asset as AssetAddress,
    location,
    amount: BigInt(amountText),
  };
}

/** `argv` after the command name; `--as` only for `close-operation`. */
function parseArgs(argv: readonly string[], usage: string, allowAs: boolean) {
  let id: string | undefined;
  let as: string | undefined;
  let note = "";
  const corrections: Correction[] = [];
  const refuse = (message: string): never => {
    throw new CloseOperationRefused(`${message}\nusage: ${usage}`);
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]!;
    const options = allowAs ? ["--as", "--note", "--debit", "--credit"] : ["--note", "--debit", "--credit"];
    if (options.includes(arg)) {
      const value = argv[i + 1];
      if (value === undefined) refuse(`${arg} needs a value`);
      i += 1;
      if (arg === "--as") as = value;
      else if (arg === "--note") note = value!;
      else {
        try {
          corrections.push(parseCorrection(arg === "--debit" ? "debit" : "credit", value!));
        } catch (error) {
          refuse((error as Error).message);
        }
      }
    } else if (arg.startsWith("--")) {
      refuse(`unknown option ${arg}`);
    } else if (id === undefined) {
      id = arg;
    } else {
      refuse(`unexpected argument ${arg}`);
    }
  }
  if (!id) refuse("missing the operation id");
  return { id: id!, as, note: note.trim(), corrections, refuse };
}

export function parseCloseOperationArgs(argv: readonly string[]): CloseOperationArgs {
  const { id, as, note, corrections, refuse } = parseArgs(argv, CLOSE_OPERATION_USAGE, true);
  if (!as || !(CLOSE_AS as readonly string[]).includes(as)) refuse(`--as must be one of ${CLOSE_AS.join(", ")}`);
  return { id, as: as as CloseAs, note, corrections };
}

export function parseCorrectLedgerArgs(argv: readonly string[]): CorrectLedgerArgs {
  const { id, note, corrections, refuse } = parseArgs(argv, CORRECT_LEDGER_USAGE, false);
  if (corrections.length === 0) refuse("at least one --debit or --credit is required");
  if (!note) refuse("--note is required: the ledger entries carry it as their reason");
  return { id, note, corrections };
}

export interface CloseOperationResult {
  operation: Operation;
  /** The corrections written to the ledger, in order (debits first). */
  corrections: Correction[];
  /** The operation's claims released by the close (none for `correct-ledger`). */
  releasedClaims: Claim[];
  /** What the operation's scopes hold in the ledger after the command. */
  holdings: Holding[];
  /** Child operations (a refill's transfer) still `open` or in `attention`: each needs its own decision. */
  children: Operation[];
  /** The parent when it is still in `attention` (a closed transfer leaves its refill or funding operation there). */
  parent: Operation | null;
}

function holdingKey(c: Pick<Correction, "scope" | "chainId" | "asset" | "location">): string {
  return `${scopeKey(c.scope)}|${c.chainId}|${c.asset.toLowerCase()}|${c.location}`;
}

/** Every check before any write: scopes of the operation, configured chains, debits within their holdings. */
async function validateCorrections(
  journal: Journal,
  operation: Operation,
  corrections: readonly Correction[],
  chainIds: ReadonlySet<ChainId>
): Promise<void> {
  const own = new Set(operation.scopes.map(scopeKey));
  const debits = new Map<string, { correction: Correction; total: bigint }>();
  for (const correction of corrections) {
    if (!own.has(scopeKey(correction.scope))) {
      throw new CloseOperationRefused(
        `${scopeKey(correction.scope)} is not a scope of operation ${operation.id} ` +
          `(its scopes: ${[...own].join(", ") || "none"})`
      );
    }
    if (!chainIds.has(correction.chainId)) {
      throw new CloseOperationRefused(`chain ${correction.chainId} is not in the topology`);
    }
    if (correction.direction === "debit") {
      const key = holdingKey(correction);
      const entry = debits.get(key) ?? { correction, total: 0n };
      entry.total += correction.amount;
      debits.set(key, entry);
    }
  }
  for (const { correction, total } of debits.values()) {
    const held = (
      await journal.ledger.holdings({
        scope: correction.scope,
        chainId: correction.chainId,
        asset: correction.asset,
        location: correction.location,
      })
    ).reduce((acc, h) => acc + h.amount, 0n);
    if (total > held) {
      throw new CloseOperationRefused(
        `cannot debit ${total} from ${scopeKey(correction.scope)} on chain ${correction.chainId} ` +
          `(${correction.asset}, ${correction.location}): it holds ${held}`
      );
    }
  }
}

async function applyCorrections(
  journal: Journal,
  operation: Operation,
  corrections: readonly Correction[],
  reason: string
): Promise<Correction[]> {
  const ordered = [
    ...corrections.filter((c) => c.direction === "debit"),
    ...corrections.filter((c) => c.direction === "credit"),
  ];
  for (const c of ordered) {
    const entry = {
      scope: c.scope,
      chainId: c.chainId,
      asset: c.asset,
      location: c.location,
      amount: c.amount,
      operationId: operation.id,
      reason,
    };
    if (c.direction === "debit") await journal.ledger.debit(entry);
    else await journal.ledger.credit(entry);
  }
  return ordered;
}

async function aftermath(journal: Journal, operation: Operation) {
  const holdings: Holding[] = [];
  for (const scope of operation.scopes) holdings.push(...(await journal.ledger.holdings({ scope })));
  const children = (await journal.listOperations({ parentId: operation.id })).filter(
    (child) => child.status === "open" || child.status === "attention"
  );
  const parentRecord = operation.parentId ? await journal.getOperation(operation.parentId) : undefined;
  const parent = parentRecord?.status === "attention" ? parentRecord : null;
  return { holdings, children, parent };
}

/**
 * Refuses an unknown operation and any status other than `attention`. Corrections first (validated as a whole), then
 * the open claims are released, then the status; the previous `lastError` is kept inside the new one so the record
 * still says why the operation needed the operator.
 */
export async function closeOperation(
  journal: Journal,
  args: CloseOperationArgs,
  now: Date,
  chainIds: ReadonlySet<ChainId>
): Promise<CloseOperationResult> {
  const current = await journal.getOperation(args.id);
  if (!current) throw new CloseOperationRefused(`no operation ${args.id} in the journal`);
  if (current.status !== "attention") {
    throw new CloseOperationRefused(
      `operation ${args.id} is ${current.status}, not attention; only an operation in attention is closed by hand`
    );
  }
  await validateCorrections(journal, current, args.corrections, chainIds);
  const note = args.note ? `: ${args.note}` : "";
  const corrections = await applyCorrections(
    journal,
    current,
    args.corrections,
    `operator correction at close (${args.as}) at ${now.toISOString()}${note}`
  );
  const releasedClaims = await journal.ledger.openClaimsOf(current.id);
  for (const claim of releasedClaims) await journal.ledger.releaseClaim(claim.id);
  const was = current.lastError ? ` (was: ${current.lastError})` : "";
  const operation = await journal.updateOperation(args.id, {
    status: args.as,
    lastError: `closed by the operator as ${args.as} at ${now.toISOString()}${note}${was}`,
  });
  return { operation, corrections, releasedClaims, ...(await aftermath(journal, operation)) };
}

/**
 * Corrections for an operation that is already `failed` or `completed`; never for an `open` one (its own steps still
 * move the ledger) or one in `attention` (close it with the corrections instead). The status is not changed.
 */
export async function correctLedger(
  journal: Journal,
  args: CorrectLedgerArgs,
  now: Date,
  chainIds: ReadonlySet<ChainId>
): Promise<CloseOperationResult> {
  const operation = await journal.getOperation(args.id);
  if (!operation) throw new CloseOperationRefused(`no operation ${args.id} in the journal`);
  if (operation.status === "open" || operation.status === "attention") {
    throw new CloseOperationRefused(
      `operation ${args.id} is ${operation.status}; correct-ledger is for a failed or completed operation` +
        (operation.status === "attention" ? " (close it with close-operation and the same corrections)" : "")
    );
  }
  await validateCorrections(journal, operation, args.corrections, chainIds);
  const corrections = await applyCorrections(
    journal,
    operation,
    args.corrections,
    `operator correction at ${now.toISOString()}: ${args.note}`
  );
  return { operation, corrections, releasedClaims: [], ...(await aftermath(journal, operation)) };
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

/** The JSON both commands print. Amounts are decimal strings in the asset's smallest unit. */
export function closeOperationJson(result: CloseOperationResult): string {
  return prettyJson({
    operation: operationJson(result.operation),
    corrections: result.corrections.map((c) => ({
      direction: c.direction,
      scope: scopeKey(c.scope),
      chainId: c.chainId,
      asset: c.asset,
      location: c.location,
      amount: c.amount.toString(),
    })),
    releasedClaims: result.releasedClaims.map((c) => ({ id: c.id, key: c.key, amount: c.amount.toString() })),
    holdings: result.holdings.map((h) => ({
      scope: scopeKey(h.scope),
      chainId: h.chainId,
      asset: h.asset,
      location: h.location,
      amount: h.amount.toString(),
    })),
    children: result.children.map(operationJson),
    parentInAttention: result.parent ? operationJson(result.parent) : null,
  });
}
