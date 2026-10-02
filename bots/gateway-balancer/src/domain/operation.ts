import type { AccountingScope } from "./accounting";
import type { JsonValue } from "./json";
import type { OperationId, PairId, RouteId } from "./types";

export type OperationKind = "refill" | "reporter-funding" | "rate-update" | "transfer";

export type OperationStatus =
  | "open"
  | "completed"
  | "failed"
  /** Ambiguous or unsafe to continue automatically; an operator must resolve it. */
  | "attention";

/**
 * The intent is recorded in the journal before any external side effect. `payload` and the step payload
 * are lane-defined, JSON-serializable (bigint allowed, see domain/json) and must never contain secrets.
 */
export interface OperationIntent {
  kind: OperationKind;
  description: string;
  scopes: AccountingScope[];
  pairId?: PairId;
  routeId?: RouteId;
  /** A child operation (e.g. a transfer started by a refill). */
  parentId?: OperationId;
  payload: JsonValue;
}

export interface Operation extends OperationIntent {
  id: OperationId;
  status: OperationStatus;
  /** Lane-defined step name; "created" until the first update. */
  step: string;
  stepPayload: JsonValue;
  attempts: number;
  lastError: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OperationUpdate {
  step?: string;
  stepPayload?: JsonValue;
  status?: OperationStatus;
  lastError?: string | null;
  incrementAttempts?: boolean;
}

export interface OperationFilter {
  status?: OperationStatus | OperationStatus[];
  kind?: OperationKind;
  pairId?: PairId;
  routeId?: RouteId;
  parentId?: OperationId;
}
