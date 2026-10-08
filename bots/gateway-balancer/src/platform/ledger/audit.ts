import type { Topology } from "../../config/schema";
import { NATIVE, type Address, type ChainId, type Loop, type TickContext, type TickResult } from "../../domain";
import type { ChainClient, Journal, Logger, Notifier } from "../../ports";
import { readGasReserve, type ReserveRpc } from "../gas/reserve";

export const LEDGER_AUDIT_ID = "ledger-audit";

/**
 * `ok`: the chain covers the ledger. `over`: the ledger says the EOA holds more than the chain shows (always an
 * error). `pending`: the EOA holds a token the ledger does not, while an operation is open (a delivery not yet
 * credited). `untracked`: the same with no operation open.
 */
export type LedgerAuditState = "ok" | "over" | "pending" | "untracked";

export interface LedgerAuditDeps {
  topology: Topology;
  chains: ReadonlyMap<ChainId, ChainClient>;
  /** Block-pinned native reads, shared with the executor and the gas monitor. */
  reserveRpc: ReadonlyMap<ChainId, ReserveRpc>;
  journal: Journal;
  notifier: Notifier;
  logger: Logger;
  signer: Address;
}

/**
 * Compares the ledger's `eoa` holdings with the chain, per chain and asset. The ledger never credits before the chain
 * does (a credit follows a confirmed receipt or a verified balance rise) and always debits before a send, so what the
 * ledger assigns to scopes can never exceed what the EOA holds:
 *
 * - native: the ledger's native `eoa` holdings plus what unmined transactions can still spend must fit in the
 *   balance, i.e. the gas reserve is not negative. A surplus is the operator's gas float and cannot be told apart
 *   from an uncredited delivery; only the `over` direction is checked.
 * - every token the ledger holds on the chain, every collected ERC20 and the wrapped native token: the ledger's total
 *   must not exceed `balanceOf`, and a surplus is reported (`pending` while an operation is open, else `untracked`).
 *
 * `over` raises a critical per chain and asset; `untracked` a warning. Each result is recorded as
 * `ledger:<chainId>:<asset>`, which `status` and `/healthz` show (an `over` makes the status `attention`). Read-only.
 */
export function createLedgerAudit(deps: LedgerAuditDeps): Loop {
  return {
    id: LEDGER_AUDIT_ID,
    async tick(ctx: TickContext): Promise<TickResult> {
      const findings: string[] = [];
      const errors: string[] = [];
      const anyOpen = (await deps.journal.listOperations({ status: "open" })).length > 0;
      for (const chain of deps.topology.chains) {
        if (ctx.signal.aborted) break;
        try {
          findings.push(...(await auditChain(deps, chain, anyOpen, ctx.now)));
        } catch (error) {
          errors.push(`${chain.name}: ${error instanceof Error ? error.message : String(error)}`);
          deps.logger.warn("ledger audit read failed", { chainId: chain.id, error });
        }
      }
      if (errors.length) return { status: "failed", summary: errors.join("; ") };
      return findings.length
        ? { status: "acted", summary: findings.join("; ") }
        : { status: "idle", summary: "ledger matches the chain" };
    },
  };
}

type ChainConfig = Topology["chains"][number];

function tokensOf(topology: Topology, chain: ChainConfig): Map<string, string> {
  const tokens = new Map<string, string>();
  for (const pair of topology.pairs) {
    for (const asset of pair.collectedAssets) {
      if (asset.chainId === chain.id && asset.address !== NATIVE) tokens.set(asset.address.toLowerCase(), asset.symbol);
    }
  }
  if (chain.wrappedNative) tokens.set(chain.wrappedNative.toLowerCase(), `W${chain.nativeSymbol}`);
  return tokens;
}

async function auditChain(deps: LedgerAuditDeps, chain: ChainConfig, anyOpen: boolean, now: Date): Promise<string[]> {
  const findings: string[] = [];
  const { journal, notifier, signer } = deps;
  const rpc = deps.reserveRpc.get(chain.id);
  if (rpc) {
    const read = await readGasReserve({ rpc, journal, chainId: chain.id, signer });
    const state: LedgerAuditState = read.reserveWei < 0n ? "over" : "ok";
    await journal.recordObservation(
      `ledger:${chain.id}:${NATIVE}`,
      {
        chain: chain.name,
        asset: NATIVE,
        symbol: chain.nativeSymbol,
        blockNumber: read.blockNumber,
        ledgerEoa: read.ledgerHeldWei,
        inFlight: read.inFlightWei,
        onChain: read.balanceWei,
        state,
      },
      now
    );
    if (state === "over") {
      const short = -read.reserveWei;
      findings.push(`${chain.name} ${chain.nativeSymbol} over by ${short}`);
      await notifier.notify({
        severity: "critical",
        title: `Ledger holds more ${chain.nativeSymbol} than the EOA on ${chain.name}`,
        body:
          `The ledger assigns ${read.ledgerHeldWei} wei of ${chain.nativeSymbol} to scopes on ${chain.name} and ` +
          `unmined transactions can spend ${read.inFlightWei} more, but the EOA holds ${read.balanceWei} ` +
          `(block ${read.blockNumber}): ${short} wei the ledger counts is not on chain. The executor refuses every ` +
          `transaction on ${chain.name} until the two agree.`,
        dedupKey: `ledger-over:${chain.id}:${NATIVE}`,
        chainId: chain.id,
        action:
          "Find the transaction that moved the funds (a hand transaction from the EOA, a credit without a receipt). " +
          "If it belongs to an operation, correct the ledger with close-operation or correct-ledger " +
          '(RUNBOOK.md, "When the bot asks for you"); if it was gas, send the missing amount back to the EOA.',
      });
    }
  }
  const client = deps.chains.get(chain.id);
  if (!client) return findings;
  const tokens = tokensOf(deps.topology, chain);
  const held = new Map<string, bigint>();
  for (const h of await journal.ledger.holdings({ chainId: chain.id, location: "eoa" })) {
    if (h.asset === NATIVE) continue;
    const key = h.asset.toLowerCase();
    held.set(key, (held.get(key) ?? 0n) + h.amount);
    if (!tokens.has(key)) tokens.set(key, `token ${h.asset}`);
  }
  for (const [token, symbol] of tokens) {
    const ledgerEoa = held.get(token) ?? 0n;
    const onChain = await client.getErc20Balance(token as Address, signer);
    const state: LedgerAuditState =
      ledgerEoa > onChain ? "over" : onChain > ledgerEoa ? (anyOpen ? "pending" : "untracked") : "ok";
    await journal.recordObservation(
      `ledger:${chain.id}:${token}`,
      { chain: chain.name, asset: token, symbol, ledgerEoa, onChain, state },
      now
    );
    if (state === "over") {
      findings.push(`${chain.name} ${symbol} over by ${ledgerEoa - onChain}`);
      await notifier.notify({
        severity: "critical",
        title: `Ledger holds more ${symbol} than the EOA on ${chain.name}`,
        body:
          `The ledger assigns ${ledgerEoa} of ${symbol} (${token}) to scopes on ${chain.name}, but the EOA holds ` +
          `${onChain}: ${ledgerEoa - onChain} the ledger counts is not on chain. A transfer of it would revert.`,
        dedupKey: `ledger-over:${chain.id}:${token}`,
        chainId: chain.id,
        action:
          "Find the transaction that moved the tokens (a hand swap of a released continuation token, a transfer " +
          "from the EOA) and correct the ledger with close-operation or correct-ledger on its operation " +
          '(RUNBOOK.md, "When the bot asks for you").',
      });
    } else if (state === "untracked") {
      findings.push(`${chain.name} ${symbol} untracked ${onChain - ledgerEoa}`);
      await notifier.notify({
        severity: "warning",
        title: `${symbol} in the EOA that no scope holds on ${chain.name}`,
        body:
          `The EOA holds ${onChain} of ${symbol} (${token}) on ${chain.name}; the ledger assigns ${ledgerEoa} to ` +
          `scopes and no operation is open, so ${onChain - ledgerEoa} is not accounted for. The bot never spends it.`,
        dedupKey: `ledger-untracked:${chain.id}:${token}`,
        chainId: chain.id,
        action:
          "If it is a delivery the bot missed (a transaction that landed after its operation was closed), credit it " +
          "to that operation's scope with correct-ledger; otherwise move it out of the EOA by hand.",
      });
    }
  }
  return findings;
}
