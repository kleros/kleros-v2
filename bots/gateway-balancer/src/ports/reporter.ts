import type { ReporterRoute } from "../config/schema";
import type { TxRequest } from "../domain";

export interface ReporterPreflight {
  ok: boolean;
  reasons: string[];
}

/** Funding of one Veashi reporter in its chain's native gas token. */
export interface ReporterFunding {
  balance(route: ReporterRoute): Promise<bigint>;
  /** Code present at the address, funding method supported, transfer simulates; never sends. */
  preflight(route: ReporterRoute): Promise<ReporterPreflight>;
  fundingTx(route: ReporterRoute, amount: bigint): Promise<TxRequest>;
}
