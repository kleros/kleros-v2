import { describe, expect, it } from "vitest";
import type { Asset, Loop, TxRequest } from "../domain";
import type {
  GatewayRateRejection,
  GatewayRateTarget,
  GatewayRateValue,
  KeeperGuardrails,
  SubmitOptions,
  SubmitOutcome,
} from "../ports";
import {
  EXAMPLE_ADDRESSES,
  EXAMPLE_CHAINS,
  exampleConfig,
  FakeForeignGatewayRates,
  fakeHash,
  FakePriceOracle,
  makeFakePorts,
  type FakePorts,
} from "../testing";
import { createRatesLoops } from "./index";
import { homeNativeValue, RateLoop, stepToward, tokenValue } from "./loop";

const E18 = 10n ** 18n;
const HOUR = 3_600_000;
const MINUTE = 60_000;
const BPS = 10_000n;
const USDC: Asset = {
  chainId: EXAMPLE_CHAINS.foreignEth,
  address: EXAMPLE_ADDRESSES.usdcOnForeignEth,
  symbol: "USDC",
  decimals: 6,
};
const HOME_NATIVE: GatewayRateTarget = { kind: "homeNative" };
const USDC_TARGET: GatewayRateTarget = { kind: "token", asset: USDC };
const T0 = new Date("2026-01-01T00:00:00Z");

/**
 * The fake port, counting its reads. `stale` answers model a governor change between the loop's read and its submit:
 * each queued answer is served once, ahead of the values the contract checks against.
 */
class CountingRates extends FakeForeignGatewayRates {
  guardrailReads = 0;
  valueReads = 0;
  readonly staleGuardrails: KeeperGuardrails[] = [];
  readonly staleValues: GatewayRateValue[] = [];

  override async guardrails(): Promise<KeeperGuardrails> {
    this.guardrailReads++;
    return this.staleGuardrails.shift() ?? super.guardrails();
  }

  override async current(target: GatewayRateTarget): Promise<GatewayRateValue> {
    this.valueReads++;
    return this.staleValues.shift() ?? super.current(target);
  }
}

type QueuedOutcome = GatewayRateRejection | "aborted";

/**
 * The contract's own checks, for a keeper, over the values the fake port serves. `chainLagMs` puts the chain's block
 * time behind the bot's clock; `queue` answers the next submissions with rejections or aborts instead of the checks.
 */
class ContractSim {
  private readonly state = new Map<string, { value: bigint; last: Date | null }>();
  chainLagMs = 0;
  readonly queue: QueuedOutcome[] = [];
  constructor(
    private readonly ports: FakePorts,
    readonly rates: CountingRates
  ) {
    ports.executor.script(
      (request, options) => this.scripts.some((x) => x.match(request, options)),
      (request, options) => {
        const script = this.scripts.find((x) => x.match(request, options))!;
        return typeof script.outcome === "function" ? script.outcome(request, options) : script.outcome;
      }
    );
    ports.executor.script(
      () => true,
      () => this.apply()
    );
  }

  private readonly scripts: Array<{
    match: (request: TxRequest, options: SubmitOptions) => boolean;
    outcome: SubmitOutcome | ((request: TxRequest, options: SubmitOptions) => SubmitOutcome);
  }> = [];

  /** An outcome that replaces the contract's answer for the matching submissions. */
  script(
    match: (request: TxRequest, options: SubmitOptions) => boolean,
    outcome: SubmitOutcome | (() => SubmitOutcome)
  ): void {
    this.scripts.push({ match, outcome });
  }

  private key(target: GatewayRateTarget): string {
    return target.kind === "homeNative" ? "homeNative" : target.asset.symbol;
  }

  set(target: GatewayRateTarget, value: bigint, decimals: number, last: Date | null = null): void {
    this.state.set(this.key(target), { value, last });
    this.rates.setValue(target, value, decimals, last);
  }

  value(target: GatewayRateTarget): bigint {
    return this.state.get(this.key(target))!.value;
  }

  /** The governor's write: no guardrail applies and `lastKeeperUpdate` is left as it is. */
  setByGovernor(target: GatewayRateTarget, value: bigint, decimals: number): void {
    this.set(target, value, decimals, this.state.get(this.key(target))?.last ?? null);
  }

  chainNow(): Date {
    return new Date(this.ports.clock.now().getTime() - this.chainLagMs);
  }

  private apply(): SubmitOutcome {
    const { target, value } = this.rates.updates.at(-1)!;
    const entry = this.state.get(this.key(target))!;
    const { maxChangeBps, cooldownSeconds } = this.rates.guardrailValues;
    const now = this.chainNow();
    const reject = (rejection: GatewayRateRejection): SubmitOutcome => {
      this.rates.rejection = rejection;
      return { status: "failed", error: `rejected ${rejection} revertData=none` };
    };
    const queued = this.queue.shift();
    if (queued === "aborted") return { status: "failed", error: "aborted: shutdown requested revertData=none" };
    if (queued) return reject(queued);
    if (entry.last && now.getTime() < entry.last.getTime() + Number(cooldownSeconds) * 1000) return reject("cooldown");
    const change = value > entry.value ? value - entry.value : entry.value - value;
    if (change * BPS > entry.value * maxChangeBps) return reject("max-change");
    const decimals = (target.kind === "token" ? 0 : 18) as number;
    this.set(target, value, decimals, now);
    return { status: "confirmed", hash: fakeHash(`${this.key(target)}:${value}`), blockNumber: 1n, gasUsed: 1n };
  }
}

interface Setup {
  ports: FakePorts;
  oracle: FakePriceOracle;
  rates: CountingRates;
  sim: ContractSim;
  loop: RateLoop;
  tick: () => ReturnType<Loop["tick"]>;
  submitted: () => bigint[];
  /** A new loop over the same journal, executor and contract: a restart. */
  restart: () => void;
}

/** pair `usdc-home` (native USDC) with the `homeNative` target, or `eth-home` (ETH, USDC) with the token target. */
function setup(
  kind: "homeNative" | "token",
  initial: bigint,
  eth = 3000n * E18,
  rates: Record<string, unknown> = {}
): Setup {
  const ports = makeFakePorts(exampleConfig({ rates: { pairs: {}, ...rates } as never }));
  ports.clock.current = T0;
  const pair = ports.config.topology.pairs.find((p) => p.id === (kind === "homeNative" ? "usdc-home" : "eth-home"))!;
  const fake = new CountingRates(pair.id, pair.foreignChainId, pair.foreignGateway);
  const sim = new ContractSim(ports, fake);
  const target = kind === "homeNative" ? HOME_NATIVE : USDC_TARGET;
  sim.set(target, initial, kind === "homeNative" ? 18 : 0, new Date(T0.getTime() - 24 * HOUR));
  const oracle = new FakePriceOracle().set("ETH", eth).set("USDC", E18);
  const make = () =>
    new RateLoop(ports, { pair, rates: fake, target, priceOracle: oracle, config: ports.config.rates });
  const setup: Setup = {
    ports,
    oracle,
    rates: fake,
    sim,
    loop: make(),
    tick: () => setup.loop.tick({ now: ports.clock.now(), signal: new AbortController().signal }),
    submitted: () => fake.updates.map((u) => u.value),
    restart: () => {
      setup.loop = make();
    },
  };
  return setup;
}

/** The submissions' attempt numbers, from their idempotency keys. */
function attempts(ports: FakePorts): number[] {
  return ports.executor.submissions.map((s) => Number(s.options.idempotencyKey.split(":").at(-1)));
}

async function streakOf(ports: FakePorts, loopId: string) {
  const key = `rejections:${loopId}`;
  return (await ports.journal.observations(key)).find((o) => o.key === key)?.value;
}

/** Ticks once and returns the status with the number of submissions that tick made. */
async function tickCounted(s: Setup): Promise<{ status: string; submits: number }> {
  const before = s.ports.executor.submissions.length;
  const { status } = await s.tick();
  return { status, submits: s.ports.executor.submissions.length - before };
}

async function rateOps(ports: FakePorts, pairId: string) {
  return ports.journal.listOperations({ kind: "rate-update", pairId });
}

describe("market values", () => {
  it("homeNative is ETH/USD divided by the quote's USD price, e18", () => {
    expect(homeNativeValue(3000n * E18, null)).toBe(3000n * E18);
    expect(homeNativeValue(3000n * E18, 960_000_000_000_000_000n)).toBe(3125n * E18);
  });

  it("a token's rateInEth is wei per smallest unit scaled by rateDecimals, and rises when ETH falls", () => {
    expect(tokenValue(E18, 3000n * E18, 6, 0)).toBe(333_333_333n);
    expect(tokenValue(E18, 2900n * E18, 6, 0)).toBeGreaterThan(333_333_333n);
    // DAI on Arbitrum: 0.000603 ETH per DAI, 18 decimals, rateDecimals 11
    expect(tokenValue(E18, 1658n * E18, 18, 11)).toBe(60_313_630n);
  });

  it("steps stay inside the contract's check exactly in integers", () => {
    for (const [current, market, bps] of [
      [1000n, 1200n, 500n],
      [1000n, 800n, 500n],
      [333_333_333n, 400_000_000n, 500n],
      [7n, 100n, 500n],
      [E18, 3n * E18, 1234n],
    ] as const) {
      const next = stepToward(current, market, bps);
      const change = next > current ? next - current : current - next;
      expect(change * BPS).toBeLessThanOrEqual(current * bps);
      // it is the closest allowed value: one more unit toward the market would break the check
      if (next !== market) {
        const beyond = market > current ? next + 1n : next - 1n;
        const beyondChange = beyond > current ? beyond - current : current - beyond;
        expect(beyondChange * BPS).toBeGreaterThan(current * bps);
      }
    }
    expect(stepToward(1000n, 1030n, 500n)).toBe(1030n);
  });
});

describe("createRatesLoops", () => {
  const priceOracle = new FakePriceOracle();

  it("creates no loop for an empty section", () => {
    expect(createRatesLoops(makeFakePorts(), { priceOracle })).toEqual([]);
  });

  it("creates one loop per pair and target, from the configuration only", () => {
    const rates = {
      pairs: {
        "usdc-home": { targets: ["homeNative"] },
        "eth-home": { targets: [{ token: "USDC" }] },
      },
    };
    const loops = createRatesLoops(makeFakePorts(exampleConfig({ rates } as never)), { priceOracle });
    expect(loops.map((l) => l.id)).toEqual(["rate:usdc-home:homeNative", "rate:eth-home:USDC"]);
  });

  it("refuses homeNative on eth-home, whose foreign and home chains are both ETH-native, naming the key", () => {
    const rates = { pairs: { "eth-home": { targets: ["homeNative", { token: "USDC" }] } } };
    const ports = makeFakePorts(exampleConfig({ rates } as never));
    expect(() => createRatesLoops(ports, { priceOracle })).toThrow(
      /^rates\.pairs\.eth-home\.targets: homeNative is fixed at 1e18 .* native currency ETH/
    );
  });

  it("builds usdc-home's homeNative loop with rateCurrency USD: its native USDC is not the home chain's ETH", () => {
    const config = exampleConfig({ rates: { pairs: { "usdc-home": { targets: ["homeNative"] } } } } as never);
    expect(config.topology.pairs.find((p) => p.id === "usdc-home")!.rateCurrency).toBe("USD");
    expect(createRatesLoops(makeFakePorts(config), { priceOracle }).map((l) => l.id)).toEqual([
      "rate:usdc-home:homeNative",
    ]);
  });

  it.each([
    ["an unknown symbol", { token: "DAI" }, /rates\.pairs\.eth-home\.targets: token DAI/],
    ["the native asset", { token: "ETH" }, /rates\.pairs\.eth-home\.targets: ETH is the native currency/],
  ])("refuses %s as a token target, naming the key", (_, target, message) => {
    const rates = { pairs: { "eth-home": { targets: [target] } } };
    expect(() => createRatesLoops(makeFakePorts(exampleConfig({ rates } as never)), { priceOracle })).toThrow(message);
  });

  it("refuses a target listed twice and settings for an unknown pair", () => {
    const twice = { pairs: { "eth-home": { targets: [{ token: "USDC" }, { token: "USDC" }] } } };
    expect(() => createRatesLoops(makeFakePorts(exampleConfig({ rates: twice } as never)), { priceOracle })).toThrow(
      /listed twice/
    );
    const unknown = { pairs: { nope: { targets: ["homeNative"] } } };
    expect(() => createRatesLoops(makeFakePorts(exampleConfig({ rates: unknown } as never)), { priceOracle })).toThrow(
      /unknown pair nope/
    );
  });
});

describe("RateLoop stepping", () => {
  it("is idle under updateTriggerBps and journals nothing", async () => {
    const { ports, tick } = setup("homeNative", 2900n * E18); // 3000 vs 2900: 344 bps
    expect((await tick()).status).toBe("idle");
    expect(ports.executor.submissions).toHaveLength(0);
    expect(await rateOps(ports, "usdc-home")).toHaveLength(0);
    const [rate] = await ports.journal.observations("rate:usdc-home:homeNative");
    expect(rate!.value).toMatchObject({ status: "within-trigger", changeBps: 344 });
  });

  it("reaches a 12 percent move in three allowed steps, each after the cooldown", async () => {
    const { ports, sim, rates, tick, submitted } = setup(
      "homeNative",
      2679n * E18 + 285_714_285_714_285_714n,
      3000n * E18
    );
    const start = sim.value(HOME_NATIVE);
    const target = 3000n * E18;
    expect(rateChangeOf(start, target)).toBeGreaterThan(1150);
    rates.guardrailValues = { maxChangeBps: 500n, cooldownSeconds: 3600n };

    const stepAt: number[] = [];
    for (let cycle = 0; cycle < 3; cycle++) {
      expect((await tick()).status).toBe("acted");
      stepAt.push(ports.clock.now().getTime());
      // right after a step the cooldown holds: nothing is submitted
      expect((await tick()).status).toBe(cycle < 2 ? "deferred" : "idle");
      expect(submitted()).toHaveLength(cycle + 1);
      ports.clock.advance(HOUR);
    }
    expect(submitted()).toHaveLength(3);
    expect(sim.value(HOME_NATIVE)).toBe(target);
    expect(stepAt[1]! - stepAt[0]!).toBeGreaterThanOrEqual(HOUR);
    // every proposed step passed the contract's check (the sim would have rejected it)
    expect(ports.executor.submissions.every((s) => s.outcome.status === "confirmed")).toBe(true);
    expect((await tick()).status).toBe("idle");
    expect(submitted()).toHaveLength(3);
  });

  it("does not stop 2 percent short of a 7 percent move (settle rule)", async () => {
    const { ports, sim, tick, submitted } = setup("homeNative", 1000n * E18, 1070n * E18);
    expect((await tick()).status).toBe("acted");
    expect(sim.value(HOME_NATIVE)).toBe(1050n * E18);
    ports.clock.advance(HOUR);
    // 1050 -> 1070 is 190 bps: under updateTriggerBps (500), above settleBps (50)
    expect((await tick()).status).toBe("acted");
    expect(sim.value(HOME_NATIVE)).toBe(1070n * E18);
    ports.clock.advance(HOUR);
    expect((await tick()).status).toBe("idle");
    expect(submitted()).toEqual([1050n * E18, 1070n * E18]);
  });

  it("stops settling under settleBps and does not step a move that never reached the trigger", async () => {
    const { ports, sim, oracle, tick, submitted } = setup("homeNative", 1000n * E18, 1060n * E18);
    await tick(); // 1050
    ports.clock.advance(HOUR);
    oracle.set("ETH", 1050n * E18 + 4n * E18); // 38 bps from 1050: under settleBps
    expect((await tick()).status).toBe("idle");
    expect(submitted()).toHaveLength(1);
    // a later 300 bps move is under the trigger and no run is active
    oracle.set("ETH", 1082n * E18);
    ports.clock.advance(HOUR);
    expect((await tick()).status).toBe("idle");
    expect(sim.value(HOME_NATIVE)).toBe(1050n * E18);
  });

  it("raises a token's rateInEth when ETH/USD falls, keeping the stored decimals", async () => {
    const { sim, oracle, tick, submitted, rates } = setup("token", 333_333_333n, 3000n * E18);
    oracle.set("ETH", 2900n * E18); // 3.4 percent lower ETH: within the trigger
    expect((await tick()).status).toBe("idle");
    oracle.set("ETH", 2700n * E18); // market 370_370_370: +11.1 percent
    expect((await tick()).status).toBe("acted");
    expect(submitted()).toEqual([349_999_999n]);
    expect(sim.value(USDC_TARGET)).toBeGreaterThan(333_333_333n);
    expect(rates.updates[0]!.target).toEqual(USDC_TARGET);
  });

  it("honours guardrails changed between cycles", async () => {
    const { ports, rates, sim, tick } = setup("homeNative", 1000n * E18, 1500n * E18);
    await tick();
    expect(sim.value(HOME_NATIVE)).toBe(1050n * E18);
    rates.guardrailValues = { maxChangeBps: 1000n, cooldownSeconds: 7200n };
    ports.clock.advance(HOUR); // the old cooldown has passed, the new one has not
    expect((await tick()).status).toBe("deferred");
    ports.clock.advance(HOUR);
    expect((await tick()).status).toBe("acted");
    expect(sim.value(HOME_NATIVE)).toBe(1155n * E18);
  });

  it("does not submit before lastKeeperUpdate plus the cooldown", async () => {
    const { ports, sim, rates, tick } = setup("homeNative", 1000n * E18, 1500n * E18);
    sim.set(HOME_NATIVE, 1000n * E18, 18, new Date(T0.getTime() - 20 * 60_000));
    expect((await tick()).status).toBe("deferred");
    expect(ports.executor.submissions).toHaveLength(0);
    expect(rates.updates).toHaveLength(0);
    ports.clock.advance(40 * 60_000);
    expect((await tick()).status).toBe("acted");
  });

  it("notifies once for a zero value and submits nothing", async () => {
    const { ports, tick } = setup("token", 0n);
    for (let i = 0; i < 3; i++) expect((await tick()).status).toBe("deferred");
    expect(ports.executor.submissions).toHaveLength(0);
    expect(ports.notifier.sent.map((n) => n.dedupKey)).toEqual(["rate:eth-home:USDC:zero-value"]);
    expect(await rateOps(ports, "eth-home")).toHaveLength(0);
  });

  it("refuses a token market value above 2^64 - 1 without submitting", async () => {
    // rateDecimals 12 makes the market value 333_333_333 * 10^12, far above a uint64
    const { ports, rates, sim, tick } = setup("token", 333_333_333n, 3000n * E18);
    sim.set(USDC_TARGET, 333_333_333_000_000n, 12, new Date(T0.getTime() - 24 * HOUR));
    const market = 333_333_333n * 10n ** 12n;
    expect(market).toBeGreaterThan(2n ** 64n - 1n);
    expect((await tick()).status).toBe("deferred");
    expect(ports.executor.submissions).toHaveLength(0);
    expect(rates.updates).toHaveLength(0);
    expect(ports.notifier.sent.map((n) => n.dedupKey)).toEqual(["rate:eth-home:USDC:market-out-of-range"]);
  });

  it("behaves as before on an unavailable price", async () => {
    const { ports, oracle, tick } = setup("homeNative", 2800n * E18, 3000n * E18, {
      priceMissesBeforeWarning: 3,
      priceUnavailableCriticalSeconds: 7200,
    });
    oracle.setUnavailable("ETH", "disagreement", "spread 900 bps");
    for (let i = 0; i < 2; i++) {
      expect((await tick()).status).toBe("deferred");
      ports.clock.advance(60_000);
    }
    expect(ports.notifier.sent).toHaveLength(0);
    await tick();
    expect(ports.notifier.bySeverity("warning").map((n) => n.dedupKey)).toEqual([
      "rate:usdc-home:homeNative:price-unavailable",
    ]);
    ports.clock.advance(2 * HOUR);
    await tick();
    expect(ports.notifier.bySeverity("critical").map((n) => n.dedupKey)).toEqual([
      "rate:usdc-home:homeNative:price-unavailable-critical",
    ]);
    expect(ports.executor.submissions).toHaveLength(0);
    oracle.set("ETH", 3000n * E18);
    expect((await tick()).status).toBe("acted");
    expect((await ports.journal.observations("rate:usdc-home:homeNative"))[0]!.value).toMatchObject({
      priceMisses: 0,
    });
  });
});

describe("RateLoop rejections", () => {
  it("notifies decimals and invalid-rate as warnings, then waits rejectionRetrySeconds", async () => {
    const { ports, sim, rates, tick } = setup("homeNative", 2800n * E18, 3000n * E18, { rejectionRetrySeconds: 600 });
    sim.script(
      () => ports.executor.submissions.length === 0,
      () => {
        rates.rejection = "decimals";
        return { status: "failed", error: "x revertData=none" };
      }
    );
    sim.script(
      () => ports.executor.submissions.length === 1,
      () => {
        rates.rejection = "invalid-rate";
        return { status: "failed", error: "x revertData=none" };
      }
    );
    expect((await tick()).status).toBe("deferred");
    ports.clock.advance(599_000);
    expect((await tick()).status).toBe("deferred");
    expect(ports.executor.submissions).toHaveLength(1);
    ports.clock.advance(1000);
    expect((await tick()).status).toBe("deferred");
    expect(ports.notifier.bySeverity("warning").map((n) => n.dedupKey)).toEqual([
      "rate:usdc-home:homeNative:decimals",
      "rate:usdc-home:homeNative:invalid-rate",
    ]);
  });

  it("notifies unauthorized as one critical and unknown as a warning", async () => {
    const { ports, sim, rates, tick } = setup("homeNative", 2800n * E18, 3000n * E18, { rejectionRetrySeconds: 60 });
    const reject = (rejection: GatewayRateRejection, nth: number) =>
      sim.script(
        () => ports.executor.submissions.length === nth,
        () => {
          rates.rejection = rejection;
          return { status: "failed", error: "x revertData=none" };
        }
      );
    reject("unauthorized", 0);
    reject("unauthorized", 1);
    reject("unknown", 2);
    for (let i = 0; i < 3; i++) {
      expect((await tick()).status).toBe("deferred");
      ports.clock.advance(60_000);
    }
    const critical = ports.notifier.bySeverity("critical");
    expect(critical.filter((n) => n.dedupKey === "rate:usdc-home:homeNative:unauthorized").length).toBe(2);
    expect(ports.notifier.bySeverity("warning").map((n) => n.dedupKey)).toContain(
      "rate:usdc-home:homeNative:unknown-rejection"
    );
  });

  it("turns a replaced outcome into attention and suspends only that target", async () => {
    const { ports, sim, rates, tick } = setup("homeNative", 2800n * E18, 3000n * E18);
    sim.script(() => rates.updates.length === 1, {
      status: "replaced",
      hash: fakeHash("a"),
      replacedByHash: fakeHash("b"),
    });
    await tick();
    const [op] = await rateOps(ports, "usdc-home");
    expect(op).toMatchObject({ status: "attention" });
    expect((await tick()).status).toBe("suspended");
    expect((await ports.journal.observations("suspended:rate:usdc-home:homeNative"))[0]!.value).toMatchObject({
      active: true,
    });
    await ports.journal.updateOperation(op!.id, { status: "failed" });
    expect((await tick()).status).toBe("acted");
    expect((await ports.journal.observations("suspended:rate:usdc-home:homeNative"))[0]!.value).toMatchObject({
      active: false,
    });
  });

  it("waits on a pending submit and completes on confirmation without resubmitting", async () => {
    const { ports, sim, tick } = setup("homeNative", 2800n * E18, 3000n * E18);
    sim.script(() => true, { status: "pending", hash: fakeHash("p") });
    expect((await tick()).status).toBe("acted");
    const [op] = await rateOps(ports, "usdc-home");
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

  it("closes a deferred operation when the market comes back within settleBps", async () => {
    const { ports, sim, rates, oracle, tick } = setup("homeNative", 2800n * E18, 3000n * E18, {
      rejectionRetrySeconds: 600,
    });
    sim.script(
      () => true,
      () => {
        rates.rejection = "unknown";
        return { status: "failed", error: "x revertData=none" };
      }
    );
    await tick();
    oracle.set("ETH", 2810n * E18); // under settleBps: the run is over
    ports.clock.advance(600_000);
    expect((await tick()).status).toBe("idle");
    expect(await rateOps(ports, "usdc-home")).toMatchObject([{ status: "completed", step: "superseded" }]);
  });

  it("resumes an operation persisted before its submit under the same key and value", async () => {
    const { ports, rates, tick } = setup("homeNative", 2800n * E18, 3000n * E18);
    const op = await ports.journal.createOperation({
      kind: "rate-update",
      description: "crashed",
      scopes: [{ kind: "gas", chainId: EXAMPLE_CHAINS.foreignUsdc }],
      pairId: "usdc-home",
      payload: { target: "homeNative" },
    });
    await ports.journal.updateOperation(op.id, {
      step: "submitting",
      stepPayload: {
        attempt: 2,
        value: 2900n * E18,
        currentValue: 2800n * E18,
        hash: null,
        deferUntil: null,
        rejections: 1,
        lastRejection: "cooldown",
        criticalNotified: false,
      },
    });
    expect((await tick()).status).toBe("acted");
    expect(ports.executor.submissions.map((s) => s.options.idempotencyKey)).toEqual([`op:${op.id}:step:update:2`]);
    expect(rates.updates.map((u) => u.value)).toEqual([2900n * E18]);
  });

  it("closes an operation abandoned before its first step and proposes afresh", async () => {
    const { ports, tick } = setup("homeNative", 2800n * E18, 3000n * E18);
    const stale = await ports.journal.createOperation({
      kind: "rate-update",
      description: "crashed",
      scopes: [],
      pairId: "usdc-home",
      payload: { target: "homeNative" },
    });
    expect((await tick()).status).toBe("acted");
    expect((await ports.journal.getOperation(stale.id))!.status).toBe("failed");
  });

  it("fails the tick when the contract cannot be read", async () => {
    const ports = makeFakePorts(
      exampleConfig({ rates: { pairs: { "usdc-home": { targets: ["homeNative"] } } } } as never)
    );
    const [loop] = createRatesLoops(ports, { priceOracle: new FakePriceOracle().set("ETH", 3000n * E18) });
    const result = await loop!.tick({ now: ports.clock.now(), signal: new AbortController().signal });
    expect(result.status).toBe("failed");
    expect(ports.executor.submissions).toHaveLength(0);
    expect((await ports.journal.observations("rate:usdc-home:homeNative"))[0]!.value).toMatchObject({
      status: "read-error",
    });
  });
});

describe("RateLoop after a cooldown or max-change rejection ([L1])", () => {
  const REJECTED = "rate:usdc-home:homeNative:rejected";

  it("with the bot's clock ahead of the chain's, retries a cooldown rejection each tick until it lands", async () => {
    const s = setup("homeNative", 1000n * E18, 1500n * E18);
    const { ports, sim, rates } = s;
    // By the bot's clock the cooldown ended 30 s ago; the chain's latest block is 2 minutes behind that clock.
    sim.set(HOME_NATIVE, 1000n * E18, 18, new Date(T0.getTime() - HOUR - 30_000));
    sim.chainLagMs = 2 * MINUTE;
    expect(await tickCounted(s)).toEqual({ status: "deferred", submits: 1 });
    const [op] = await rateOps(ports, "usdc-home");
    expect(op).toMatchObject({
      status: "open",
      step: "deferred",
      stepPayload: { lastRejection: "cooldown", deferUntil: null },
    });
    // Nothing is held: the next tick re-reads unchanged values and submits again.
    ports.clock.advance(MINUTE);
    expect(await tickCounted(s)).toEqual({ status: "deferred", submits: 1 });
    expect((await ports.journal.getOperation(op!.id))!.stepPayload).toMatchObject({ deferUntil: null });
    // The chain's time passes lastKeeperUpdate + cooldown: the step lands.
    ports.clock.advance(MINUTE);
    expect(await tickCounted(s)).toEqual({ status: "acted", submits: 1 });
    expect(sim.value(HOME_NATIVE)).toBe(1050n * E18);
    expect(s.submitted()).toEqual([1050n * E18, 1050n * E18, 1050n * E18]);
    expect(attempts(ports)).toEqual([1, 2, 3]);
    expect([rates.guardrailReads, rates.valueReads]).toEqual([3, 3]);
    expect(ports.notifier.sent.map((n) => [n.severity, n.dedupKey])).toEqual([
      ["warning", "rate:usdc-home:homeNative:cooldown"],
    ]);
    expect(await streakOf(ports, s.loop.id)).toEqual({ count: 0, criticalNotified: false, warned: [] });
  });

  it("retries a cooldown rejection of the first submit on the next tick, from fresh reads", async () => {
    const s = setup("homeNative", 1000n * E18, 1500n * E18);
    const { ports, sim, rates } = s;
    sim.set(HOME_NATIVE, 1000n * E18, 18, new Date(T0.getTime() - HOUR - 15_000));
    sim.chainLagMs = 45_000;
    expect(await tickCounted(s)).toEqual({ status: "deferred", submits: 1 });
    // The governor raised the limit meanwhile: the retry is computed from the new reads, not the rejected step.
    rates.guardrailValues = { maxChangeBps: 800n, cooldownSeconds: 3600n };
    ports.clock.advance(MINUTE);
    expect(await tickCounted(s)).toEqual({ status: "acted", submits: 1 });
    expect(s.submitted()).toEqual([1050n * E18, 1080n * E18]);
    expect(sim.value(HOME_NATIVE)).toBe(1080n * E18);
    expect([rates.guardrailReads, rates.valueReads]).toEqual([2, 2]);
    expect(await rateOps(ports, "usdc-home")).toHaveLength(1);
    expect(attempts(ports)).toEqual([1, 2]);
  });

  it("retries a cooldown rejection of a continuation step on the next tick, from fresh reads", async () => {
    const s = setup("homeNative", 1000n * E18, 1500n * E18);
    const { ports, sim, rates } = s;
    expect(await tickCounted(s)).toEqual({ status: "acted", submits: 1 }); // step 1: 1050, at chain time T0
    // Step 2 of the move: by the bot's clock the cooldown ended 15 s ago; the chain lags 45 s.
    sim.chainLagMs = 45_000;
    ports.clock.advance(HOUR + 15_000);
    expect(await tickCounted(s)).toEqual({ status: "deferred", submits: 1 });
    // The open operation's next attempt is rejected again, and retried again.
    ports.clock.advance(10_000);
    expect(await tickCounted(s)).toEqual({ status: "deferred", submits: 1 });
    // The governor wrote the value meanwhile: the next attempt steps from the value it reads.
    sim.setByGovernor(HOME_NATIVE, 1100n * E18, 18);
    ports.clock.advance(MINUTE);
    expect(await tickCounted(s)).toEqual({ status: "acted", submits: 1 });
    expect(s.submitted()).toEqual([1050n * E18, 1_102_500n * 10n ** 15n, 1_102_500n * 10n ** 15n, 1155n * E18]);
    expect(sim.value(HOME_NATIVE)).toBe(1155n * E18);
    expect(attempts(ports)).toEqual([1, 1, 2, 3]);
    expect(rates.valueReads).toBe(4);
    expect(await rateOps(ports, "usdc-home")).toMatchObject([{ status: "completed" }, { status: "completed" }]);
  });

  it("after a restart, retries a cooldown rejection of the resumed attempt next tick, from fresh reads", async () => {
    const s = setup("homeNative", 2800n * E18, 3000n * E18);
    const { ports, sim, rates } = s;
    // By the chain's clock the last keeper update was 30 s short of the cooldown when the bot stopped.
    sim.set(HOME_NATIVE, 2800n * E18, 18, new Date(T0.getTime() - HOUR + 30_000));
    const op = await ports.journal.createOperation({
      kind: "rate-update",
      description: "persisted before the restart",
      scopes: [{ kind: "gas", chainId: EXAMPLE_CHAINS.foreignUsdc }],
      pairId: "usdc-home",
      payload: { target: "homeNative" },
    });
    await ports.journal.updateOperation(op.id, {
      step: "submitting",
      stepPayload: {
        attempt: 2,
        value: 2900n * E18,
        currentValue: 2800n * E18,
        hash: null,
        deferUntil: null,
        lastRejection: "max-change",
      },
    });
    s.restart();
    expect(await tickCounted(s)).toEqual({ status: "deferred", submits: 1 });
    expect((await ports.journal.getOperation(op.id))!.stepPayload).toMatchObject({
      lastRejection: "cooldown",
      deferUntil: null,
    });
    ports.clock.advance(MINUTE);
    expect(await tickCounted(s)).toEqual({ status: "acted", submits: 1 });
    // The persisted 2900 was submitted under its own key; the retry is recomputed: 2800 + 5 %.
    expect(s.submitted()).toEqual([2900n * E18, 2940n * E18]);
    expect(attempts(ports)).toEqual([2, 3]);
    expect(rates.guardrailReads).toBe(1);
    expect((await ports.journal.getOperation(op.id))!.status).toBe("completed");
  });

  it("after a restart, retries a pending attempt that reverted on cooldown next tick, from fresh reads", async () => {
    const s = setup("homeNative", 2800n * E18, 3000n * E18);
    const { ports, rates, sim } = s;
    const op = await ports.journal.createOperation({
      kind: "rate-update",
      description: "pending at the restart",
      scopes: [{ kind: "gas", chainId: EXAMPLE_CHAINS.foreignUsdc }],
      pairId: "usdc-home",
      payload: { target: "homeNative" },
    });
    await ports.journal.updateOperation(op.id, {
      step: "pending",
      stepPayload: {
        attempt: 1,
        value: 2940n * E18,
        currentValue: 2800n * E18,
        hash: fakeHash("p"),
        deferUntil: null,
        lastRejection: null,
      },
    });
    ports.executor.settle(`op:${op.id}:step:update:1`, {
      status: "reverted",
      hash: fakeHash("p"),
      reason: "KeeperCooldownActive() revertData=0x",
    });
    rates.rejection = "cooldown";
    s.restart();
    expect(await tickCounted(s)).toEqual({ status: "deferred", submits: 0 });
    expect((await ports.journal.getOperation(op.id))!.stepPayload).toMatchObject({
      lastRejection: "cooldown",
      deferUntil: null,
    });
    ports.clock.advance(MINUTE);
    expect(await tickCounted(s)).toEqual({ status: "acted", submits: 1 });
    expect(attempts(ports)).toEqual([2]);
    expect(rates.guardrailReads).toBe(1);
    expect(sim.value(HOME_NATIVE)).toBe(2940n * E18);
  });

  it("re-reads the guardrails after a max-change rejection and submits a step inside the new limit", async () => {
    const s = setup("homeNative", 1000n * E18, 1500n * E18);
    const { ports, rates, sim } = s;
    // The governor lowered keeperMaxChangeBps to 200 after the loop read 500.
    rates.guardrailValues = { maxChangeBps: 200n, cooldownSeconds: 3600n };
    rates.staleGuardrails.push({ maxChangeBps: 500n, cooldownSeconds: 3600n });
    expect(await tickCounted(s)).toEqual({ status: "deferred", submits: 1 });
    const [op] = await rateOps(ports, "usdc-home");
    expect(op).toMatchObject({
      status: "open",
      step: "deferred",
      stepPayload: { lastRejection: "max-change", deferUntil: null },
    });
    ports.clock.advance(MINUTE);
    expect(await tickCounted(s)).toEqual({ status: "acted", submits: 1 });
    expect(s.submitted()).toEqual([1050n * E18, 1020n * E18]);
    expect(sim.value(HOME_NATIVE)).toBe(1020n * E18);
    expect(20n * E18 * BPS).toBeLessThanOrEqual(1000n * E18 * 200n); // inside the new limit
    expect(rates.guardrailReads).toBe(2);
    expect(ports.notifier.sent.map((n) => n.dedupKey)).toEqual(["rate:usdc-home:homeNative:max-change"]);
  });

  it("re-reads the value after a max-change rejection caused by a governor write between read and submit", async () => {
    const s = setup("homeNative", 1000n * E18, 1500n * E18);
    const { rates, sim } = s;
    // The loop reads 1000; the governor wrote 980 before the update, so 1050 is a 7 % move.
    sim.setByGovernor(HOME_NATIVE, 980n * E18, 18);
    rates.staleValues.push({ value: 1000n * E18, decimals: 18, lastKeeperUpdate: new Date(T0.getTime() - 24 * HOUR) });
    expect(await tickCounted(s)).toEqual({ status: "deferred", submits: 1 });
    s.ports.clock.advance(MINUTE);
    expect(await tickCounted(s)).toEqual({ status: "acted", submits: 1 });
    expect(s.submitted()).toEqual([1050n * E18, 1029n * E18]);
    expect(sim.value(HOME_NATIVE)).toBe(1029n * E18);
  });

  it("retries a max-change rejection the reads cannot explain once per tick, and goes critical once", async () => {
    const s = setup("homeNative", 2800n * E18, 3000n * E18, { rejectionsBeforeCritical: 3 });
    s.sim.queue.push("max-change", "max-change", "max-change", "max-change");
    for (let i = 0; i < 4; i++) {
      expect(await tickCounted(s)).toEqual({ status: "deferred", submits: 1 });
      s.ports.clock.advance(MINUTE);
    }
    expect(s.submitted()).toEqual(Array.from({ length: 4 }, () => 2940n * E18));
    expect(s.ports.notifier.sent.map((n) => [n.severity, n.dedupKey])).toEqual([
      ["warning", "rate:usdc-home:homeNative:max-change"],
      ["critical", REJECTED],
    ]);
    expect(await tickCounted(s)).toEqual({ status: "acted", submits: 1 });
  });

  it("raises exactly one critical for consecutive mixed rejections; a landed submit resets the count", async () => {
    const s = setup("homeNative", 2800n * E18, 3000n * E18, {
      rejectionsBeforeCritical: 3,
      rejectionRetrySeconds: 600,
    });
    const { ports, sim } = s;
    const critical = () => ports.notifier.bySeverity("critical").map((n) => n.dedupKey);
    sim.queue.push("cooldown", "max-change", "decimals", "cooldown");
    expect(await tickCounted(s)).toEqual({ status: "deferred", submits: 1 });
    ports.clock.advance(MINUTE);
    expect(await tickCounted(s)).toEqual({ status: "deferred", submits: 1 });
    expect(critical()).toEqual([]);
    ports.clock.advance(MINUTE);
    expect(await tickCounted(s)).toEqual({ status: "deferred", submits: 1 }); // decimals: the third in a row
    expect(critical()).toEqual([REJECTED]);
    ports.clock.advance(600_000);
    expect(await tickCounted(s)).toEqual({ status: "deferred", submits: 1 }); // a fourth: no second critical
    expect(critical()).toEqual([REJECTED]);
    // Below the threshold cooldown and max-change warn once each; at and above it only the critical is raised.
    expect(ports.notifier.bySeverity("warning").map((n) => n.dedupKey)).toEqual([
      "rate:usdc-home:homeNative:cooldown",
      "rate:usdc-home:homeNative:max-change",
      "rate:usdc-home:homeNative:decimals",
    ]);
    expect(await streakOf(ports, s.loop.id)).toMatchObject({ count: 4, criticalNotified: true });

    ports.clock.advance(MINUTE);
    expect(await tickCounted(s)).toEqual({ status: "acted", submits: 1 }); // 2940 lands
    expect(await streakOf(ports, s.loop.id)).toEqual({ count: 0, criticalNotified: false, warned: [] });

    // A new streak on the next step: two rejections stay under the threshold, the third raises a new critical.
    sim.queue.push("max-change", "unknown", "cooldown");
    ports.clock.advance(HOUR);
    expect(await tickCounted(s)).toEqual({ status: "deferred", submits: 1 });
    ports.clock.advance(MINUTE);
    expect(await tickCounted(s)).toEqual({ status: "deferred", submits: 1 });
    expect(critical()).toEqual([REJECTED]);
    ports.clock.advance(600_000);
    expect(await tickCounted(s)).toEqual({ status: "deferred", submits: 1 });
    expect(critical()).toEqual([REJECTED, REJECTED]);
  });

  it("carries the streak across an operation closed because the market came back, until a submit lands", async () => {
    const s = setup("homeNative", 2800n * E18, 3000n * E18, { rejectionsBeforeCritical: 3 });
    const { ports, sim, oracle } = s;
    sim.queue.push("cooldown", "max-change", "cooldown");
    for (let i = 0; i < 2; i++) {
      expect(await tickCounted(s)).toEqual({ status: "deferred", submits: 1 });
      ports.clock.advance(MINUTE);
    }
    oracle.set("ETH", 2805n * E18); // under settleBps: the operation closes, nothing landed
    expect((await s.tick()).status).toBe("idle");
    expect(await rateOps(ports, "usdc-home")).toMatchObject([{ status: "completed", step: "superseded" }]);
    oracle.set("ETH", 3000n * E18);
    ports.clock.advance(MINUTE);
    expect(await tickCounted(s)).toEqual({ status: "deferred", submits: 1 }); // a new operation, third in a row
    expect(ports.notifier.bySeverity("critical").map((n) => n.dedupKey)).toEqual([REJECTED]);
  });

  it.each([
    ["cooldown", MINUTE],
    ["max-change", MINUTE],
    ["decimals", 600_000],
  ] as const)("retries an abort after a %s rejection on the next tick", async (rejection, wait) => {
    const s = setup("homeNative", 2800n * E18, 3000n * E18, { rejectionRetrySeconds: 600 });
    const { ports, sim } = s;
    sim.queue.push(rejection, "aborted");
    expect(await tickCounted(s)).toEqual({ status: "deferred", submits: 1 });
    ports.clock.advance(wait);
    expect(await tickCounted(s)).toEqual({ status: "deferred", submits: 1 }); // aborted before signing
    const [op] = await rateOps(ports, "usdc-home");
    expect(op!.stepPayload).toMatchObject({ deferUntil: null });
    expect(await streakOf(ports, s.loop.id)).toMatchObject({ count: 1 }); // an abort is not a rejection
    ports.clock.advance(MINUTE);
    expect(await tickCounted(s)).toEqual({ status: "acted", submits: 1 });
    expect(attempts(ports)).toEqual([1, 2, 3]);
    expect(s.sim.value(HOME_NATIVE)).toBe(2940n * E18);
  });

  it("retries aborted failures next tick without a rejection or notification", async () => {
    const { ports, sim, tick, loop } = setup("homeNative", 2800n * E18, 3000n * E18);
    sim.queue.push("aborted", "aborted");
    for (let i = 0; i < 2; i++) {
      expect((await tick()).status).toBe("deferred");
      const [op] = await rateOps(ports, "usdc-home");
      expect(op!.stepPayload).toMatchObject({ deferUntil: null, lastRejection: null });
    }
    expect((await tick()).status).toBe("acted");
    expect(ports.notifier.sent).toHaveLength(0);
    expect(await streakOf(ports, loop.id)).toBeUndefined();
  });
});

describe("two targets on one pair", () => {
  it("each loop submits only its own target and survives the other's attention operation", async () => {
    const ports = makeFakePorts(exampleConfig({ rates: { pairs: {} } as never }));
    ports.clock.current = T0;
    const pair = ports.config.topology.pairs.find((p) => p.id === "eth-home")!;
    const rates = new CountingRates(pair.id, pair.foreignChainId, pair.foreignGateway);
    const sim = new ContractSim(ports, rates);
    sim.set(HOME_NATIVE, 2800n * E18, 18, new Date(T0.getTime() - 24 * HOUR));
    sim.set(USDC_TARGET, 400_000_000n, 0, new Date(T0.getTime() - 24 * HOUR));
    const oracle = new FakePriceOracle().set("ETH", 3000n * E18).set("USDC", E18);
    const make = (target: GatewayRateTarget) =>
      new RateLoop(ports, { pair, rates, target, priceOracle: oracle, config: ports.config.rates });
    const home = make(HOME_NATIVE);
    const token = make(USDC_TARGET);
    const tick = (loop: RateLoop) => loop.tick({ now: ports.clock.now(), signal: new AbortController().signal });

    // the token loop's step is left in attention
    sim.script(() => rates.updates.at(-1)?.target.kind === "token", {
      status: "replaced",
      hash: fakeHash("a"),
      replacedByHash: null,
    });
    await tick(token);
    expect(await tick(token)).toMatchObject({ status: "suspended" });
    expect(await tick(home)).toMatchObject({ status: "acted" });
    expect(rates.updates.map((u) => u.target.kind)).toEqual(["token", "homeNative"]);
    expect(rates.updates[1]!.value).toBe(2940n * E18);
    // each target has its own operation payload and observation keys
    const ops = await rateOps(ports, "eth-home");
    expect(ops.map((o) => (o.payload as { target: string }).target).sort()).toEqual(["USDC", "homeNative"]);
    expect(await ports.journal.observations("rate:eth-home:homeNative")).toHaveLength(1);
    expect(home.id).toBe("rate:eth-home:homeNative");
    expect(token.id).toBe("rate:eth-home:USDC");
  });
});

function rateChangeOf(from: bigint, to: bigint): number {
  return Number(((to > from ? to - from : from - to) * BPS) / from);
}
