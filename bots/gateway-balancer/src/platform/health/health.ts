import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { scopeKey, type JsonValue } from "../../domain";
import type { Journal, Logger, TxStatus } from "../../ports";

/** Observation prefixes every lane records (decisions.md); health groups by them. */
export const OBSERVATION_GROUPS = [
  "capacity",
  "withdrawable",
  "reporter",
  "price",
  "rate",
  "in-transit",
  "transfer-delta",
  "gas",
  "suspended",
] as const;

const NON_FINAL: TxStatus[] = ["prepared", "signed", "broadcast", "unknown"];

export interface StatusSnapshot {
  generatedAt: string;
  /** `attention` when any operation needs the operator. */
  status: "ok" | "attention";
  observations: Record<
    (typeof OBSERVATION_GROUPS)[number] | "other",
    Array<{ key: string; value: JsonValue; at: string }>
  >;
  holdings: Array<{ scope: string; chainId: number; asset: string; location: string; amount: string }>;
  operations: {
    open: OperationSummary[];
    attention: OperationSummary[];
  };
  transactions: Array<{
    idempotencyKey: string;
    operationId: string;
    chainId: number;
    status: TxStatus;
    nonce: number | null;
    hash: string | null;
    error: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
}

interface OperationSummary {
  id: string;
  kind: string;
  description: string;
  step: string;
  pairId: string | null;
  routeId: string | null;
  parentId: string | null;
  attempts: number;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Health reads only journal content (never configuration or the environment), so it cannot carry a secret. */
export async function collectStatus(journal: Journal, now: Date): Promise<StatusSnapshot> {
  const observations = Object.fromEntries(
    [...OBSERVATION_GROUPS, "other"].map((group) => [group, []])
  ) as unknown as StatusSnapshot["observations"];
  for (const observation of await journal.observations()) {
    const prefix = observation.key.split(":")[0] as (typeof OBSERVATION_GROUPS)[number];
    const group = OBSERVATION_GROUPS.includes(prefix) && observation.key.includes(":") ? prefix : "other";
    observations[group].push({ key: observation.key, value: observation.value, at: observation.at.toISOString() });
  }
  const summarize = (op: Awaited<ReturnType<Journal["listOperations"]>>[number]): OperationSummary => ({
    id: op.id,
    kind: op.kind,
    description: op.description,
    step: op.step,
    pairId: op.pairId ?? null,
    routeId: op.routeId ?? null,
    parentId: op.parentId ?? null,
    attempts: op.attempts,
    lastError: op.lastError,
    createdAt: op.createdAt.toISOString(),
    updatedAt: op.updatedAt.toISOString(),
  });
  const open = (await journal.listOperations({ status: "open" })).map(summarize);
  const attention = (await journal.listOperations({ status: "attention" })).map(summarize);
  const transactions = (await journal.listTransactions({ status: NON_FINAL })).map((tx) => ({
    idempotencyKey: tx.idempotencyKey,
    operationId: tx.operationId,
    chainId: tx.chainId,
    status: tx.status,
    nonce: tx.nonce,
    hash: tx.hash,
    error: tx.error,
    createdAt: tx.createdAt.toISOString(),
    updatedAt: tx.updatedAt.toISOString(),
  }));
  const holdings = (await journal.ledger.holdings()).map((h) => ({
    scope: scopeKey(h.scope),
    chainId: h.chainId,
    asset: h.asset,
    location: h.location,
    amount: h.amount.toString(),
  }));
  return {
    generatedAt: now.toISOString(),
    status: attention.length ? "attention" : "ok",
    observations,
    holdings,
    operations: { open, attention },
    transactions,
  };
}

/** JSON with bigints as decimal strings. */
export function statusJson(snapshot: StatusSnapshot, indent?: number): string {
  return JSON.stringify(
    snapshot,
    (_key, value: unknown) => (typeof value === "bigint" ? value.toString() : value),
    indent
  );
}

export interface HealthServer {
  port: number;
  close(): Promise<void>;
}

/**
 * `GET /healthz`: the status snapshot as JSON. Always 200 while the journal is readable (an operation in attention
 * is reported in `status`, not as a failing probe, since a restart would not resolve it); 500 when it is not.
 */
export async function startHealthServer(options: {
  host: string;
  port: number;
  journal: Journal;
  now: () => Date;
  logger: Logger;
}): Promise<HealthServer> {
  const server: Server = createServer((request, response) => {
    if (request.method !== "GET" || (request.url ?? "").split("?")[0] !== "/healthz") {
      response.writeHead(404, { "content-type": "application/json" }).end('{"error":"not found"}');
      return;
    }
    collectStatus(options.journal, options.now()).then(
      (snapshot) => {
        response.writeHead(200, { "content-type": "application/json" }).end(statusJson(snapshot));
      },
      (error: unknown) => {
        options.logger.error("health: cannot read the journal", { error });
        response.writeHead(500, { "content-type": "application/json" }).end('{"error":"journal unavailable"}');
      }
    );
  });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(options.port, options.host, () => resolve());
  });
  return {
    port: (server.address() as AddressInfo).port,
    close: () =>
      new Promise<void>((resolve) => {
        server.closeAllConnections();
        server.close(() => resolve());
      }),
  };
}
