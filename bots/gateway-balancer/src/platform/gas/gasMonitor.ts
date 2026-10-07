import type { Topology } from "../../config/schema";
import type { Address, ChainId, Loop, TickContext, TickResult } from "../../domain";
import type { Journal, Logger, Notifier } from "../../ports";
import { readGasReserve, type ReserveRpc } from "./reserve";

export const GAS_MONITOR_ID = "gas-monitor";

export interface GasMonitorDeps {
  topology: Topology;
  /** Block-pinned reads per chain: the executor's RPC, so the monitor and the executor's refusal agree. */
  reserveRpc: ReadonlyMap<ChainId, ReserveRpc>;
  journal: Journal;
  notifier: Notifier;
  logger: Logger;
  signer: Address;
  minimumFor(chainId: ChainId): bigint;
}

/**
 * The EOA's transaction-gas reserve per chain, computed by `readGasReserve` exactly as the executor's pre-signing
 * check does: native balance minus the native `eoa` holdings the ledger assigns to scopes on that chain, minus the
 * maximum cost of unmined nonce-holding records. Records `gas:<chainId>` and warns (dedup per chain) below the
 * configured minimum. It only reads: the reserve is operator money and is never credited to the ledger.
 */
export function createGasMonitor(deps: GasMonitorDeps): Loop {
  return {
    id: GAS_MONITOR_ID,
    async tick(ctx: TickContext): Promise<TickResult> {
      const low: string[] = [];
      const errors: string[] = [];
      for (const chain of deps.topology.chains) {
        if (ctx.signal.aborted) break;
        const rpc = deps.reserveRpc.get(chain.id);
        if (!rpc) continue;
        try {
          const read = await readGasReserve({ rpc, journal: deps.journal, chainId: chain.id, signer: deps.signer });
          const { balanceWei: balance, ledgerHeldWei: held, inFlightWei: inFlight, reserveWei: reserve } = read;
          const minimum = deps.minimumFor(chain.id);
          await deps.journal.recordObservation(
            `gas:${chain.id}`,
            {
              chain: chain.name,
              symbol: chain.nativeSymbol,
              blockNumber: read.blockNumber,
              balanceWei: balance,
              ledgerHeldWei: held,
              inFlightWei: inFlight,
              reserveWei: reserve,
              minimumWei: minimum,
              low: reserve < minimum,
            },
            ctx.now
          );
          if (reserve < minimum) {
            low.push(chain.name);
            await deps.notifier.notify({
              severity: "warning",
              title: `Low gas reserve on ${chain.name}`,
              body:
                `The balancer EOA's gas reserve on ${chain.name} is ${reserve} wei (${chain.nativeSymbol}), ` +
                `below the minimum ${minimum}. Balance ${balance}, of which ${held} belongs to ledger scopes and ` +
                `${inFlight} is committed to unmined transactions.`,
              dedupKey: `gas-low:${chain.id}`,
              chainId: chain.id,
              action: `Send ${chain.nativeSymbol} for gas to ${deps.signer} on ${chain.name}.`,
            });
          }
        } catch (error) {
          errors.push(`${chain.name}: ${error instanceof Error ? error.message : String(error)}`);
          deps.logger.warn("gas reserve read failed", { chainId: chain.id, error });
        }
      }
      if (errors.length) return { status: "failed", summary: errors.join("; ") };
      return low.length
        ? { status: "acted", summary: `low gas on ${low.join(", ")}` }
        : { status: "idle", summary: "gas reserves above minimum" };
    },
  };
}
