import { beforeEach, describe, expect, it } from "vitest";
import type { AccountingScope } from "../domain";
import {
  DuplicateTransaction,
  InsufficientClaimable,
  InsufficientHolding,
  UnknownRecord,
  type Journal,
} from "../ports";

/**
 * The journal and ledger semantics every implementation must satisfy. The seed runs it against `FakeJournal`;
 * the platform lane runs it against the SQLite journal (`describeJournalContract("SqliteJournal", () => ...)`).
 */
export function describeJournalContract(name: string, make: () => Journal | Promise<Journal>): void {
  const arbitration: AccountingScope = { kind: "arbitration", pairId: "usdc-home" };
  const bridging: AccountingScope = { kind: "bridging", routeId: "home->usdc-home" };
  const gas: AccountingScope = { kind: "gas", chainId: 1003 };

  describe(`journal contract: ${name}`, () => {
    let journal: Journal;

    beforeEach(async () => {
      journal = await make();
    });

    it("records an operation intent as open before anything else happens", async () => {
      const op = await journal.createOperation({
        kind: "refill",
        description: "refill usdc-home",
        scopes: [arbitration],
        pairId: "usdc-home",
        payload: { amount: 10n },
      });
      expect(op.status).toBe("open");
      expect(op.step).toBe("created");
      expect(op.attempts).toBe(0);
      expect(op.payload).toEqual({ amount: 10n });
      const open = await journal.listOperations({ status: "open" });
      expect(open.map((o) => o.id)).toEqual([op.id]);
    });

    it("returns copies, never the stored object", async () => {
      const op = await journal.createOperation({
        kind: "transfer",
        description: "t",
        scopes: [],
        payload: { a: [1n] },
      });
      (op.payload as { a: bigint[] }).a.push(2n);
      op.scopes.push(gas);
      const again = await journal.getOperation(op.id);
      expect(again?.payload).toEqual({ a: [1n] });
      expect(again?.scopes).toEqual([]);
    });

    it("updates step, payload, status and attempts; unknown ids throw", async () => {
      const op = await journal.createOperation({ kind: "rate-update", description: "r", scopes: [], payload: null });
      const updated = await journal.updateOperation(op.id, {
        step: "sent",
        stepPayload: { hash: "0xab" },
        incrementAttempts: true,
        lastError: "boom",
      });
      expect(updated.step).toBe("sent");
      expect(updated.stepPayload).toEqual({ hash: "0xab" });
      expect(updated.attempts).toBe(1);
      expect(updated.lastError).toBe("boom");
      const done = await journal.updateOperation(op.id, { status: "completed", lastError: null });
      expect(done.status).toBe("completed");
      expect(done.lastError).toBeNull();
      expect(await journal.listOperations({ status: ["open", "attention"] })).toEqual([]);
      await expect(journal.updateOperation("nope", { step: "x" })).rejects.toBeInstanceOf(UnknownRecord);
    });

    it("filters operations by kind, pair, route and parent", async () => {
      const parent = await journal.createOperation({
        kind: "refill",
        description: "p",
        scopes: [],
        pairId: "eth-home",
        payload: null,
      });
      const child = await journal.createOperation({
        kind: "transfer",
        description: "c",
        scopes: [],
        pairId: "eth-home",
        parentId: parent.id,
        payload: null,
      });
      await journal.createOperation({
        kind: "reporter-funding",
        description: "r",
        scopes: [],
        routeId: "eth-home->home",
        payload: null,
      });
      expect((await journal.listOperations({ parentId: parent.id })).map((o) => o.id)).toEqual([child.id]);
      expect((await journal.listOperations({ kind: "refill" })).map((o) => o.id)).toEqual([parent.id]);
      expect((await journal.listOperations({ routeId: "eth-home->home" })).length).toBe(1);
      expect((await journal.listOperations({ pairId: "eth-home" })).length).toBe(2);
    });

    it("records a transaction once per idempotency key and updates it", async () => {
      const op = await journal.createOperation({ kind: "refill", description: "p", scopes: [], payload: null });
      const record = {
        idempotencyKey: `op:${op.id}:step:withdraw`,
        operationId: op.id,
        chainId: 1001,
        from: "0x1000000000000000000000000000000000000001" as const,
        to: "0x00000000000000000000000000000000000000a1" as const,
        value: 0n,
        data: "0xfa5e" as const,
        nonce: null,
        hash: null,
        signedRaw: null,
        status: "prepared" as const,
        error: null,
        replacedByHash: null,
        blockNumber: null,
      };
      await journal.recordTransaction(record);
      await expect(journal.recordTransaction(record)).rejects.toBeInstanceOf(DuplicateTransaction);
      const signed = await journal.updateTransaction(record.idempotencyKey, {
        nonce: 7,
        hash: "0x01",
        signedRaw: "0x02",
        status: "signed",
      });
      expect(signed.nonce).toBe(7);
      expect(signed.status).toBe("signed");
      expect((await journal.listTransactions({ status: ["signed", "broadcast"] })).length).toBe(1);
      expect((await journal.listTransactions({ operationId: op.id, chainId: 1002 })).length).toBe(0);
      expect(await journal.getTransaction("missing")).toBeUndefined();
      await expect(journal.updateTransaction("missing", { status: "failed" })).rejects.toBeInstanceOf(UnknownRecord);
    });

    it("claims never exceed the on-chain balance minus open claims; release and settle free the key", async () => {
      const key = "fg:usdc-home:bridging:1001:native";
      const first = await journal.ledger.claim({ key, amount: 60n, operationId: "op-a", onchainAvailable: 100n });
      await expect(
        journal.ledger.claim({ key, amount: 50n, operationId: "op-b", onchainAvailable: 100n })
      ).rejects.toBeInstanceOf(InsufficientClaimable);
      const second = await journal.ledger.claim({ key, amount: 40n, operationId: "op-b", onchainAvailable: 100n });
      expect((await journal.ledger.openClaims(key)).map((c) => c.id)).toEqual([first.id, second.id]);
      await journal.ledger.releaseClaim(first.id);
      await journal.ledger.settleClaim(second.id, 40n);
      expect(await journal.ledger.openClaims(key)).toEqual([]);
      await journal.ledger.claim({ key, amount: 100n, operationId: "op-c", onchainAvailable: 100n });
      await expect(journal.ledger.releaseClaim("nope")).rejects.toBeInstanceOf(UnknownRecord);
    });

    it("lists an operation's open claims on every key, never a released or settled one", async () => {
      const usdc = "fg:usdc-home:bridging:1001:native";
      const eth = "fg:eth-home:arbitration:1002:native";
      const a = await journal.ledger.claim({ key: usdc, amount: 10n, operationId: "op-x", onchainAvailable: 100n });
      const b = await journal.ledger.claim({ key: eth, amount: 20n, operationId: "op-x", onchainAvailable: 100n });
      const c = await journal.ledger.claim({ key: eth, amount: 30n, operationId: "op-x", onchainAvailable: 100n });
      await journal.ledger.claim({ key: usdc, amount: 5n, operationId: "op-y", onchainAvailable: 100n });
      await journal.ledger.settleClaim(c.id, 30n);
      expect((await journal.ledger.openClaimsOf("op-x")).map((claim) => [claim.id, claim.key, claim.amount])).toEqual([
        [a.id, usdc, 10n],
        [b.id, eth, 20n],
      ]);
      await journal.ledger.releaseClaim(a.id);
      expect((await journal.ledger.openClaimsOf("op-x")).map((claim) => claim.id)).toEqual([b.id]);
      expect(await journal.ledger.openClaimsOf("op-none")).toEqual([]);
    });

    it("keeps holdings apart by scope, chain, asset and location; a debit never crosses scopes", async () => {
      const base = { chainId: 1003, asset: "native" as const, operationId: "op-a" };
      await journal.ledger.credit({ ...base, scope: arbitration, location: "eoa", amount: 100n, reason: "received" });
      await journal.ledger.credit({ ...base, scope: bridging, location: "eoa", amount: 30n, reason: "received" });
      await journal.ledger.credit({ ...base, scope: gas, location: "eoa", amount: 5n, reason: "operator" });
      await expect(
        journal.ledger.debit({ ...base, scope: bridging, location: "eoa", amount: 31n, reason: "reporter" })
      ).rejects.toBeInstanceOf(InsufficientHolding);
      await journal.ledger.debit({ ...base, scope: arbitration, location: "eoa", amount: 60n, reason: "deposit" });
      await journal.ledger.debit({ ...base, scope: arbitration, location: "eoa", amount: 40n, reason: "in-transit" });
      await journal.ledger.credit({
        ...base,
        scope: arbitration,
        location: "in-transit",
        amount: 40n,
        reason: "bridge",
      });
      const all = await journal.ledger.holdings();
      expect(all).toHaveLength(3);
      expect(await journal.ledger.holdings({ scope: arbitration, location: "eoa" })).toEqual([]);
      expect(await journal.ledger.holdings({ scope: arbitration })).toEqual([
        { scope: arbitration, chainId: 1003, asset: "native", location: "in-transit", amount: 40n },
      ]);
      expect((await journal.ledger.holdings({ scope: gas }))[0]?.amount).toBe(5n);
      expect((await journal.ledger.holdings({ chainId: 1001 })).length).toBe(0);
    });

    it("sums spends since a time, by chain, asset and category", async () => {
      const t0 = new Date("2026-01-01T00:00:00Z");
      const t1 = new Date("2026-01-02T00:00:00Z");
      await journal.ledger.recordSpend({
        chainId: 1003,
        asset: "native",
        category: "transfer",
        amount: 10n,
        operationId: "a",
        at: t0,
      });
      await journal.ledger.recordSpend({
        chainId: 1003,
        asset: "native",
        category: "transfer",
        amount: 7n,
        operationId: "b",
        at: t1,
      });
      await journal.ledger.recordSpend({
        chainId: 1003,
        asset: "native",
        category: "gas",
        amount: 1n,
        operationId: "b",
        at: t1,
      });
      expect(await journal.ledger.spentSince({ since: t0 })).toBe(18n);
      expect(await journal.ledger.spentSince({ since: t1, category: "transfer" })).toBe(7n);
      expect(await journal.ledger.spentSince({ since: t0, chainId: 1001 })).toBe(0n);
    });

    it("keeps the latest observation per key and lists by prefix", async () => {
      await journal.recordObservation(
        "capacity:home-gateway:usdc-home",
        { cases: 50n },
        new Date("2026-01-01T00:00:00Z")
      );
      await journal.recordObservation(
        "capacity:home-gateway:usdc-home",
        { cases: 42n },
        new Date("2026-01-01T01:00:00Z")
      );
      await journal.recordObservation("gas:1003", { wei: 1n }, new Date("2026-01-01T01:00:00Z"));
      const capacity = await journal.observations("capacity:");
      expect(capacity).toHaveLength(1);
      expect(capacity[0]?.value).toEqual({ cases: 42n });
      expect((await journal.observations()).map((o) => o.key)).toEqual(["capacity:home-gateway:usdc-home", "gas:1003"]);
    });

    it("deduplicates notifications per key within a window and logs every attempt", async () => {
      const t0 = new Date("2026-01-01T00:00:00Z");
      expect(await journal.shouldNotify("low:usdc-home", 3600, t0)).toBe(true);
      expect(await journal.shouldNotify("low:usdc-home", 3600, new Date(t0.getTime() + 60_000))).toBe(false);
      expect(await journal.shouldNotify("low:eth-home", 3600, t0)).toBe(true);
      expect(await journal.shouldNotify("low:usdc-home", 3600, new Date(t0.getTime() + 3_600_000))).toBe(true);
      const notification = { severity: "warning" as const, title: "t", body: "b", dedupKey: "low:usdc-home" };
      await journal.recordNotification({
        notification,
        at: t0,
        delivered: false,
        providers: [],
        suppressed: "deduplicated",
      });
      await journal.recordNotification({
        notification,
        at: t0,
        delivered: true,
        providers: ["slack"],
        suppressed: null,
      });
      const log = await journal.listNotifications(1);
      expect(log).toHaveLength(1);
      expect(log[0]?.delivered).toBe(true);
    });
  });
}
