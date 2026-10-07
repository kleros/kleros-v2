import { decodeFunctionData, encodeErrorResult, toFunctionSelector } from "viem";
import { describe, expect, it } from "vitest";
import type { Loop } from "../domain";
import type { SubmitOutcome } from "../ports";
import {
  EXAMPLE_ADDRESSES,
  EXAMPLE_CHAINS,
  exampleConfig,
  fakeHash,
  FakePriceOracle,
  makeFakePorts,
  type FakePorts,
} from "../testing";
import { foreignGatewayRateAbi } from "./abi/foreignGatewayRate";
import { createRatesLoops } from "./index";

const E18 = 10n ** 18n;
const HOUR = 3_600_000;
const UPDATE_SELECTOR = toFunctionSelector("updateCurrencyRate(uint256)");

function revert(errorName: string, args: readonly unknown[]): string {
  const data = encodeErrorResult({ abi: foreignGatewayRateAbi, errorName, args } as never);
  return `The contract function "updateCurrencyRate" reverted. revertData=${data}`;
}
const COOLDOWN = revert("RateUpdateCooldown", [1767229200n]);
const OUT_OF_BOUNDS = revert("RateOutOfBounds", [6000n * E18, 1500n * E18, 5000n * E18]);
const MAX_CHANGE = revert("RateChangeTooLarge", [3000n * E18, 4000n * E18]);

function failedOnAttempt(attempt: number, error: string) {
  return [
    (_: unknown, options: { idempotencyKey: string }) => options.idempotencyKey.endsWith(`:update:${attempt}`),
    { status: "failed", error } satisfies SubmitOutcome,
  ] as const;
}

interface Setup {
  ports: FakePorts;
  oracle: FakePriceOracle;
  loop: Loop;
  loops: Loop[];
  contract: { rate: bigint };
  tick: () => ReturnType<Loop["tick"]>;
}

function setup(rates: Record<string, unknown> = {}, contractRate = 2800n * E18, eth = 3000n * E18): Setup {
  const ports = makeFakePorts(exampleConfig({ rates } as never));
  const contract = { rate: contractRate };
  ports.chains.get(EXAMPLE_CHAINS.foreignUsdc)!.onRead(
    (c) => c.address === EXAMPLE_ADDRESSES.foreignGatewayUsdc && c.functionName === "currencyRate",
    () => [contract.rate, 1767225000n]
  );
  const oracle = new FakePriceOracle().set("ETH", eth);
  const loops = createRatesLoops(ports, { priceOracle: oracle });
  const loop = loops.find((l) => l.id === "rate:usdc-home")!;
  const tick = () => loop.tick({ now: ports.clock.now(), signal: new AbortController().signal });
  return { ports, oracle, loop, loops, contract, tick };
}

/** Every submission is the ForeignGateway's rate update; returns the proposed rates in contract scale. */
function submittedRates(ports: FakePorts): bigint[] {
  return ports.executor.submissions.map(({ request }) => {
    expect(request).toMatchObject({ chainId: EXAMPLE_CHAINS.foreignUsdc, to: EXAMPLE_ADDRESSES.foreignGatewayUsdc });
    expect(request.value).toBe(0n);
    expect(request.data!.slice(0, 10)).toBe(UPDATE_SELECTOR);
    const decoded = decodeFunctionData({ abi: foreignGatewayRateAbi, data: request.data! });
    expect(decoded.functionName).toBe("updateCurrencyRate");
    return decoded.args![0] as bigint;
  });
}

async function rateOps(ports: FakePorts) {
  return ports.journal.listOperations({ kind: "rate-update", pairId: "usdc-home" });
}

describe("createRatesLoops", () => {
  it("creates one loop per pair with a rateCurrency", () => {
    const { loops } = setup();
    expect(loops.map((l) => l.id)).toEqual(["rate:usdc-home"]);
  });

  it("rejects per-pair settings for an unknown pair", () => {
    const ports = makeFakePorts(exampleConfig({ rates: { pairs: { nope: {} } } as never }));
    expect(() => createRatesLoops(ports, { priceOracle: new FakePriceOracle() })).toThrow(/unknown pair nope/);
  });
});

describe("RateLoop", () => {
  it("proposes a move of at least 5 percent through one journaled operation and one keyed submit", async () => {
    const { ports, tick } = setup();
    const result = await tick();
    expect(result.status).toBe("acted");
    const ops = await rateOps(ports);
    expect(ops).toHaveLength(1);
    expect(ops[0]).toMatchObject({ status: "completed", step: "confirmed", scopes: [{ kind: "gas", chainId: 1001 }] });
    expect(ports.executor.submissions).toHaveLength(1);
    expect(ports.executor.submissions[0]!.options).toMatchObject({
      idempotencyKey: `op:${ops[0]!.id}:step:update:1`,
      operationId: ops[0]!.id,
    });
    expect(submittedRates(ports)).toEqual([3000n * E18]);
    expect((await ports.journal.getTransaction(`op:${ops[0]!.id}:step:update:1`))?.status).toBe("confirmed");
    const [price] = await ports.journal.observations("price:ETH");
    expect(price!.value).toMatchObject({ kind: "price", priceE18: 3000n * E18 });
    const [rate] = await ports.journal.observations("rate:usdc-home");
    expect(rate!.value).toMatchObject({
      status: "update-due",
      marketRateE18: 3000n * E18,
      currentRateE18: 2800n * E18,
    });
  });

  it("proposes exactly at the trigger and stays idle below it", async () => {
    const atTrigger = setup({}, 2800n * E18, 2940n * E18);
    expect((await atTrigger.tick()).status).toBe("acted");
    expect(submittedRates(atTrigger.ports)).toEqual([2940n * E18]);

    const below = setup({}, 2800n * E18, 2939n * E18);
    expect((await below.tick()).status).toBe("idle");
    expect(below.ports.executor.submissions).toHaveLength(0);
    expect(await rateOps(below.ports)).toHaveLength(0);
    const [rate] = await below.ports.journal.observations("rate:usdc-home");
    expect(rate!.value).toMatchObject({ status: "within-trigger", changeBps: 496 });
  });

  it("honours a configured trigger", async () => {
    const { ports, tick } = setup({ updateTriggerBps: 1000 });
    expect((await tick()).status).toBe("idle");
    expect(ports.executor.submissions).toHaveLength(0);
  });

  it("quotes ETH in USDC when the pair's quote symbol is USDC", async () => {
    const { ports, oracle, tick } = setup({ pairs: { "usdc-home": { quoteSymbol: "USDC" } } });
    oracle.set("USDC", 960_000_000_000_000_000n);
    expect((await tick()).status).toBe("acted");
    expect(submittedRates(ports)).toEqual([3125n * E18]);
    expect((await ports.journal.observations("price:USDC"))[0]!.value).toMatchObject({ kind: "price" });
  });

  it("records an unavailable price, warns once after N misses, goes critical once past the limit", async () => {
    const { ports, oracle, tick } = setup({ priceMissesBeforeWarning: 3, priceUnavailableCriticalSeconds: 7200 });
    oracle.setUnavailable("ETH", "disagreement", "spread 900 bps");
    for (let i = 0; i < 2; i++) {
      expect((await tick()).status).toBe("deferred");
      ports.clock.advance(60_000);
    }
    expect((await ports.journal.observations("price:ETH"))[0]!.value).toEqual({
      kind: "unavailable",
      reason: "disagreement",
      detail: "spread 900 bps",
    });
    expect(ports.notifier.sent).toHaveLength(0);
    await tick();
    await tick();
    expect(ports.notifier.bySeverity("warning")).toHaveLength(1);
    expect(ports.notifier.bySeverity("warning")[0]).toMatchObject({
      dedupKey: "rate:usdc-home:price-unavailable",
      pairId: "usdc-home",
    });
    expect(ports.notifier.bySeverity("critical")).toHaveLength(0);
    ports.clock.advance(2 * HOUR);
    await tick();
    await tick();
    expect(ports.notifier.bySeverity("critical")).toHaveLength(1);
    expect(ports.notifier.bySeverity("critical")[0]!.dedupKey).toBe("rate:usdc-home:price-unavailable-critical");
    expect(ports.executor.submissions).toHaveLength(0);
    expect((await ports.journal.observations("rate:usdc-home"))[0]!.value).toMatchObject({
      status: "price-unavailable",
      priceMisses: 6,
    });

    // recovery resets the counters
    oracle.set("ETH", 3000n * E18);
    expect((await tick()).status).toBe("acted");
    expect((await ports.journal.observations("rate:usdc-home"))[0]!.value).toMatchObject({ priceMisses: 0 });
  });

  it.each([
    ["failed (simulation)", { status: "failed", error: COOLDOWN } satisfies SubmitOutcome],
    ["reverted (on chain)", { status: "reverted", hash: fakeHash("r"), reason: COOLDOWN } satisfies SubmitOutcome],
  ])("defers a cooldown rejection %s without a second submit until the cooldown elapsed", async (_, outcome) => {
    const { ports, tick } = setup({ cooldownSeconds: 3600 });
    ports.executor.script((_r, o) => o.idempotencyKey.endsWith(":update:1"), outcome);
    expect((await tick()).status).toBe("deferred");
    const [op] = await rateOps(ports);
    expect(op).toMatchObject({ status: "open", step: "deferred", stepPayload: { lastRejection: "cooldown" } });
    for (const minutes of [1, 30, 59]) {
      ports.clock.current = new Date(op!.updatedAt.getTime() + minutes * 60_000);
      expect((await tick()).status).toBe("deferred");
    }
    expect(ports.executor.submissions).toHaveLength(1);
    expect(ports.notifier.sent).toHaveLength(0);
    ports.clock.current = new Date(op!.updatedAt.getTime() + HOUR);
    expect((await tick()).status).toBe("acted");
    expect(ports.executor.submissions.map((s) => s.options.idempotencyKey)).toEqual([
      `op:${op!.id}:step:update:1`,
      `op:${op!.id}:step:update:2`,
    ]);
    expect((await ports.journal.getOperation(op!.id))!.status).toBe("completed");
    expect(await rateOps(ports)).toHaveLength(1);
    submittedRates(ports);
  });

  it("turns a replaced outcome into attention and proposes nothing new while it is unresolved", async () => {
    const { ports, tick } = setup();
    ports.executor.script(() => true, { status: "replaced", hash: fakeHash("a"), replacedByHash: fakeHash("b") });
    await tick();
    const [op] = await rateOps(ports);
    expect(op).toMatchObject({ status: "attention" });
    expect(op!.lastError).toContain("replaced");
    expect(ports.notifier.bySeverity("warning")).toHaveLength(1);
    ports.clock.advance(HOUR);
    expect((await tick()).status).toBe("suspended");
    expect(ports.executor.submissions).toHaveLength(1);
    expect((await ports.journal.observations("suspended:rate:usdc-home"))[0]!.value).toMatchObject({ active: true });

    // the operator resolves it: the loop clears its suspension and proposes again
    await ports.journal.updateOperation(op!.id, { status: "failed" });
    expect((await tick()).status).toBe("acted");
    expect((await ports.journal.observations("suspended:rate:usdc-home"))[0]!.value).toMatchObject({ active: false });
    submittedRates(ports);
  });

  it("clears its own suspension when the reason no longer holds, and a restart clears nothing by itself", async () => {
    const { ports, tick } = setup();
    const suspended = async () => (await ports.journal.observations("suspended:rate:usdc-home"))[0]?.value;
    ports.executor.script(() => ports.executor.submissions.length === 0, {
      status: "replaced",
      hash: fakeHash("a"),
      replacedByHash: fakeHash("b"),
    });
    await tick();
    const [op] = await rateOps(ports);
    ports.clock.advance(HOUR);
    expect((await tick()).status).toBe("suspended");
    expect(await suspended()).toMatchObject({ active: true });

    // a restart: a new loop on the same journal finds the reason still there and stays suspended
    const restarted = createRatesLoops(ports, { priceOracle: new FakePriceOracle().set("ETH", 3000n * E18) })[0]!;
    const tickRestarted = () => restarted.tick({ now: ports.clock.now(), signal: new AbortController().signal });
    ports.clock.advance(HOUR);
    expect((await tickRestarted()).status).toBe("suspended");
    expect(await suspended()).toMatchObject({ active: true });
    expect(ports.executor.submissions).toHaveLength(1);
    expect(ports.notifier.sent.filter((n) => n.dedupKey === "suspended:rate:usdc-home").length).toBeGreaterThan(0);

    // the reason goes away (the operator resolves the operation): the restarted loop clears it on its next tick
    await ports.journal.updateOperation(op!.id, { status: "failed" });
    expect((await tickRestarted()).status).toBe("acted");
    expect(await suspended()).toMatchObject({ active: false, reason: null });
    expect(ports.executor.submissions).toHaveLength(2);
  });

  it("notifies an out-of-bounds rejection and proposes the unadjusted market rate next time", async () => {
    const { ports, oracle, tick } = setup({ rejectionRetrySeconds: 1800 });
    oracle.set("ETH", 6000n * E18);
    ports.executor.script(...failedOnAttempt(1, OUT_OF_BOUNDS));
    expect((await tick()).status).toBe("deferred");
    expect(ports.notifier.bySeverity("warning")).toHaveLength(1);
    expect(ports.notifier.bySeverity("warning")[0]).toMatchObject({
      dedupKey: "rate:usdc-home:out-of-bounds",
      pairId: "usdc-home",
      chainId: EXAMPLE_CHAINS.foreignUsdc,
    });
    ports.clock.advance(1799_000);
    await tick();
    expect(ports.executor.submissions).toHaveLength(1);
    ports.clock.advance(1000);
    oracle.set("ETH", 6100n * E18);
    expect((await tick()).status).toBe("acted");
    expect(submittedRates(ports)).toEqual([6000n * E18, 6100n * E18]);
  });

  it("raises one critical with the dedup key on repeated rejections", async () => {
    const { ports, tick } = setup({ rejectionsBeforeCritical: 3, rejectionRetrySeconds: 600 });
    ports.executor.script(() => true, { status: "failed", error: MAX_CHANGE });
    for (let i = 0; i < 5; i++) {
      expect((await tick()).status).toBe("deferred");
      ports.clock.advance(600_000);
    }
    const [op] = await rateOps(ports);
    expect(ports.executor.submissions.map((s) => s.options.idempotencyKey)).toEqual(
      [1, 2, 3, 4, 5].map((n) => `op:${op!.id}:step:update:${n}`)
    );
    const critical = ports.notifier.bySeverity("critical");
    expect(critical).toHaveLength(1);
    expect(critical[0]).toMatchObject({ dedupKey: "rate:usdc-home:rejected", operationId: op!.id });
    expect(ports.notifier.bySeverity("warning").every((n) => n.dedupKey === "rate:usdc-home:max-change")).toBe(true);
    expect(submittedRates(ports)).toEqual(Array(5).fill(3000n * E18));
    expect(op!.attempts).toBe(5);
  });

  it("retries aborted: failures next tick under a new key without counting a rejection or notifying", async () => {
    const { ports, tick } = setup({ rejectionsBeforeCritical: 2, rejectionRetrySeconds: 600 });
    const ABORTED = "aborted: shutdown revertData=none";
    for (const attempt of [1, 2, 3]) ports.executor.script(...failedOnAttempt(attempt, ABORTED));
    for (let i = 0; i < 3; i++) {
      expect((await tick()).status).toBe("deferred");
      const [op] = await rateOps(ports);
      expect(op!.stepPayload).toMatchObject({ attempt: i + 1, rejections: 0, deferUntil: null });
      expect(op).toMatchObject({ status: "open", step: "deferred", lastError: ABORTED, attempts: 0 });
    }
    expect(ports.notifier.bySeverity("warning")).toHaveLength(0);
    expect(ports.notifier.bySeverity("critical")).toHaveLength(0);

    // No clock advance: the next tick submits attempt 4 at once, with the unadjusted market rate.
    expect((await tick()).status).toBe("acted");
    const [op] = await rateOps(ports);
    expect(ports.executor.submissions.map((s) => s.options.idempotencyKey)).toEqual(
      [1, 2, 3, 4].map((n) => `op:${op!.id}:step:update:${n}`)
    );
    expect(submittedRates(ports)).toEqual(Array(4).fill(3000n * E18));
    expect(op).toMatchObject({ status: "completed", step: "confirmed" });
    expect(op!.stepPayload).toMatchObject({ rejections: 0, criticalNotified: false });
  });

  it("closes a deferred operation when the market comes back within the trigger", async () => {
    const { ports, oracle, tick } = setup({ cooldownSeconds: 600 });
    ports.executor.script(...failedOnAttempt(1, COOLDOWN));
    await tick();
    oracle.set("ETH", 2850n * E18);
    ports.clock.advance(600_000);
    expect((await tick()).status).toBe("idle");
    const [op] = await rateOps(ports);
    expect(op).toMatchObject({ status: "completed", step: "superseded" });
    expect(ports.executor.submissions).toHaveLength(1);
  });

  it("waits on a pending submit and completes on confirmation without resubmitting", async () => {
    const { ports, tick } = setup();
    ports.executor.script(() => true, { status: "pending", hash: fakeHash("p") });
    expect((await tick()).status).toBe("acted");
    const [op] = await rateOps(ports);
    expect(op).toMatchObject({ status: "open", step: "pending" });
    expect((await tick()).status).toBe("deferred");
    ports.executor.settle(`op:${op!.id}:step:update:1`, {
      status: "confirmed",
      hash: fakeHash("p"),
      blockNumber: 5n,
      gasUsed: 50_000n,
    });
    expect((await tick()).status).toBe("acted");
    expect((await ports.journal.getOperation(op!.id))!.status).toBe("completed");
    expect(ports.executor.submissions).toHaveLength(1);
  });

  it("notifies an unknown rejection (revertData=none) and an unauthorized one", async () => {
    const { ports, tick } = setup({ rejectionRetrySeconds: 60 });
    ports.executor.script(...failedOnAttempt(1, "gas estimation failed revertData=none"));
    ports.executor.script(...failedOnAttempt(2, revert("RateUpdaterUnauthorized", [ports.signer])));
    await tick();
    expect(ports.notifier.bySeverity("warning")[0]!.dedupKey).toBe("rate:usdc-home:unknown-rejection");
    ports.clock.advance(60_000);
    await tick();
    expect(ports.notifier.bySeverity("critical")[0]!.dedupKey).toBe("rate:usdc-home:unauthorized");
    submittedRates(ports);
  });

  it("resumes an operation persisted before its submit under the same key", async () => {
    const { ports, tick } = setup();
    const op = await ports.journal.createOperation({
      kind: "rate-update",
      description: "crashed",
      scopes: [{ kind: "gas", chainId: EXAMPLE_CHAINS.foreignUsdc }],
      pairId: "usdc-home",
      payload: null,
    });
    await ports.journal.updateOperation(op.id, {
      step: "submitting",
      stepPayload: {
        attempt: 2,
        rateE18: 2990n * E18,
        currentRateE18: 2800n * E18,
        hash: null,
        deferUntil: null,
        rejections: 1,
        lastRejection: "cooldown",
        criticalNotified: false,
      },
    });
    expect((await tick()).status).toBe("acted");
    expect(ports.executor.submissions.map((s) => s.options.idempotencyKey)).toEqual([`op:${op.id}:step:update:2`]);
    expect(submittedRates(ports)).toEqual([2990n * E18]);
  });

  it("closes an operation abandoned before its first step and proposes afresh", async () => {
    const { ports, tick } = setup();
    const stale = await ports.journal.createOperation({
      kind: "rate-update",
      description: "crashed",
      scopes: [],
      pairId: "usdc-home",
      payload: null,
    });
    expect((await tick()).status).toBe("acted");
    expect((await ports.journal.getOperation(stale.id))!.status).toBe("failed");
    expect(ports.executor.submissions).toHaveLength(1);
  });

  it("fails the tick when the current rate cannot be read", async () => {
    const ports = makeFakePorts();
    const loops = createRatesLoops(ports, { priceOracle: new FakePriceOracle().set("ETH", 3000n * E18) });
    const result = await loops[0]!.tick({ now: ports.clock.now(), signal: new AbortController().signal });
    expect(result.status).toBe("failed");
    expect(ports.executor.submissions).toHaveLength(0);
    expect((await ports.journal.observations("rate:usdc-home"))[0]!.value).toMatchObject({ status: "read-error" });
  });
});
