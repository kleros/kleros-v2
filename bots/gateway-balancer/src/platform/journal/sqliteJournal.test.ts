import { randomUUID } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import type { AccountingScope } from "../../domain";
import type { Journal, NewTransactionRecord } from "../../ports";
import { describeJournalContract } from "../../testing/journalContract";
import { Redactor } from "../redact";
import { LostOwnership, OwnershipConflict, ReadOnlyJournal, SqliteJournal, type Ownership } from "./sqliteJournal";

const dir = mkdtempSync(join(tmpdir(), "gb-journal-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

const RPC_URL = "https://arb-mainnet.example.io/v2/SECRETKEY0123456789";
const redactor = new Redactor([RPC_URL]);

function ownership(overrides: Partial<Ownership> = {}): Ownership {
  return { instanceId: randomUUID(), pid: process.pid, startedAt: new Date(), staleAfterMs: 60_000, ...overrides };
}

function freshPath(): string {
  return join(dir, `${randomUUID()}.sqlite`);
}

function openWriter(path = freshPath(), own = ownership(), now?: () => Date): SqliteJournal {
  return SqliteJournal.open(path, own, { redactor, now });
}

function txRecord(operationId: string, overrides: Partial<NewTransactionRecord> = {}): NewTransactionRecord {
  return {
    idempotencyKey: `op:${operationId}:step:send`,
    operationId,
    chainId: 1003,
    from: "0x1000000000000000000000000000000000000001",
    to: "0x00000000000000000000000000000000000000a1",
    value: 0n,
    data: null,
    nonce: null,
    hash: null,
    signedRaw: null,
    status: "prepared",
    error: null,
    replacedByHash: null,
    blockNumber: null,
    ...overrides,
  };
}

const opened: Journal[] = [];
describeJournalContract("SqliteJournal", () => {
  const journal = openWriter();
  opened.push(journal);
  return journal;
});
afterAll(async () => {
  for (const journal of opened) await journal.close();
});

describe("SqliteJournal persistence and ownership", () => {
  it("keeps an open operation and its transactions across close and reopen", async () => {
    const path = freshPath();
    const first = openWriter(path);
    const op = await first.createOperation({
      kind: "refill",
      description: "refill",
      scopes: [{ kind: "arbitration", pairId: "p" }],
      payload: { amount: 1n },
    });
    await first.updateOperation(op.id, { step: "withdrawing", stepPayload: { claimId: "c" } });
    await first.recordTransaction(txRecord(op.id, { status: "signed", nonce: 4, hash: "0xaa", signedRaw: "0xbb" }));
    await first.close();

    const second = openWriter(path);
    const [reloaded] = await second.listOperations({ status: "open" });
    expect(reloaded?.id).toBe(op.id);
    expect(reloaded?.step).toBe("withdrawing");
    expect(reloaded?.stepPayload).toEqual({ claimId: "c" });
    const txs = await second.listTransactions({ operationId: op.id });
    expect(txs.map((t) => [t.status, t.nonce, t.signedRaw])).toEqual([["signed", 4, "0xbb"]]);
    await second.close();
  });

  it("refuses a second writable journal while the owner row is live", async () => {
    const path = freshPath();
    const first = openWriter(path);
    expect(() => openWriter(path)).toThrow(OwnershipConflict);
    await first.close();
    // A clean close releases the row: the next instance starts at once.
    const next = openWriter(path);
    await next.close();
  });

  it("judges liveness by instance id, not pid: same pid with a live heartbeat is still another owner", async () => {
    const path = freshPath();
    const first = openWriter(path, ownership({ pid: process.pid }));
    expect(() => openWriter(path, ownership({ pid: process.pid }))).toThrow(OwnershipConflict);
    expect(first.heartbeat()).toBe("ok");
    await first.close();
  });

  it("takes over a stale owner atomically; the old instance then sees it lost ownership", async () => {
    const path = freshPath();
    let now = new Date("2026-01-01T00:00:00Z");
    const clock = () => now;
    const crashed = openWriter(path, ownership({ staleAfterMs: 60_000 }), clock);
    now = new Date(now.getTime() + 59_000);
    expect(() => openWriter(path, ownership({ staleAfterMs: 60_000 }), clock)).toThrow(OwnershipConflict);
    now = new Date(now.getTime() + 2_000);
    const successor = openWriter(path, ownership({ staleAfterMs: 60_000 }), clock);
    // A third contender right after the takeover finds a live owner.
    expect(() => openWriter(path, ownership({ staleAfterMs: 60_000 }), clock)).toThrow(OwnershipConflict);
    expect(crashed.heartbeat()).toBe("lost");
    expect(successor.heartbeat()).toBe("ok");
    await crashed.close();
    // The old instance's close never deletes the successor's row.
    expect(successor.heartbeat()).toBe("ok");
    await successor.close();
  });

  it("opens read-only beside the writer and after a clean close without WAL files", async () => {
    const path = freshPath();
    const writer = openWriter(path);
    await writer.recordObservation("gas:1003", { reserveWei: 5n }, new Date());
    const reader = SqliteJournal.openReadOnly(path, { redactor });
    expect((await reader.observations("gas:"))[0]?.value).toEqual({ reserveWei: 5n });
    // The reader takes no ownership and cannot write.
    expect(writer.heartbeat()).toBe("ok");
    await expect(reader.recordObservation("x", 1, new Date())).rejects.toBeInstanceOf(ReadOnlyJournal);
    await reader.close();
    await writer.close();
    expect(existsSync(`${path}-wal`)).toBe(false);
    expect(existsSync(`${path}-shm`)).toBe(false);
    const after = SqliteJournal.openReadOnly(path, { redactor });
    expect((await after.observations()).map((o) => o.key)).toEqual(["gas:1003"]);
    expect(after.owner()).toBeUndefined();
    await after.close();
  });

  it("fences every mutation: after a takeover the paused instance writes nothing beside its successor", async () => {
    const path = freshPath();
    let now = new Date("2026-01-01T00:00:00Z");
    const clock = () => now;
    const paused = openWriter(path, ownership({ staleAfterMs: 60_000 }), clock);
    const op = await paused.createOperation({ kind: "refill", description: "d", scopes: [], payload: null });
    await paused.recordTransaction(txRecord(op.id));
    const claimed = await paused.ledger.claim({ key: "fg:p", amount: 1n, operationId: op.id, onchainAvailable: 5n });
    now = new Date(now.getTime() + 120_000);
    const successor = openWriter(path, ownership({ staleAfterMs: 60_000 }), clock);

    const scope: AccountingScope = { kind: "arbitration", pairId: "p" };
    const entry = { scope, chainId: 1003, asset: "native" as const, location: "eoa" as const, operationId: op.id };
    const attempts: Array<[string, () => Promise<unknown>]> = [
      ["createOperation", () => paused.createOperation({ kind: "refill", description: "x", scopes: [], payload: 1 })],
      ["updateOperation", () => paused.updateOperation(op.id, { step: "stolen" })],
      ["recordTransaction", () => paused.recordTransaction(txRecord(op.id, { idempotencyKey: "k-new" }))],
      ["updateTransaction", () => paused.updateTransaction(`op:${op.id}:step:send`, { status: "signed", nonce: 1 })],
      ["recordObservation", () => paused.recordObservation("gas:1", 1, now)],
      ["shouldNotify", () => paused.shouldNotify("k", 60, now)],
      ["forgetNotifyHit", async () => paused.forgetNotifyHit("k", now)],
      [
        "recordNotification",
        () =>
          paused.recordNotification({
            notification: { severity: "info", title: "t", body: "b", dedupKey: "k" },
            at: now,
            delivered: false,
            providers: [],
            suppressed: null,
          }),
      ],
      ["claim", () => paused.ledger.claim({ key: "fg:p", amount: 1n, operationId: op.id, onchainAvailable: 5n })],
      ["releaseClaim", () => paused.ledger.releaseClaim(claimed.id)],
      ["settleClaim", () => paused.ledger.settleClaim(claimed.id, 1n)],
      ["credit", () => paused.ledger.credit({ ...entry, amount: 5n, reason: "r" })],
      ["debit", () => paused.ledger.debit({ ...entry, amount: 1n, reason: "r" })],
      [
        "recordSpend",
        () =>
          paused.ledger.recordSpend({
            chainId: 1,
            asset: "native",
            category: "gas",
            amount: 1n,
            operationId: "o",
            at: now,
          }),
      ],
    ];
    for (const [name, attempt] of attempts) {
      const error = await attempt().then(
        () => null,
        (e: unknown) => e
      );
      expect(error, name).toBeInstanceOf(LostOwnership);
      expect((error as Error).message, name).toMatch(/^lost ownership/);
    }
    // Reads still work, and the successor sees none of the fenced writes.
    expect(await paused.getOperation(op.id)).toBeDefined();
    expect((await successor.getOperation(op.id))?.step).toBe("created");
    expect(await successor.listOperations()).toHaveLength(1);
    expect((await successor.listTransactions()).map((t) => t.status)).toEqual(["prepared"]);
    expect(await successor.observations()).toEqual([]);
    expect(await successor.ledger.holdings()).toEqual([]);
    expect(await successor.ledger.openClaims("fg:p")).toHaveLength(1);
    expect(await successor.listNotifications()).toEqual([]);
    expect(await successor.shouldNotify("k", 60, now)).toBe(true);
    await paused.close();
    await successor.close();
  });

  it("falls back to immutable=1 only for the clean-close error, and reports any other open error", async () => {
    // A clean close removed -wal/-shm and the reader cannot create -shm (read-only directory, as on a ro mount).
    const roDir = join(dir, `ro-${randomUUID()}`);
    mkdirSync(roDir);
    const path = join(roDir, "journal.sqlite");
    const writer = openWriter(path);
    await writer.recordObservation("gas:1003", { reserveWei: 5n }, new Date());
    await writer.close();
    expect(existsSync(`${path}-wal`)).toBe(false);
    chmodSync(roDir, 0o555);
    try {
      const { DatabaseSync } = process.getBuiltinModule("node:sqlite");
      // The plain read-only open fails there (the error the fallback is for)...
      expect(() => new DatabaseSync(path, { readOnly: true }).prepare("SELECT 1").get()).toThrow();
      // ...and the journal still reads through the immutable fallback.
      const reader = SqliteJournal.openReadOnly(path, { redactor });
      expect((await reader.observations()).map((o) => o.key)).toEqual(["gas:1003"]);
      await reader.close();
    } finally {
      chmodSync(roDir, 0o755);
    }

    // Corruption is reported, not read through `immutable`.
    const corrupt = freshPath();
    writeFileSync(corrupt, "this is not a sqlite database, only text that is long enough to be read as a header");
    expect(() => SqliteJournal.openReadOnly(corrupt, { redactor })).toThrow(/not a database/);

    // A path that cannot be opened at all (a directory) is reported too.
    const directory = join(dir, `dir-${randomUUID()}`);
    mkdirSync(directory);
    expect(() => SqliteJournal.openReadOnly(directory, { redactor })).toThrow();
  });

  it("reports a lock held by another connection and never reads through immutable=1 then", async () => {
    const { DatabaseSync } = process.getBuiltinModule("node:sqlite");
    // WAL journal whose writer took an exclusive lock (locking_mode=EXCLUSIVE also blocks WAL readers).
    const walPath = freshPath();
    const writer = openWriter(walPath);
    await writer.recordObservation("gas:1003", { reserveWei: 5n }, new Date());
    await writer.close();
    const walLocker = new DatabaseSync(walPath);
    walLocker.exec("PRAGMA locking_mode = EXCLUSIVE; BEGIN IMMEDIATE; DELETE FROM observations;");
    try {
      // The read-only open waits its busy_timeout on the lock (L49), then reports it.
      const started = Date.now();
      expect(() => SqliteJournal.openReadOnly(walPath, { redactor, readOnlyBusyTimeoutMs: 400 })).toThrow(
        /locked|busy/i
      );
      expect(Date.now() - started).toBeGreaterThanOrEqual(350);
    } finally {
      walLocker.exec("ROLLBACK");
      walLocker.close();
    }

    // Rollback-journal mode with an exclusive write lock and no -wal file: the case a loose fallback would read
    // through `immutable=1` (seeing the uncommitted or stale state); the lock must surface instead.
    const rollbackPath = freshPath();
    const second = openWriter(rollbackPath);
    await second.recordObservation("gas:1003", { reserveWei: 5n }, new Date());
    await second.close();
    const locker = new DatabaseSync(rollbackPath);
    locker.exec("PRAGMA journal_mode = DELETE; BEGIN EXCLUSIVE; DELETE FROM observations;");
    expect(existsSync(`${rollbackPath}-wal`)).toBe(false);
    try {
      expect(() => SqliteJournal.openReadOnly(rollbackPath, { redactor, readOnlyBusyTimeoutMs: 100 })).toThrow(
        /locked|busy/i
      );
    } finally {
      locker.exec("ROLLBACK");
      locker.close();
    }
    // Once the lock is gone the same open reads normally.
    const reader = SqliteJournal.openReadOnly(rollbackPath, { redactor });
    expect((await reader.observations()).map((o) => o.key)).toEqual(["gas:1003"]);
    await reader.close();
  });

  it("prunes dedup rows older than the window, so they do not grow without bound (L47)", async () => {
    const { DatabaseSync } = process.getBuiltinModule("node:sqlite");
    const path = freshPath();
    const journal = openWriter(path);
    const t0 = new Date("2026-01-01T00:00:00Z");
    const at = (seconds: number) => new Date(t0.getTime() + seconds * 1000);
    for (let i = 0; i < 5; i++) expect(await journal.shouldNotify(`low:${i}`, 60, at(i))).toBe(true);
    // Inside the window: still suppressed, nothing pruned.
    expect(await journal.shouldNotify("low:0", 60, at(30))).toBe(false);
    const count = () => {
      const db = new DatabaseSync(path, { readOnly: true });
      try {
        return Number((db.prepare("SELECT count(*) AS n FROM notify_hits").get() as { n: number }).n);
      } finally {
        db.close();
      }
    };
    expect(count()).toBe(5);
    // A later hit removes every row whose window has passed; the live one keeps suppressing.
    expect(await journal.shouldNotify("other", 60, at(62))).toBe(true);
    expect(count()).toBe(3);
    expect(await journal.shouldNotify("low:4", 60, at(63))).toBe(false);
    expect(await journal.shouldNotify("other", 60, at(200))).toBe(true);
    expect(count()).toBe(1);
    await journal.close();
  });

  it("reads a missing file or missing tables as an empty journal without creating anything", async () => {
    const missing = join(dir, "missing.sqlite");
    const empty = SqliteJournal.openReadOnly(missing, { redactor });
    expect(await empty.observations()).toEqual([]);
    expect(await empty.listOperations()).toEqual([]);
    expect(await empty.listTransactions()).toEqual([]);
    expect(await empty.ledger.holdings()).toEqual([]);
    expect(await empty.listNotifications()).toEqual([]);
    await empty.close();
    expect(existsSync(missing)).toBe(false);

    const bare = freshPath();
    const { DatabaseSync } = process.getBuiltinModule("node:sqlite");
    const db = new DatabaseSync(bare);
    db.exec("CREATE TABLE unrelated (x INTEGER)");
    db.close();
    const noTables = SqliteJournal.openReadOnly(bare, { redactor });
    expect(await noTables.observations()).toEqual([]);
    expect(await noTables.listOperations({ status: ["open", "attention"] })).toEqual([]);
    expect(await noTables.ledger.holdings()).toEqual([]);
    await noTables.close();
  });

  it("redacts every stored string on write", async () => {
    const path = freshPath();
    const journal = openWriter(path);
    const leak = `request to ${RPC_URL} failed`;
    const op = await journal.createOperation({
      kind: "refill",
      description: leak,
      scopes: [],
      payload: { note: leak },
    });
    await journal.updateOperation(op.id, { lastError: leak, stepPayload: { detail: leak } });
    await journal.recordTransaction(txRecord(op.id, { status: "failed", error: leak }));
    await journal.recordTransaction(txRecord(op.id, { idempotencyKey: "k2" }));
    await journal.updateTransaction("k2", { status: "failed", error: leak });
    await journal.recordObservation("price:ETH", { error: leak, nested: [leak] }, new Date());
    await journal.recordNotification({
      notification: { severity: "warning", title: leak, body: leak, action: leak, dedupKey: "k" },
      at: new Date(),
      delivered: false,
      providers: [],
      suppressed: leak,
    });
    const outputs = JSON.stringify(
      [
        await journal.getOperation(op.id),
        await journal.listTransactions(),
        await journal.observations(),
        await journal.listNotifications(),
      ],
      (_k, v: unknown) => (typeof v === "bigint" ? v.toString() : v)
    );
    expect(outputs).not.toContain("SECRETKEY");
    expect(outputs).not.toContain("arb-mainnet.example.io");
    expect(outputs).toContain("[redacted");
    await journal.close();
    const bytes = readFileSync(path).toString("latin1");
    expect(bytes).not.toContain("SECRETKEY");
  });

  it("round-trips amounts of at least 10^20 wei through every record kind, totalled in bigint", async () => {
    const journal = openWriter();
    const big = 10n ** 20n + 7n;
    const huge = 2n ** 70n;
    const scope: AccountingScope = { kind: "arbitration", pairId: "p" };
    const op = await journal.createOperation({ kind: "refill", description: "d", scopes: [scope], payload: { big } });
    await journal.updateOperation(op.id, { stepPayload: { huge } });
    expect((await journal.getOperation(op.id))?.payload).toEqual({ big });
    expect((await journal.getOperation(op.id))?.stepPayload).toEqual({ huge });

    await journal.recordTransaction(txRecord(op.id, { value: huge, blockNumber: big }));
    const tx = await journal.getTransaction(`op:${op.id}:step:send`);
    expect(tx?.value).toBe(huge);
    expect(tx?.blockNumber).toBe(big);

    const claim = await journal.ledger.claim({ key: "fg:p", amount: big, operationId: op.id, onchainAvailable: huge });
    expect(claim.amount).toBe(big);
    await journal.ledger.claim({ key: "fg:p", amount: big, operationId: op.id, onchainAvailable: huge });
    expect((await journal.ledger.openClaims("fg:p")).reduce((a, c) => a + c.amount, 0n)).toBe(2n * big);
    await expect(
      journal.ledger.claim({ key: "fg:p", amount: huge, operationId: op.id, onchainAvailable: huge })
    ).rejects.toMatchObject({ available: huge - 2n * big });

    const entry = { scope, chainId: 1003, asset: "native" as const, location: "eoa" as const, operationId: op.id };
    await journal.ledger.credit({ ...entry, amount: huge, reason: "r" });
    await journal.ledger.credit({ ...entry, amount: huge, reason: "r" });
    await journal.ledger.debit({ ...entry, amount: big, reason: "d" });
    expect((await journal.ledger.holdings({ scope }))[0]?.amount).toBe(2n * huge - big);
    await expect(journal.ledger.debit({ ...entry, amount: 2n * huge, reason: "d" })).rejects.toMatchObject({
      available: 2n * huge - big,
    });

    const at = new Date("2026-01-01T00:00:00Z");
    await journal.ledger.recordSpend({
      chainId: 1003,
      asset: "native",
      category: "gas",
      amount: huge,
      operationId: op.id,
      at,
    });
    await journal.ledger.recordSpend({
      chainId: 1003,
      asset: "native",
      category: "gas",
      amount: huge,
      operationId: op.id,
      at,
    });
    expect(await journal.ledger.spentSince({ since: at })).toBe(2n * huge);
    await journal.close();
  });
});
