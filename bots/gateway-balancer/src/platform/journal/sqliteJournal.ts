import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import type { DatabaseSync, SQLInputValue } from "node:sqlite";
import {
  parseJson,
  parseScopeKey,
  scopeKey,
  stringifyJson,
  type JsonValue,
  type Operation,
  type OperationFilter,
  type OperationId,
  type OperationIntent,
  type OperationUpdate,
} from "../../domain";
import {
  DuplicateTransaction,
  InsufficientClaimable,
  InsufficientHolding,
  UnknownRecord,
  type Claim,
  type Holding,
  type HoldingEntry,
  type HoldingFilter,
  type Journal,
  type Ledger,
  type NewTransactionRecord,
  type NotificationLogEntry,
  type Observation,
  type SpendEntry,
  type SpendFilter,
  type TransactionFilter,
  type TransactionRecord,
  type TransactionUpdate,
} from "../../ports";
import type { Redactor } from "../redact";

/**
 * `import "node:sqlite"` fails under vitest 2.1.9 (vite-node strips the `node:` prefix), so the module is loaded
 * through `process.getBuiltinModule`.
 */
function sqlite(): typeof import("node:sqlite") {
  return process.getBuiltinModule("node:sqlite");
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS owner (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  instance_id TEXT NOT NULL,
  pid INTEGER NOT NULL,
  started_at TEXT NOT NULL,
  heartbeat_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS operations (
  seq INTEGER PRIMARY KEY AUTOINCREMENT,
  id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  kind TEXT NOT NULL,
  pair_id TEXT,
  route_id TEXT,
  parent_id TEXT,
  record TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS transactions (
  seq INTEGER PRIMARY KEY AUTOINCREMENT,
  idempotency_key TEXT NOT NULL UNIQUE,
  operation_id TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  status TEXT NOT NULL,
  record TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS claims (
  seq INTEGER PRIMARY KEY AUTOINCREMENT,
  id TEXT NOT NULL UNIQUE,
  key TEXT NOT NULL,
  amount TEXT NOT NULL,
  operation_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  state TEXT NOT NULL,
  actual_amount TEXT
);
CREATE TABLE IF NOT EXISTS holding_entries (
  seq INTEGER PRIMARY KEY AUTOINCREMENT,
  scope TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  asset TEXT NOT NULL,
  asset_key TEXT NOT NULL,
  location TEXT NOT NULL,
  amount TEXT NOT NULL,
  operation_id TEXT NOT NULL,
  reason TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS spends (
  seq INTEGER PRIMARY KEY AUTOINCREMENT,
  chain_id INTEGER NOT NULL,
  asset_key TEXT NOT NULL,
  category TEXT NOT NULL,
  amount TEXT NOT NULL,
  operation_id TEXT NOT NULL,
  at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS observations (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS notify_hits (
  key TEXT PRIMARY KEY,
  at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS notifications (
  seq INTEGER PRIMARY KEY AUTOINCREMENT,
  entry TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS operations_status ON operations (status);
CREATE INDEX IF NOT EXISTS transactions_status ON transactions (status, chain_id);
CREATE INDEX IF NOT EXISTS claims_key ON claims (key, state);
CREATE INDEX IF NOT EXISTS holding_entries_key ON holding_entries (scope, chain_id, asset_key, location);
`;

export class OwnershipConflict extends Error {
  constructor(public readonly owner: OwnerRow) {
    super(
      `the journal is owned by another running instance (pid ${owner.pid}, started ${owner.startedAt}, ` +
        `heartbeat ${new Date(owner.heartbeatAt).toISOString()}); stop it first or wait for it to go stale`
    );
    this.name = "OwnershipConflict";
  }
}

/** Thrown by every journal mutation once another instance holds the `owner` row (a takeover while paused). */
export class LostOwnership extends Error {
  constructor(
    public readonly instanceId: string,
    public readonly owner: OwnerRow | undefined
  ) {
    super(
      `lost ownership of the journal: the owner row now holds ` +
        (owner ? `instance ${owner.instanceId} (pid ${owner.pid}, started ${owner.startedAt})` : "no instance") +
        ` instead of this instance ${instanceId}; this instance must stop`
    );
    this.name = "LostOwnership";
  }
}

/**
 * The error a plain read-only open produces after a clean close removed `-wal` and `-shm` and the reader cannot
 * create `-shm` (SQLITE_READONLY_DIRECTORY or SQLITE_READONLY_CANTINIT). Only this case falls back to `immutable=1`.
 */
function isCleanCloseReadOnlyError(error: unknown, path: string): boolean {
  const code = (error as { errcode?: unknown } | null)?.errcode;
  return (code === 1544 || code === 1288) && !existsSync(`${path}-wal`);
}

export class ReadOnlyJournal extends Error {
  constructor(method: string) {
    super(`the journal is open read-only (status); ${method} is not allowed`);
    this.name = "ReadOnlyJournal";
  }
}

export interface OwnerRow {
  instanceId: string;
  pid: number;
  startedAt: string;
  heartbeatAt: number;
}

export interface Ownership {
  /** Random per process start: liveness is never judged by pid alone, so pid reuse after a crash is harmless. */
  instanceId: string;
  pid: number;
  startedAt: Date;
  staleAfterMs: number;
}

export interface SqliteJournalOptions {
  now?: () => Date;
  /** Applied to every string stored (errors, observation values, notification entries, payloads). */
  redactor: Pick<Redactor, "text" | "json">;
  /** How long the read-only `status` open waits on a transient lock before it reports it (default 2000 ms). */
  readOnlyBusyTimeoutMs?: number;
}

const READ_ONLY_BUSY_TIMEOUT_MS = 2_000;

type Row = Record<string, SQLInputValue>;

function iso(date: Date): string {
  return date.toISOString();
}

function holdingFilterSql(filter: HoldingFilter): { where: string; args: SQLInputValue[] } {
  const clauses: string[] = [];
  const args: SQLInputValue[] = [];
  if (filter.scope) {
    clauses.push("scope = ?");
    args.push(scopeKey(filter.scope));
  }
  if (filter.chainId !== undefined) {
    clauses.push("chain_id = ?");
    args.push(filter.chainId);
  }
  if (filter.asset !== undefined) {
    clauses.push("asset_key = ?");
    args.push(filter.asset.toLowerCase());
  }
  if (filter.location !== undefined) {
    clauses.push("location = ?");
    args.push(filter.location);
  }
  return { where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "", args };
}

function statusSql(column: string, wanted: string | string[] | undefined, clauses: string[], args: SQLInputValue[]) {
  if (wanted === undefined) return;
  const list = Array.isArray(wanted) ? wanted : [wanted];
  if (list.length === 0) {
    clauses.push("0");
    return;
  }
  clauses.push(`${column} IN (${list.map(() => "?").join(", ")})`);
  args.push(...list);
}

/**
 * The SQLite journal. Mirrors `FakeJournal`: one table per record kind with the record as JSON (bigints through
 * `domain/json`); claims, holding entries and spends are append-only rows with decimal TEXT amounts, totalled in
 * JS bigint inside one `BEGIN IMMEDIATE` transaction, never with SQL `SUM()`. WAL mode keeps readers unblocked;
 * single-instance ownership is the `owner` row.
 */
export class SqliteJournal implements Journal {
  readonly ledger: Ledger;
  private closed = false;
  private readonly now: () => Date;

  private constructor(
    private readonly db: DatabaseSync | null,
    private readonly options: SqliteJournalOptions,
    private readonly readOnly: boolean,
    private readonly ownership: Ownership | null
  ) {
    this.now = options.now ?? (() => new Date());
    this.ledger = new SqliteLedger(this);
  }

  /**
   * Opens (creating if needed) the journal for writing and acquires the `owner` row; throws `OwnershipConflict`.
   * With `acquire: false` the row is taken later by `acquire()` (the platform does it at the start of `run`); until
   * then every mutation is fenced out.
   */
  static open(
    path: string,
    ownership: Ownership,
    options: SqliteJournalOptions,
    { acquire = true }: { acquire?: boolean } = {}
  ): SqliteJournal {
    const { DatabaseSync } = sqlite();
    const db = new DatabaseSync(path);
    try {
      db.exec("PRAGMA journal_mode = WAL; PRAGMA synchronous = FULL; PRAGMA busy_timeout = 5000;");
      db.exec(SCHEMA);
      const journal = new SqliteJournal(db, options, false, ownership);
      if (acquire) journal.acquire();
      return journal;
    } catch (error) {
      db.close();
      throw error;
    }
  }

  /**
   * Read-only access for `status`: takes no ownership and writes nothing. A missing file or missing tables read as
   * an empty journal. Falls back to an `immutable` open only for the error a clean close produces when `-shm`
   * cannot be created (see `isCleanCloseReadOnlyError`); any other error (lock, corruption) is reported.
   */
  static openReadOnly(path: string, options: SqliteJournalOptions): SqliteJournal {
    if (!existsSync(path)) return new SqliteJournal(null, options, true, null);
    const { DatabaseSync } = sqlite();
    // A checkpoint or the writer's recovery can hold a lock for a moment: wait for it rather than fail `status`.
    const busyMs = Math.max(0, Math.floor(options.readOnlyBusyTimeoutMs ?? READ_ONLY_BUSY_TIMEOUT_MS));
    const busyTimeout = `PRAGMA busy_timeout = ${busyMs};`;
    let db: DatabaseSync | undefined;
    try {
      db = new DatabaseSync(path, { readOnly: true });
      db.exec(busyTimeout);
      db.prepare("SELECT count(*) FROM sqlite_master").get();
    } catch (error) {
      db?.close();
      if (!isCleanCloseReadOnlyError(error, path)) throw error;
      const url = pathToFileURL(path);
      url.searchParams.set("immutable", "1");
      db = new DatabaseSync(url, { readOnly: true });
      db.exec(busyTimeout);
    }
    return new SqliteJournal(db, options, true, null);
  }

  get redactor(): SqliteJournalOptions["redactor"] {
    return this.options.redactor;
  }

  get currentTime(): Date {
    return this.now();
  }

  // ---- ownership -------------------------------------------------------------------------------------------

  /** The current owner row, if any (read-only safe). */
  owner(): OwnerRow | undefined {
    const row = this.get("SELECT instance_id, pid, started_at, heartbeat_at FROM owner WHERE id = 1");
    if (!row) return undefined;
    return {
      instanceId: String(row.instance_id),
      pid: Number(row.pid),
      startedAt: String(row.started_at),
      heartbeatAt: Number(row.heartbeat_at),
    };
  }

  /** Takes the `owner` row when it is absent, stale or already ours; throws `OwnershipConflict` otherwise. */
  acquire(): void {
    const ownership = this.requireOwnership();
    this.transaction(() => {
      const current = this.owner();
      const nowMs = this.now().getTime();
      if (
        current &&
        current.instanceId !== ownership.instanceId &&
        nowMs - current.heartbeatAt < ownership.staleAfterMs
      ) {
        throw new OwnershipConflict(current);
      }
      this.writer()
        .prepare(
          `INSERT INTO owner (id, instance_id, pid, started_at, heartbeat_at) VALUES (1, ?, ?, ?, ?)
           ON CONFLICT (id) DO UPDATE SET instance_id = excluded.instance_id, pid = excluded.pid,
             started_at = excluded.started_at, heartbeat_at = excluded.heartbeat_at`
        )
        .run(ownership.instanceId, ownership.pid, iso(ownership.startedAt), nowMs);
    });
  }

  /** Refreshes the heartbeat; `lost` when another instance id holds the row (this instance must stop). */
  heartbeat(): "ok" | "lost" {
    const ownership = this.requireOwnership();
    return this.transaction(() => {
      const current = this.owner();
      if (!current || current.instanceId !== ownership.instanceId) return "lost";
      this.writer()
        .prepare("UPDATE owner SET heartbeat_at = ? WHERE id = 1 AND instance_id = ?")
        .run(this.now().getTime(), ownership.instanceId);
      return "ok";
    });
  }

  private requireOwnership(): Ownership {
    if (!this.ownership) throw new ReadOnlyJournal("ownership");
    return this.ownership;
  }

  // ---- operations ------------------------------------------------------------------------------------------

  async createOperation(intent: OperationIntent): Promise<Operation> {
    const at = this.now();
    const redactor = this.options.redactor;
    const operation: Operation = {
      ...intent,
      description: redactor.text(intent.description),
      scopes: intent.scopes.map((s) => ({ ...s })),
      payload: redactor.json(intent.payload),
      id: `op-${randomUUID()}`,
      status: "open",
      step: "created",
      stepPayload: null,
      attempts: 0,
      lastError: null,
      createdAt: at,
      updatedAt: at,
    };
    this.immediate(() =>
      this.writer()
        .prepare(
          "INSERT INTO operations (id, status, kind, pair_id, route_id, parent_id, record) VALUES (?, ?, ?, ?, ?, ?, ?)"
        )
        .run(
          operation.id,
          operation.status,
          operation.kind,
          operation.pairId ?? null,
          operation.routeId ?? null,
          operation.parentId ?? null,
          encodeOperation(operation)
        )
    );
    return decodeOperation(encodeOperation(operation));
  }

  async getOperation(id: OperationId): Promise<Operation | undefined> {
    const row = this.get("SELECT record FROM operations WHERE id = ?", id);
    return row ? decodeOperation(String(row.record)) : undefined;
  }

  async listOperations(filter: OperationFilter = {}): Promise<Operation[]> {
    const clauses: string[] = [];
    const args: SQLInputValue[] = [];
    statusSql("status", filter.status, clauses, args);
    for (const [column, value] of [
      ["kind", filter.kind],
      ["pair_id", filter.pairId],
      ["route_id", filter.routeId],
      ["parent_id", filter.parentId],
    ] as const) {
      if (value === undefined) continue;
      clauses.push(`${column} = ?`);
      args.push(value);
    }
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    return this.all(`SELECT record FROM operations ${where} ORDER BY seq`, ...args).map((r) =>
      decodeOperation(String(r.record))
    );
  }

  async updateOperation(id: OperationId, update: OperationUpdate): Promise<Operation> {
    const redactor = this.options.redactor;
    return this.immediate(() => {
      const row = this.get("SELECT record FROM operations WHERE id = ?", id);
      if (!row) throw new UnknownRecord("operation", id);
      const operation = decodeOperation(String(row.record));
      if (update.step !== undefined) operation.step = redactor.text(update.step);
      if (update.stepPayload !== undefined) operation.stepPayload = redactor.json(update.stepPayload);
      if (update.status !== undefined) operation.status = update.status;
      if (update.lastError !== undefined) {
        operation.lastError = update.lastError === null ? null : redactor.text(update.lastError);
      }
      if (update.incrementAttempts) operation.attempts += 1;
      operation.updatedAt = this.now();
      const encoded = encodeOperation(operation);
      this.writer()
        .prepare("UPDATE operations SET status = ?, record = ? WHERE id = ?")
        .run(operation.status, encoded, id);
      return decodeOperation(encoded);
    });
  }

  // ---- transactions ----------------------------------------------------------------------------------------

  async recordTransaction(record: NewTransactionRecord): Promise<TransactionRecord> {
    const at = this.now();
    const stored: TransactionRecord = {
      ...record,
      error: record.error === null ? null : this.options.redactor.text(record.error),
      createdAt: at,
      updatedAt: at,
    };
    return this.immediate(() => {
      if (this.get("SELECT 1 AS x FROM transactions WHERE idempotency_key = ?", record.idempotencyKey)) {
        throw new DuplicateTransaction(record.idempotencyKey);
      }
      const encoded = encodeTransaction(stored);
      this.writer()
        .prepare(
          "INSERT INTO transactions (idempotency_key, operation_id, chain_id, status, record) VALUES (?, ?, ?, ?, ?)"
        )
        .run(stored.idempotencyKey, stored.operationId, stored.chainId, stored.status, encoded);
      return decodeTransaction(encoded);
    });
  }

  async updateTransaction(idempotencyKey: string, update: TransactionUpdate): Promise<TransactionRecord> {
    return this.immediate(() => {
      const row = this.get("SELECT record FROM transactions WHERE idempotency_key = ?", idempotencyKey);
      if (!row) throw new UnknownRecord("transaction", idempotencyKey);
      const stored = decodeTransaction(String(row.record));
      const next: TransactionRecord = { ...stored, ...update, updatedAt: this.now() };
      if (update.error !== undefined && update.error !== null) next.error = this.options.redactor.text(update.error);
      const encoded = encodeTransaction(next);
      this.writer()
        .prepare("UPDATE transactions SET status = ?, record = ? WHERE idempotency_key = ?")
        .run(next.status, encoded, idempotencyKey);
      return decodeTransaction(encoded);
    });
  }

  async getTransaction(idempotencyKey: string): Promise<TransactionRecord | undefined> {
    const row = this.get("SELECT record FROM transactions WHERE idempotency_key = ?", idempotencyKey);
    return row ? decodeTransaction(String(row.record)) : undefined;
  }

  async listTransactions(filter: TransactionFilter = {}): Promise<TransactionRecord[]> {
    const clauses: string[] = [];
    const args: SQLInputValue[] = [];
    statusSql("status", filter.status, clauses, args);
    if (filter.operationId !== undefined) {
      clauses.push("operation_id = ?");
      args.push(filter.operationId);
    }
    if (filter.chainId !== undefined) {
      clauses.push("chain_id = ?");
      args.push(filter.chainId);
    }
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    return this.all(`SELECT record FROM transactions ${where} ORDER BY seq`, ...args).map((r) =>
      decodeTransaction(String(r.record))
    );
  }

  // ---- observations and notifications ----------------------------------------------------------------------

  async recordObservation(key: string, value: JsonValue, at: Date): Promise<void> {
    const redactor = this.options.redactor;
    this.immediate(() =>
      this.writer()
        .prepare(
          `INSERT INTO observations (key, value, at) VALUES (?, ?, ?)
           ON CONFLICT (key) DO UPDATE SET value = excluded.value, at = excluded.at`
        )
        .run(redactor.text(key), stringifyJson(redactor.json(value)), at.getTime())
    );
  }

  async observations(prefix = ""): Promise<Observation[]> {
    return this.all("SELECT key, value, at FROM observations WHERE substr(key, 1, ?) = ?", prefix.length, prefix)
      .map((r) => ({ key: String(r.key), value: parseJson(String(r.value)), at: new Date(Number(r.at)) }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }

  async shouldNotify(dedupKey: string, windowSeconds: number, now: Date): Promise<boolean> {
    return this.immediate(() => {
      const row = this.get("SELECT at FROM notify_hits WHERE key = ?", dedupKey);
      if (row && now.getTime() - Number(row.at) < windowSeconds * 1000) return false;
      const writer = this.writer();
      writer
        .prepare("INSERT INTO notify_hits (key, at) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET at = excluded.at")
        .run(dedupKey, now.getTime());
      // Rows older than the window suppress nothing any more (the notifier uses one window): prune them so the
      // table does not grow with every distinct key (decisions [L47]).
      writer.prepare("DELETE FROM notify_hits WHERE at <= ?").run(now.getTime() - windowSeconds * 1000);
      return true;
    });
  }

  /**
   * Undoes the hit `shouldNotify` recorded at `at` for `dedupKey` (not on the port): the notifier calls it when every
   * provider failed, so the next occurrence is delivered instead of being suppressed for the whole window.
   */
  forgetNotifyHit(dedupKey: string, at: Date): void {
    this.immediate(() =>
      this.writer().prepare("DELETE FROM notify_hits WHERE key = ? AND at = ?").run(dedupKey, at.getTime())
    );
  }

  async recordNotification(entry: NotificationLogEntry): Promise<void> {
    const redactor = this.options.redactor;
    const stored = redactor.json({
      notification: entry.notification as unknown as JsonValue,
      at: iso(entry.at),
      delivered: entry.delivered,
      providers: entry.providers,
      suppressed: entry.suppressed,
    });
    this.immediate(() =>
      this.writer().prepare("INSERT INTO notifications (entry) VALUES (?)").run(stringifyJson(stored))
    );
  }

  async listNotifications(limit = 100): Promise<NotificationLogEntry[]> {
    return this.all("SELECT entry FROM notifications ORDER BY seq DESC LIMIT ?", limit).map((r) => {
      const parsed = parseJson(String(r.entry)) as unknown as NotificationLogEntry & { at: string };
      return { ...parsed, at: new Date(parsed.at) };
    });
  }

  /** Releases the `owner` row and closes; WAL files are checkpointed away on a clean close. */
  async close(): Promise<void> {
    if (this.closed) return;
    this.closed = true;
    if (!this.db) return;
    if (!this.readOnly && this.ownership) {
      try {
        this.db.prepare("DELETE FROM owner WHERE id = 1 AND instance_id = ?").run(this.ownership.instanceId);
        this.db.exec("PRAGMA wal_checkpoint(TRUNCATE)");
      } catch {
        // Closing anyway; the next instance takes over a stale row.
      }
    }
    this.db.close();
  }

  // ---- internals shared with the ledger --------------------------------------------------------------------

  writer(): DatabaseSync {
    if (this.readOnly || !this.db) throw new ReadOnlyJournal("writing");
    if (this.closed) throw new Error("the journal is closed");
    return this.db;
  }

  /**
   * Every mutation runs here: one `BEGIN IMMEDIATE` transaction that first re-checks the `owner` row still holds this
   * instance's id (fencing: a paused process resuming after a takeover throws `LostOwnership` and writes nothing).
   * `fn` is synchronous, so no transaction spans an await.
   */
  immediate<T>(fn: () => T): T {
    const ownership = this.requireOwnership();
    return this.transaction(() => {
      const current = this.owner();
      if (!current || current.instanceId !== ownership.instanceId) {
        throw new LostOwnership(ownership.instanceId, current);
      }
      return fn();
    });
  }

  /** `BEGIN IMMEDIATE` without the owner check: only for acquiring the row and the heartbeat. */
  private transaction<T>(fn: () => T): T {
    const db = this.writer();
    db.exec("BEGIN IMMEDIATE");
    try {
      const result = fn();
      db.exec("COMMIT");
      return result;
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }

  /** A read; a missing database or table (read-only `status` on an empty volume) reads as nothing. */
  all(sql: string, ...args: SQLInputValue[]): Row[] {
    if (!this.db) return [];
    if (this.closed) throw new Error("the journal is closed");
    try {
      return this.db.prepare(sql).all(...args) as Row[];
    } catch (error) {
      if (this.readOnly && /no such table/i.test((error as Error).message)) return [];
      throw error;
    }
  }

  get(sql: string, ...args: SQLInputValue[]): Row | undefined {
    return this.all(sql, ...args)[0];
  }
}

class SqliteLedger implements Ledger {
  constructor(private readonly journal: SqliteJournal) {}

  async claim(input: {
    key: string;
    amount: bigint;
    operationId: OperationId;
    onchainAvailable: bigint;
  }): Promise<Claim> {
    if (input.amount <= 0n) throw new Error("claim: amount must be positive");
    const journal = this.journal;
    return journal.immediate(() => {
      const open = this.openClaimsSync(input.key).reduce((acc, c) => acc + c.amount, 0n);
      const available = input.onchainAvailable - open;
      if (input.amount > available) {
        throw new InsufficientClaimable(input.key, input.amount, available < 0n ? 0n : available);
      }
      const claim: Claim = {
        id: `claim-${randomUUID()}`,
        key: input.key,
        amount: input.amount,
        operationId: input.operationId,
        createdAt: journal.currentTime,
      };
      journal
        .writer()
        .prepare("INSERT INTO claims (id, key, amount, operation_id, created_at, state) VALUES (?, ?, ?, ?, ?, 'open')")
        .run(claim.id, claim.key, claim.amount.toString(), claim.operationId, iso(claim.createdAt));
      return claim;
    });
  }

  async releaseClaim(claimId: string): Promise<void> {
    this.close(claimId, "released", null);
  }

  async settleClaim(claimId: string, actualAmount: bigint): Promise<void> {
    this.close(claimId, "settled", actualAmount);
  }

  async openClaims(key: string): Promise<Claim[]> {
    return this.openClaimsSync(key);
  }

  async credit(entry: HoldingEntry): Promise<void> {
    if (entry.amount <= 0n) throw new Error("credit: amount must be positive");
    this.journal.immediate(() => this.insertEntry(entry, entry.amount));
  }

  async debit(entry: HoldingEntry): Promise<void> {
    if (entry.amount <= 0n) throw new Error("debit: amount must be positive");
    this.journal.immediate(() => {
      const available = this.totals({
        scope: entry.scope,
        chainId: entry.chainId,
        asset: entry.asset,
        location: entry.location,
      }).reduce((acc, h) => acc + h.amount, 0n);
      if (entry.amount > available) throw new InsufficientHolding(entry, available);
      this.insertEntry(entry, -entry.amount);
    });
  }

  async holdings(filter: HoldingFilter = {}): Promise<Holding[]> {
    return this.totals(filter).filter((h) => h.amount !== 0n);
  }

  async recordSpend(entry: SpendEntry): Promise<void> {
    this.journal.immediate(() =>
      this.journal
        .writer()
        .prepare(
          "INSERT INTO spends (chain_id, asset_key, category, amount, operation_id, at) VALUES (?, ?, ?, ?, ?, ?)"
        )
        .run(
          entry.chainId,
          entry.asset.toLowerCase(),
          entry.category,
          entry.amount.toString(),
          entry.operationId,
          entry.at.getTime()
        )
    );
  }

  async spentSince(filter: SpendFilter): Promise<bigint> {
    const clauses = ["at >= ?"];
    const args: SQLInputValue[] = [filter.since.getTime()];
    if (filter.chainId !== undefined) {
      clauses.push("chain_id = ?");
      args.push(filter.chainId);
    }
    if (filter.asset !== undefined) {
      clauses.push("asset_key = ?");
      args.push(filter.asset.toLowerCase());
    }
    if (filter.category !== undefined) {
      clauses.push("category = ?");
      args.push(filter.category);
    }
    return this.journal
      .all(`SELECT amount FROM spends WHERE ${clauses.join(" AND ")}`, ...args)
      .reduce((acc, r) => acc + BigInt(String(r.amount)), 0n);
  }

  private close(claimId: string, state: "released" | "settled", actual: bigint | null): void {
    this.journal.immediate(() => {
      if (!this.journal.get("SELECT 1 AS x FROM claims WHERE id = ?", claimId))
        throw new UnknownRecord("claim", claimId);
      this.journal
        .writer()
        .prepare("UPDATE claims SET state = ?, actual_amount = ? WHERE id = ?")
        .run(state, actual === null ? null : actual.toString(), claimId);
    });
  }

  private openClaimsSync(key: string): Claim[] {
    return this.journal
      .all(
        "SELECT id, key, amount, operation_id, created_at FROM claims WHERE key = ? AND state = 'open' ORDER BY seq",
        key
      )
      .map((r) => ({
        id: String(r.id),
        key: String(r.key),
        amount: BigInt(String(r.amount)),
        operationId: String(r.operation_id),
        createdAt: new Date(String(r.created_at)),
      }));
  }

  private insertEntry(entry: HoldingEntry, signedAmount: bigint): void {
    this.journal
      .writer()
      .prepare(
        `INSERT INTO holding_entries (scope, chain_id, asset, asset_key, location, amount, operation_id, reason)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        scopeKey(entry.scope),
        entry.chainId,
        entry.asset,
        entry.asset.toLowerCase(),
        entry.location,
        signedAmount.toString(),
        entry.operationId,
        this.journal.redactor.text(entry.reason)
      );
  }

  /** Per scope, chain, asset and location, in order of first appearance, totalled in bigint. */
  private totals(filter: HoldingFilter): Holding[] {
    const { where, args } = holdingFilterSql(filter);
    const totals = new Map<string, Holding>();
    for (const row of this.journal.all(
      `SELECT scope, chain_id, asset, asset_key, location, amount FROM holding_entries ${where} ORDER BY seq`,
      ...args
    )) {
      const key = `${row.scope}|${row.chain_id}|${row.asset_key}|${row.location}`;
      const amount = BigInt(String(row.amount));
      const current = totals.get(key);
      if (current) current.amount += amount;
      else {
        totals.set(key, {
          scope: parseScopeKey(String(row.scope)),
          chainId: Number(row.chain_id),
          asset: String(row.asset) as Holding["asset"],
          location: String(row.location) as Holding["location"],
          amount,
        });
      }
    }
    return [...totals.values()];
  }
}

function encodeOperation(operation: Operation): string {
  return stringifyJson({
    ...operation,
    createdAt: iso(operation.createdAt),
    updatedAt: iso(operation.updatedAt),
  } as unknown as JsonValue);
}

function decodeOperation(text: string): Operation {
  const raw = parseJson(text) as unknown as Operation & { createdAt: string; updatedAt: string };
  return { ...raw, createdAt: new Date(raw.createdAt), updatedAt: new Date(raw.updatedAt) };
}

function encodeTransaction(record: TransactionRecord): string {
  return stringifyJson({
    ...record,
    createdAt: iso(record.createdAt),
    updatedAt: iso(record.updatedAt),
  } as unknown as JsonValue);
}

function decodeTransaction(text: string): TransactionRecord {
  const raw = parseJson(text) as unknown as TransactionRecord & { createdAt: string; updatedAt: string };
  return { ...raw, createdAt: new Date(raw.createdAt), updatedAt: new Date(raw.updatedAt) };
}
