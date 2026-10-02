import type { ReporterRoute } from "../config/schema";
import type { TxRequest } from "../domain";
import type { ReporterFunding, ReporterPreflight } from "../ports";

export class FakeReporterFunding implements ReporterFunding {
  readonly balances = new Map<string, bigint>();
  readonly preflights = new Map<string, ReporterPreflight>();
  readonly funded: Array<{ routeId: string; amount: bigint }> = [];

  async balance(route: ReporterRoute): Promise<bigint> {
    return this.balances.get(route.id) ?? 0n;
  }

  async preflight(route: ReporterRoute): Promise<ReporterPreflight> {
    return this.preflights.get(route.id) ?? { ok: true, reasons: [] };
  }

  async fundingTx(route: ReporterRoute, amount: bigint): Promise<TxRequest> {
    this.funded.push({ routeId: route.id, amount });
    return { chainId: route.chainId, to: route.reporter, value: amount };
  }
}
