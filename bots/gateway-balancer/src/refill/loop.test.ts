import { describe, expect, it } from "vitest";
import { scopeKey, type AccountingScope, type Asset, type TickContext } from "../domain";
import type { TransferIntent, TransferOutcome } from "../ports";
import {
  EXAMPLE_ADDRESSES,
  EXAMPLE_CHAINS,
  FAKE_SIGNER,
  FakeForeignGatewayTreasury,
  FakeHomeGatewayFunding,
  FakePriceOracle,
  FakeTransfers,
  exampleConfig,
  fakeHash,
  makeFakePorts,
  type FakePorts,
} from "../testing";
import { RefillLoop } from "./loop";

const ETH = 10n ** 18n;
const ctx: TickContext = { now: new Date(0), signal: new AbortController().signal };
const scope: AccountingScope = { kind: "arbitration", pairId: "eth-home" };
const baseEth: Asset = { chainId: EXAMPLE_CHAINS.foreignEth, address: "native", symbol: "ETH", decimals: 18 };
const baseUsdc: Asset = {
  chainId: EXAMPLE_CHAINS.foreignEth,
  address: EXAMPLE_ADDRESSES.usdcOnForeignEth,
  symbol: "USDC",
  decimals: 6,
};
const USDC_RECEIVED = ETH / 5n; // what the scripted transfer of 600 USDC delivers

function completedFor(intent: TransferIntent, received: bigint): TransferOutcome {
  return {
    status: "completed",
    operationId: `transfer-${intent.parentOperationId}:${intent.tag}`,
    received,
    receivedByScope: [{ scope: intent.allocations[0]!.scope, amount: received }],
    realizedLossBps: 0,
    txHashes: [fakeHash(`${intent.parentOperationId}:${intent.tag}`)],
  };
}

function setup(options: { usdc?: boolean; config?: object; ports?: FakePorts; transfers?: FakeTransfers } = {}) {
  const ports =
    options.ports ??
    makeFakePorts(exampleConfig({ refill: { referenceCaseCostEth: "0.01" }, ...(options.config ?? {}) }));
  const pair = ports.config.topology.pairs.find((p) => p.id === "eth-home")!;
  const treasury = new FakeForeignGatewayTreasury(
    "eth-home",
    EXAMPLE_CHAINS.foreignEth,
    EXAMPLE_ADDRESSES.foreignGatewayEth
  );
  treasury.setBalance(baseEth, ETH / 2n, ETH / 10n);
  if (options.usdc !== false) treasury.setBalance(baseUsdc, 600_000_000n, 50_000_000n);
  const home = new FakeHomeGatewayFunding("eth-home", EXAMPLE_CHAINS.home, EXAMPLE_ADDRESSES.homeGatewayEth);
  home.available = ETH / 10n; // 10 cases, under the 20-case trigger
  const transfers = options.transfers ?? new FakeTransfers(ports.journal);
  if (!options.transfers) {
    transfers.onRun(
      (intent) => intent.fromAsset.symbol === "USDC",
      (intent) => completedFor(intent, USDC_RECEIVED)
    );
  }
  const oracle = new FakePriceOracle().set("ETH", 3000n * ETH).set("USDC", ETH);
  const loop = new RefillLoop({ ports, pair, treasury, home, transfers, priceOracle: oracle });
  return { ports, pair, treasury, home, transfers, oracle, loop };
}

async function holdings(ports: FakePorts) {
  return (await ports.journal.ledger.holdings()).map((h) => ({ ...h, scope: scopeKey(h.scope) }));
}

const toGateway = (ports: FakePorts, address: string) =>
  ports.executor.submissions.filter((s) => s.request.to.toLowerCase() === address.toLowerCase());

describe("refill loop", () => {
  it("claims, withdraws, transfers with one arbitration allocation, deposits exactly what was received", async () => {
    const { ports, treasury, home, transfers, loop } = setup();
    // An unrelated arbitration holding on the home chain must never be swept into the deposit.
    await ports.journal.ledger.credit({
      scope,
      chainId: EXAMPLE_CHAINS.home,
      asset: "native",
      location: "eoa",
      amount: 3n * ETH,
      operationId: "earlier",
      reason: "left over",
    });
    const result = await loop.tick(ctx);
    expect(result.status).toBe("acted");

    expect(treasury.withdrawals).toEqual([
      { category: "arbitration", asset: baseEth, amount: ETH / 2n, recipient: FAKE_SIGNER },
      { category: "arbitration", asset: baseUsdc, amount: 600_000_000n, recipient: FAKE_SIGNER },
    ]);
    expect(transfers.intents.map((i) => ({ tag: i.tag, amount: i.amount, allocations: i.allocations }))).toEqual([
      { tag: "withdraw-0", amount: ETH / 2n, allocations: [{ scope, amount: ETH / 2n }] },
      { tag: "withdraw-1", amount: 600_000_000n, allocations: [{ scope, amount: 600_000_000n }] },
    ]);
    expect(transfers.intents.every((i) => i.toChainId === EXAMPLE_CHAINS.home && i.toAsset.address === "native")).toBe(
      true
    );
    expect(home.deposits).toEqual([ETH / 2n, USDC_RECEIVED]);
    const deposits = toGateway(ports, EXAMPLE_ADDRESSES.homeGatewayEth);
    expect(deposits.map((d) => d.request.value)).toEqual([ETH / 2n, USDC_RECEIVED]);
    expect(deposits.map((d) => d.options.idempotencyKey)).toEqual([
      expect.stringMatching(/^op:op-\d+:step:deposit-0$/),
      expect.stringMatching(/^op:op-\d+:step:deposit-1$/),
    ]);

    // Holdings: everything withdrawn went out again; the unrelated holding is untouched; no bridging scope.
    expect(await holdings(ports)).toEqual([
      {
        scope: "arbitration:eth-home",
        chainId: EXAMPLE_CHAINS.home,
        asset: "native",
        location: "eoa",
        amount: 3n * ETH,
      },
    ]);
    const keys = [...ports.journal.ledger.claims.values()].map((c) => c.key);
    expect(keys.every((k) => k.startsWith("fg:eth-home:arbitration:"))).toBe(true);
    expect(await ports.journal.ledger.openClaims(keys[0]!)).toEqual([]);
    expect(await ports.journal.ledger.spentSince({ since: new Date(0), category: "deposit" })).toBe(
      ETH / 2n + USDC_RECEIVED
    );

    const [op] = await ports.journal.listOperations({ kind: "refill" });
    expect(op).toMatchObject({ status: "completed", pairId: "eth-home", scopes: [scope] });
    // The loop credits only its confirmed withdrawals on the foreign chain; home-chain credits come from Transfers.
    const loopCredits = ports.journal.ledger.entries.filter((e) => e.operationId === op!.id && e.amount > 0n);
    expect(loopCredits.map((e) => [e.chainId, e.reason])).toEqual([
      [EXAMPLE_CHAINS.foreignEth, "foreign arbitration withdrawal"],
      [EXAMPLE_CHAINS.foreignEth, "foreign arbitration withdrawal"],
    ]);
    expect(ports.journal.ledger.entries.every((e) => e.scope.kind === "arbitration")).toBe(true);
    expect(ports.notifier.sent.map((n) => n.title)).toContain("HomeGateway eth-home refilled");
    expect(ports.notifier.sent.find((n) => n.title.startsWith("Partial refill"))).toMatchObject({
      severity: "warning",
      pairId: "eth-home",
    });

    // Next tick: the gateway is above the trigger and nothing is open.
    home.available = ETH;
    expect((await loop.tick(ctx)).status).toBe("idle");
    expect(treasury.withdrawals).toHaveLength(2);
  });

  it("records capacity and withdrawable observations every tick", async () => {
    const { ports, home, loop } = setup();
    home.available = ETH; // above the trigger
    await loop.tick(ctx);
    ports.clock.advance(60_000);
    await loop.tick(ctx);
    const observations = await ports.journal.observations();
    const byKey = Object.fromEntries(observations.map((o) => [o.key, o]));
    expect(byKey["capacity:eth-home"]!.value).toMatchObject({
      availableNative: ETH,
      lowWater: ETH / 5n,
      target: ETH,
      cases: 100,
    });
    expect(byKey["withdrawable:eth-home:ETH"]!.value).toMatchObject({ arbitration: ETH / 2n, bridging: ETH / 10n });
    expect(byKey["withdrawable:eth-home:USDC"]!.value).toMatchObject({
      arbitration: 600_000_000n,
      bridging: 50_000_000n,
    });
    for (const key of ["capacity:eth-home", "withdrawable:eth-home:ETH", "withdrawable:eth-home:USDC"]) {
      expect(byKey[key]!.at).toEqual(ports.clock.now());
    }
  });

  it("does not trigger at the low-water mark, and stays idle without a reference cost", async () => {
    const { home, loop, treasury } = setup();
    home.available = ETH / 5n; // exactly 20 cases
    expect((await loop.tick(ctx)).status).toBe("idle");
    const unconfigured = setup({ config: { refill: {} } });
    expect((await unconfigured.loop.tick(ctx)).status).toBe("idle");
    expect(treasury.withdrawals).toHaveLength(0);
    expect(unconfigured.treasury.withdrawals).toHaveLength(0);
  });

  it("turns a replaced deposit into attention and never deposits again", async () => {
    const { ports, loop } = setup({ usdc: false });
    ports.executor.script((request) => request.to === EXAMPLE_ADDRESSES.homeGatewayEth, {
      status: "replaced",
      hash: fakeHash("deposit"),
      replacedByHash: fakeHash("other"),
    });
    expect((await loop.tick(ctx)).status).toBe("suspended");
    const [op] = await ports.journal.listOperations({ kind: "refill" });
    expect(op).toMatchObject({ status: "attention", lastError: expect.stringMatching(/replaced/) });
    expect(ports.notifier.bySeverity("critical").map((n) => n.dedupKey)).toContain(`refill-attention:${op!.id}`);
    expect((await loop.tick(ctx)).status).toBe("suspended");
    expect(toGateway(ports, EXAMPLE_ADDRESSES.homeGatewayEth)).toHaveLength(1);
    expect(await ports.journal.listOperations({ kind: "refill" })).toHaveLength(1);
  });

  it("writes the debiting marker before the deposit debit", async () => {
    const { ports, loop } = setup({ usdc: false });
    const events: string[] = [];
    const update = ports.journal.updateOperation.bind(ports.journal);
    ports.journal.updateOperation = async (id, change) => {
      if (change.step) events.push(`step ${change.step}`);
      return update(id, change);
    };
    const debit = ports.journal.ledger.debit.bind(ports.journal.ledger);
    ports.journal.ledger.debit = async (entry) => {
      events.push(`debit ${entry.reason}`);
      return debit(entry);
    };
    await loop.tick(ctx);
    const marker = events.indexOf("step deposit:debiting");
    expect(marker).toBeGreaterThan(-1);
    expect(events[marker + 1]).toBe("debit HomeGateway deposit");
    expect(events[marker + 2]).toBe("step deposit:submit");
  });

  it("goes to attention when it resumes at the debiting marker", async () => {
    const { ports, loop } = setup({ usdc: false });
    ports.executor.script((r) => r.to === EXAMPLE_ADDRESSES.homeGatewayEth, { status: "pending", hash: fakeHash("d") });
    await loop.tick(ctx);
    const [op] = await ports.journal.listOperations({ kind: "refill" });
    expect(op!.step).toBe("deposit:submit");
    await ports.journal.updateOperation(op!.id, { step: "deposit:debiting" });
    await loop.tick(ctx);
    expect(await ports.journal.getOperation(op!.id)).toMatchObject({
      status: "attention",
      lastError: expect.stringMatching(/ledger bracket/),
    });
  });

  it("credits a failed deposit back and retries it on a later tick under a new key", async () => {
    const { ports, loop } = setup({ usdc: false });
    let failures = 1;
    ports.executor.script((r) => r.to === EXAMPLE_ADDRESSES.homeGatewayEth && failures-- > 0, {
      status: "failed",
      error: "simulation failed revertData=none",
    });
    expect((await loop.tick(ctx)).status).toBe("deferred");
    const [held] = await ports.journal.ledger.holdings({ scope, chainId: EXAMPLE_CHAINS.home, location: "eoa" });
    expect(held!.amount).toBe(ETH / 2n);
    expect((await loop.tick(ctx)).status).toBe("acted");
    expect(toGateway(ports, EXAMPLE_ADDRESSES.homeGatewayEth).map((s) => s.options.idempotencyKey)).toEqual([
      expect.stringMatching(/:step:deposit-0$/),
      expect.stringMatching(/:step:deposit-0:1$/),
    ]);
    expect(await ports.journal.ledger.holdings({ scope, chainId: EXAMPLE_CHAINS.home })).toEqual([]);
  });

  it("never writes a deposit spend row or counts a deposit twice after a crash at the row", async () => {
    const first = setup({ usdc: false });
    const { ports, transfers } = first;
    const events: string[] = [];
    const update = ports.journal.updateOperation.bind(ports.journal);
    ports.journal.updateOperation = async (id, change) => {
      if (change.step) events.push(`step ${change.step}`);
      return update(id, change);
    };
    const recordSpend = ports.journal.ledger.recordSpend.bind(ports.journal.ledger);
    let crash = true;
    ports.journal.ledger.recordSpend = async (entry) => {
      await recordSpend(entry);
      events.push(`spend ${entry.category}`);
      // The process dies right after the row is written, before the next step marker.
      if (entry.category === "deposit" && crash) {
        crash = false;
        throw new Error("simulated crash after the deposit spend row");
      }
    };
    expect((await first.loop.tick(ctx)).status).toBe("failed");
    // The marker that records the deposit comes before the spend row.
    const marker = events.indexOf("step deposit:recorded");
    expect(marker).toBeGreaterThan(-1);
    expect(events[marker + 1]).toBe("spend deposit");

    const restarted = setup({ ports, transfers });
    expect((await restarted.loop.tick(ctx)).status).toBe("acted");
    const [op] = await ports.journal.listOperations({ kind: "refill" });
    expect(op).toMatchObject({ status: "completed" });
    expect(toGateway(ports, EXAMPLE_ADDRESSES.homeGatewayEth)).toHaveLength(1);
    expect((op!.stepPayload as { deposited: bigint }).deposited).toBe(ETH / 2n);
    expect(await ports.journal.ledger.spentSince({ since: new Date(0), category: "deposit" })).toBe(ETH / 2n);
    expect(ports.notifier.sent.filter((n) => n.dedupKey === `refill-spend-row:${op!.id}`)).toHaveLength(1);
  });

  it("does not credit back a failed deposit whose record carries a signed transaction", async () => {
    const { ports, loop } = setup({ usdc: false });
    ports.executor.script((r) => r.to === EXAMPLE_ADDRESSES.homeGatewayEth, { status: "failed", error: "odd" });
    const submit = ports.executor.submit.bind(ports.executor);
    ports.executor.submit = async (request, options) => {
      const outcome = await submit(request, options);
      if (request.to === EXAMPLE_ADDRESSES.homeGatewayEth) {
        await ports.journal.updateTransaction(options.idempotencyKey, { signedRaw: "0x02" });
      }
      return outcome;
    };
    await loop.tick(ctx);
    const [op] = await ports.journal.listOperations({ kind: "refill" });
    expect(op).toMatchObject({ status: "attention", lastError: expect.stringMatching(/not an unsigned failure/) });
    // The debit stands: nothing is credited back while a signed deposit may exist.
    expect(await ports.journal.ledger.holdings({ scope, chainId: EXAMPLE_CHAINS.home })).toEqual([]);
  });

  it("releases the claim and defers when a withdrawal's simulation fails, then re-reads next tick", async () => {
    const { ports, loop, treasury } = setup({ usdc: false });
    let failures = 1;
    ports.executor.script((r) => r.to === EXAMPLE_ADDRESSES.foreignGatewayEth && failures-- > 0, {
      status: "failed",
      error: "execution reverted revertData=0x",
    });
    expect((await loop.tick(ctx)).status).toBe("deferred");
    const claims = [...ports.journal.ledger.claims.values()];
    expect(claims).toHaveLength(1);
    expect(claims[0]!.state).toBe("released");
    const [first] = await ports.journal.listOperations({ kind: "refill" });
    expect(first!.status).toBe("failed");
    expect(await ports.journal.ledger.holdings()).toEqual([]);
    treasury.setBalance(baseEth, ETH / 3n, 0n);
    expect((await loop.tick(ctx)).status).toBe("acted");
    expect(treasury.withdrawals.map((w) => w.amount)).toEqual([ETH / 2n, ETH / 3n]);
  });

  it("retries an aborted: withdrawal and deposit under a new attempt key, no skip, notification or suspension", async () => {
    // Decisions [L61]: shutdown or an expired wait budget before signing is not a contract rejection.
    const { ports, loop } = setup({ usdc: false });
    const aborted = { status: "failed" as const, error: "aborted: wait budget expired revertData=none" };
    let withdrawAborts = 2;
    let depositAborts = 2;
    ports.executor.script((r) => r.to === EXAMPLE_ADDRESSES.foreignGatewayEth && withdrawAborts-- > 0, aborted);
    ports.executor.script((r) => r.to === EXAMPLE_ADDRESSES.homeGatewayEth && depositAborts-- > 0, aborted);
    expect((await loop.tick(ctx)).status).toBe("deferred");
    const [op] = await ports.journal.listOperations({ kind: "refill" });
    expect(op).toMatchObject({ status: "open", step: "withdraw" });
    // The claim is kept for the retry; nothing was skipped.
    expect([...ports.journal.ledger.claims.values()].map((c) => c.state)).toEqual(["open"]);
    expect((await loop.tick(ctx)).status).toBe("deferred");
    expect((await loop.tick(ctx)).status).toBe("deferred"); // withdrawn, transferred; the deposit aborts
    const [held] = await ports.journal.ledger.holdings({ scope, chainId: EXAMPLE_CHAINS.home, location: "eoa" });
    expect(held!.amount).toBe(ETH / 2n); // credited back before the retry
    expect((await loop.tick(ctx)).status).toBe("deferred");
    expect((await loop.tick(ctx)).status).toBe("acted");
    expect(toGateway(ports, EXAMPLE_ADDRESSES.foreignGatewayEth).map((s) => s.options.idempotencyKey)).toEqual([
      expect.stringMatching(/:step:withdraw-0$/),
      expect.stringMatching(/:step:withdraw-0:1$/),
      expect.stringMatching(/:step:withdraw-0:2$/),
    ]);
    expect(toGateway(ports, EXAMPLE_ADDRESSES.homeGatewayEth).map((s) => s.options.idempotencyKey)).toEqual([
      expect.stringMatching(/:step:deposit-0$/),
      expect.stringMatching(/:step:deposit-0:1$/),
      expect.stringMatching(/:step:deposit-0:2$/),
    ]);
    const [done] = await ports.journal.listOperations({ kind: "refill" });
    expect(done).toMatchObject({ status: "completed" });
    expect((done!.stepPayload as { skipped: string[] }).skipped).toEqual([]);
    expect([...ports.journal.ledger.claims.values()].map((c) => c.state)).toEqual(["settled"]);
    // Only the completion's info: no warning, no critical, no suspension.
    expect(ports.notifier.sent.map((n) => n.severity)).toEqual(["warning", "info"]);
    expect(ports.notifier.sent[0]!.dedupKey).toMatch(/^refill-partial:/);
    expect(await ports.journal.observations(`suspended:${loop.id}`)).toEqual([]);
  });

  it("makes a reverted withdrawal attention", async () => {
    const { ports, loop, transfers } = setup({ usdc: false });
    ports.executor.script((r) => r.to === EXAMPLE_ADDRESSES.foreignGatewayEth, {
      status: "reverted",
      hash: fakeHash("w"),
      reason: "revertData=0x",
    });
    await loop.tick(ctx);
    const [op] = await ports.journal.listOperations({ kind: "refill" });
    expect(op).toMatchObject({ status: "attention", lastError: expect.stringMatching(/withdrawal of ETH reverted/) });
    expect(transfers.intents).toHaveLength(0);
  });

  it("makes a transfer attention the operation's attention, with a notification and no new bridge", async () => {
    const { ports, loop, transfers } = setup({ usdc: false });
    transfers.onRun(() => true, {
      status: "attention",
      operationId: "transfer-x",
      reason: "status unknown past the timeout",
    });
    expect((await loop.tick(ctx)).status).toBe("suspended");
    const [op] = await ports.journal.listOperations({ kind: "refill" });
    expect(op).toMatchObject({
      status: "attention",
      lastError: expect.stringMatching(/status unknown past the timeout/),
    });
    expect(ports.notifier.bySeverity("critical").length).toBeGreaterThan(0);
    expect((await loop.tick(ctx)).status).toBe("suspended");
    expect(transfers.intents).toHaveLength(1);
    expect(await ports.journal.listOperations({ kind: "refill" })).toHaveLength(1);
  });

  it("suspended by a policy violation: polls its open transfer, deposits, then returns suspended", async () => {
    const { ports, loop, transfers, treasury } = setup({ usdc: false });
    transfers.onRun(
      () => true,
      (intent) => ({
        status: "in-progress",
        operationId: `transfer-${intent.tag}`,
        step: "policy-rejected: budget: requote under the minimum",
      })
    );
    expect((await loop.tick(ctx)).status).toBe("deferred");
    const [suspension] = await ports.journal.observations("suspended:refill:eth-home");
    expect(suspension!.value).toMatchObject({ active: true, kind: "policy" });
    expect((await loop.tick(ctx)).status).toBe("deferred");
    expect(ports.notifier.sent.filter((n) => n.dedupKey.startsWith("suspended:refill:eth-home"))).toHaveLength(1);

    // The transfer completes: the test switches the scripted outcome and performs the transfer's ledger moves.
    const [op] = await ports.journal.listOperations({ kind: "refill" });
    const intent = transfers.intents[0]!;
    const received = (99n * ETH) / 200n;
    transfers.outcomes.set(`${op!.id}:${intent.tag}`, completedFor(intent, received));
    await ports.journal.ledger.debit({
      scope,
      chainId: baseEth.chainId,
      asset: "native",
      location: "eoa",
      amount: ETH / 2n,
      operationId: "t",
      reason: "transfer sent",
    });
    await ports.journal.ledger.credit({
      scope,
      chainId: EXAMPLE_CHAINS.home,
      asset: "native",
      location: "eoa",
      amount: received,
      operationId: "t",
      reason: "transfer received",
    });

    expect((await loop.tick(ctx)).status).toBe("suspended");
    expect(await ports.journal.getOperation(op!.id)).toMatchObject({ status: "completed" });
    expect(toGateway(ports, EXAMPLE_ADDRESSES.homeGatewayEth).map((s) => s.request.value)).toEqual([received]);
    // Still below the trigger, but suspended: nothing new.
    expect((await loop.tick(ctx)).status).toBe("suspended");
    expect(treasury.withdrawals).toHaveLength(1);

    // A changed LI.FI configuration clears the suspension; the loop plans again.
    const changed = setup({
      usdc: false,
      ports: {
        ...ports,
        config: exampleConfig({ refill: { referenceCaseCostEth: "0.01" }, lifi: { maxLossBps: 400 } }),
      },
      transfers: new FakeTransfers(ports.journal),
    });
    expect((await changed.loop.tick(ctx)).status).toBe("acted");
    const [cleared] = await ports.journal.observations("suspended:refill:eth-home");
    expect(cleared!.value).toMatchObject({ active: false });
  });

  it("never touches another pair's balances or scope", async () => {
    const ports = makeFakePorts(exampleConfig({ refill: { referenceCaseCostEth: "0.01" } }));
    const eth = setup({ ports });
    const usdcPair = ports.config.topology.pairs.find((p) => p.id === "usdc-home")!;
    const arcAsset = usdcPair.collectedAssets[0]! as Asset;
    const arcTreasury = new FakeForeignGatewayTreasury(
      "usdc-home",
      EXAMPLE_CHAINS.foreignUsdc,
      EXAMPLE_ADDRESSES.foreignGatewayUsdc
    );
    arcTreasury.setBalance(arcAsset, 300n * ETH, 20n * ETH);
    const arcHome = new FakeHomeGatewayFunding("usdc-home", EXAMPLE_CHAINS.home, EXAMPLE_ADDRESSES.homeGatewayUsdc);
    arcHome.available = 2n * ETH; // above its trigger
    const arcLoop = new RefillLoop({
      ports,
      pair: usdcPair,
      treasury: arcTreasury,
      home: arcHome,
      transfers: eth.transfers,
      priceOracle: eth.oracle,
    });
    await arcLoop.tick(ctx);
    await eth.loop.tick(ctx);
    expect(arcTreasury.withdrawals).toHaveLength(0);
    expect(eth.treasury.withdrawals.every((w) => w.category === "arbitration")).toBe(true);
    expect([...ports.journal.ledger.claims.values()].every((c) => c.key.startsWith("fg:eth-home:arbitration:"))).toBe(
      true
    );
    expect(ports.journal.ledger.entries.every((e) => scopeKey(e.scope) === "arbitration:eth-home")).toBe(true);
    expect(
      eth.transfers.intents.every((i) => i.allocations.every((a) => scopeKey(a.scope) === "arbitration:eth-home"))
    ).toBe(true);
  });

  it("resumes after a crash between any two steps with no duplicate withdrawal, bridge or deposit", async () => {
    let finishedWithoutCrash = false;
    const outcomes: string[] = [];
    for (let n = 1; n < 60 && !finishedWithoutCrash; n++) {
      const first = setup();
      const { ports, transfers } = first;
      const update = ports.journal.updateOperation.bind(ports.journal);
      let calls = 0;
      ports.journal.updateOperation = async (id, change) => {
        calls += 1;
        if (calls === n) throw new Error(`simulated crash at write ${n}`);
        return update(id, change);
      };
      const result = await first.loop.tick(ctx);
      ports.journal.updateOperation = update;
      if (result.status !== "failed") {
        finishedWithoutCrash = true;
        expect(result.status).toBe("acted");
        continue;
      }
      // Restart: a new loop over the same journal, executor, gateways and transfers.
      const restarted = setup({ ports, transfers });
      restarted.treasury.withdrawals.push(...first.treasury.withdrawals);
      for (let i = 0; i < 4; i++) {
        const tick = await restarted.loop.tick(ctx);
        if (tick.status !== "acted" && tick.status !== "deferred") break;
        const [open] = await ports.journal.listOperations({ kind: "refill", status: "open" });
        if (!open) break;
      }
      const [op] = await ports.journal.listOperations({ kind: "refill" });
      outcomes.push(op!.status);
      const withdrawals = toGateway(ports, EXAMPLE_ADDRESSES.foreignGatewayEth).map((s) => s.options.idempotencyKey);
      expect(new Set(withdrawals).size, `crash at write ${n}`).toBe(withdrawals.length);
      expect(withdrawals.length, `crash at write ${n}`).toBeLessThanOrEqual(2);
      const tags = transfers.intents.map((i) => i.tag);
      expect(new Set(tags).size, `crash at write ${n}`).toBe(tags.length);
      const deposits = toGateway(ports, EXAMPLE_ADDRESSES.homeGatewayEth);
      expect(deposits.length, `crash at write ${n}`).toBeLessThanOrEqual(2);
      const deposited = deposits.reduce((acc, d) => acc + d.request.value, 0n);
      expect(deposited, `crash at write ${n}`).toBeLessThanOrEqual(ETH / 2n + USDC_RECEIVED);
      const depositRows = await ports.journal.ledger.spentSince({ since: new Date(0), category: "deposit" });
      expect(depositRows, `crash at write ${n}`).toBeLessThanOrEqual(deposited);
      if (op!.status === "completed") {
        expect(deposited).toBe(ETH / 2n + USDC_RECEIVED);
        expect(await ports.journal.ledger.holdings()).toEqual([]);
      } else {
        expect(op!.status, `crash at write ${n}`).toBe("attention");
        expect(op!.lastError).toMatch(/ledger bracket/);
      }
      expect(await ports.journal.listOperations({ kind: "refill" }), `crash at write ${n}`).toHaveLength(1);
    }
    expect(finishedWithoutCrash).toBe(true);
    expect(outcomes.length).toBeGreaterThanOrEqual(8);
    expect(outcomes).toContain("completed");
    expect(outcomes).toContain("attention");
  });
});

describe("refill loop: suspension clears itself, deferral codes ([L20], S-8, S-9)", () => {
  /** A loop whose single ETH transfer answers whatever `next` holds when `Transfers.run` is called. */
  function scripted(config?: object) {
    const transfers = new FakeTransfers();
    let next: TransferOutcome = { status: "deferred", reason: "no-route: unset" };
    transfers.onRun(
      () => true,
      () => next
    );
    const env = setup({ usdc: false, transfers, ...(config ? { config } : {}) });
    const restart = () =>
      new RefillLoop({
        ports: env.ports,
        pair: env.pair,
        treasury: env.treasury,
        home: env.home,
        transfers,
        priceOracle: env.oracle,
      });
    return { ...env, transfers, set: (outcome: TransferOutcome) => (next = outcome), restart };
  }
  const suspension = async (ports: FakePorts) =>
    (await ports.journal.observations("suspended:refill:eth-home"))[0]?.value as { active: boolean; kind?: string };
  const inProgress = (step: string): TransferOutcome => ({ status: "in-progress", operationId: "transfer-x", step });

  it("clears a deferred-start policy suspension once a later quote passes; a restart clears nothing", async () => {
    const env = scripted();
    env.set({ status: "deferred", reason: "policy-rejected: daily-limit: 2 spent in 24h plus 1 exceeds 2" });
    expect((await env.loop.tick(ctx)).status).toBe("deferred");
    expect(await suspension(env.ports)).toMatchObject({ active: true, kind: "policy" });
    // A restart over the same journal, the reason still holding: still suspended, nothing new initiated.
    const restarted = env.restart();
    expect((await restarted.tick(ctx)).status).toBe("deferred");
    expect(await suspension(env.ports)).toMatchObject({ active: true, kind: "policy" });
    expect(env.treasury.withdrawals).toHaveLength(1);
    // The window rolled: the same open transfer now starts.
    env.set(inProgress("approve"));
    expect((await restarted.tick(ctx)).status).toBe("deferred"); // the operation is still open
    expect(await suspension(env.ports)).toMatchObject({ active: false });
    expect(env.ports.notifier.sent.filter((n) => n.title === "Refill eth-home resumed")).toHaveLength(1);
  });

  it("clears a policy suspension raised by a requote once the next requote passes", async () => {
    const env = scripted();
    env.set(inProgress("policy-rejected: budget: minimum output 1 plus fees 0 is under 2"));
    expect((await env.loop.tick(ctx)).status).toBe("deferred");
    expect(await suspension(env.ports)).toMatchObject({ active: true, kind: "policy" });
    const [op] = await env.ports.journal.listOperations({ kind: "refill" });
    const key = `${op!.id}:withdraw-0`;
    env.transfers.outcomes.set(key, inProgress("awaiting-route: quote failed: timeout"));
    await env.loop.tick(ctx);
    expect(await suspension(env.ports)).toMatchObject({ active: true }); // no quote passed yet
    env.transfers.outcomes.set(key, inProgress("awaiting-inbound-slot: op-7"));
    await env.loop.tick(ctx);
    expect(await suspension(env.ports)).toMatchObject({ active: true }); // waiting before the send-time check
    env.transfers.outcomes.set(key, inProgress("send"));
    await env.loop.tick(ctx);
    expect(await suspension(env.ports)).toMatchObject({ active: false });
  });

  it("clears an attention suspension once no operation needs attention, never by a restart alone", async () => {
    const env = scripted();
    env.set({ status: "attention", operationId: "transfer-x", reason: "status unknown past the timeout" });
    expect((await env.loop.tick(ctx)).status).toBe("suspended");
    expect((await env.restart().tick(ctx)).status).toBe("suspended");
    expect(await suspension(env.ports)).toMatchObject({ active: true, kind: "attention" });
    const [op] = await env.ports.journal.listOperations({ kind: "refill" });
    await env.ports.journal.updateOperation(op!.id, { status: "failed", lastError: "resolved by the operator" });
    env.set({ status: "deferred", reason: "no-route: 1002" });
    expect((await env.restart().tick(ctx)).status).toBe("deferred"); // plans a new refill again
    expect(await suspension(env.ports)).toMatchObject({ active: false });
    expect(env.treasury.withdrawals).toHaveLength(2);
  });

  it("warns on price-unavailable (one dedup key per operation), keeps retrying, never attention", async () => {
    const env = scripted({ refill: { referenceCaseCostEth: "0.01", maxAmbiguousDeferrals: 2 } });
    env.set({ status: "deferred", reason: "price-unavailable: ETH price stale: older than 10 minutes" });
    for (let i = 0; i < 6; i++) {
      expect((await env.loop.tick(ctx)).status).toBe("deferred");
      env.ports.clock.advance(3_600_000);
    }
    const [op] = await env.ports.journal.listOperations({ kind: "refill" });
    expect(op).toMatchObject({ status: "open", step: "transfer" });
    expect(env.ports.notifier.sent.filter((n) => n.dedupKey === `refill-price:${op!.id}`)).toHaveLength(6);
    expect(new Set(env.ports.notifier.sent.filter((n) => n.severity === "warning").map((n) => n.dedupKey))).toEqual(
      new Set([`refill-price:${op!.id}`, `refill-partial:${op!.id}`])
    );
    expect(env.ports.notifier.bySeverity("critical")).toHaveLength(0);
  });

  it("bounds an insufficient-holding deferral to attention after N deferrals, never another scope", async () => {
    const env = scripted({ refill: { referenceCaseCostEth: "0.01", maxAmbiguousDeferrals: 3 } });
    env.set({ status: "deferred", reason: "insufficient-holding: arbitration:eth-home holds 0 on chain 1, under 5" });
    expect((await env.loop.tick(ctx)).status).toBe("deferred");
    expect((await env.loop.tick(ctx)).status).toBe("deferred");
    const [op] = await env.ports.journal.listOperations({ kind: "refill" });
    expect(env.ports.notifier.sent.filter((n) => n.dedupKey === `refill-deferred:${op!.id}:0`)).toHaveLength(2);
    expect((await env.loop.tick(ctx)).status).toBe("suspended");
    expect(await env.ports.journal.getOperation(op!.id)).toMatchObject({
      status: "attention",
      lastError: expect.stringMatching(/deferred 3 times .*insufficient-holding:/),
    });
    expect(
      env.transfers.intents.every((i) => i.allocations.every((a) => scopeKey(a.scope) === "arbitration:eth-home"))
    ).toBe(true);
    expect(env.transfers.intents).toHaveLength(3);
  });

  it("bounds an unrecognised deferral reason by the age limit too", async () => {
    const env = scripted({
      refill: { referenceCaseCostEth: "0.01", maxAmbiguousDeferrals: 100, ambiguousDeferralMaxAgeSeconds: 600 },
    });
    env.set({ status: "deferred", reason: "something new from a later Transfers" });
    expect((await env.loop.tick(ctx)).status).toBe("deferred");
    env.ports.clock.advance(599_000);
    expect((await env.loop.tick(ctx)).status).toBe("deferred");
    env.ports.clock.advance(1_000);
    expect((await env.loop.tick(ctx)).status).toBe("suspended");
    const [op] = await env.ports.journal.listOperations({ kind: "refill" });
    expect(op).toMatchObject({ status: "attention" });
  });

  it("makes an allocations-mismatch deferral attention at once", async () => {
    const env = scripted();
    env.set({ status: "deferred", reason: "allocations-mismatch: allocations sum to 1, not the amount 2" });
    expect((await env.loop.tick(ctx)).status).toBe("suspended");
    const [op] = await env.ports.journal.listOperations({ kind: "refill" });
    expect(op).toMatchObject({ status: "attention", lastError: expect.stringMatching(/allocations-mismatch:/) });
  });

  it("notifies a no-route deferral once per operation and keeps retrying", async () => {
    const env = scripted();
    env.set({ status: "deferred", reason: "no-route: LI.FI 404 code 1002" });
    for (let i = 0; i < 3; i++) expect((await env.loop.tick(ctx)).status).toBe("deferred");
    const [op] = await env.ports.journal.listOperations({ kind: "refill" });
    const keys = env.ports.notifier.sent
      .filter((n) => n.title.startsWith("No approved LI.FI route"))
      .map((n) => n.dedupKey);
    expect(new Set(keys)).toEqual(new Set([`refill-no-route:${op!.id}:0`]));
    expect(op).toMatchObject({ status: "open", step: "transfer" });
    expect(await suspension(env.ports)).toBeUndefined();
  });
});
