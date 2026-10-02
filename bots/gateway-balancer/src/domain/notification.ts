import type { ChainId, Hex, OperationId, PairId, RouteId } from "./types";

export type Severity = "info" | "warning" | "critical";

export interface Notification {
  severity: Severity;
  title: string;
  body: string;
  /** Same key within the configured window: delivered once. */
  dedupKey: string;
  pairId?: PairId;
  routeId?: RouteId;
  chainId?: ChainId;
  operationId?: OperationId;
  txHashes?: Hex[];
  /** What the operator should do, when anything. */
  action?: string;
}
