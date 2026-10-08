import { parseUnits } from "viem";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { foreignGatewayClaimKey, type Asset } from "../domain";
import { exampleConfig, exampleTopology, EXAMPLE_CHAINS, makeFakePorts, makeQuote } from "../testing";
import { reporterConfigSchema, routeThresholds } from "./config";
import { needSizedInputs, planFunding, type FundingPlan, type LegPlan } from "./planner";
import { ASSETS, COST, harness, reporterSection, ROUTES, usdcToEth } from "./testkit";

type Fund = Extract<FundingPlan, { kind: "fund" }>;

function expectFund(plan: FundingPlan): Fund {
  expect(plan.kind).toBe("fund");
  return plan as Fund;
}

function claimKey(pairId: string, asset: Asset): string {
  return foreignGatewayClaimKey(pairId, "bridging", `${asset.chainId}:${asset.address.toLowerCase()}`);
}

const usdc = (n: string) => parseUnits(n, 18);

describe("reporter thresholds", () => {
  it("derive low-water and target from the cost per message and the message counts", () => {
    const config = reporterConfigSchema.parse({
      lowWaterMessages: 10,
      targetMessages: 40,
      minTopUpMessages: 2,
      routes: { a: { costPerMessage: "0.001" }, b: { costPerMessage: "0.5", lowWaterMessages: 5, targetMessages: 8 } },
    });
    const route = (id: string) => ({
      id,
      pairId: "p",
      chainId: 1,
      reporter: "0x0000000000000000000000000000000000000001" as const,
      fundingMethod: "nativeTransfer" as const,
    });
    expect(routeThresholds(config, route("a"), { nativeDecimals: 18 })).toEqual({
      costPerMessage: 10n ** 15n,
      lowWaterMessages: 10,
      targetMessages: 40,
      lowWater: 10n ** 16n,
      target: 4n * 10n ** 16n,
      minTopUp: 2n * 10n ** 15n,
    });
    const b = routeThresholds(config, route("b"), { nativeDecimals: 6 })!;
    expect([b.costPerMessage, b.lowWater, b.target]).toEqual([500_000n, 2_500_000n, 4_000_000n]);
    expect(routeThresholds(config, route("unconfigured"), { nativeDecimals: 18 })).toBeUndefined();
  });

  it("parses the documented example section", () => {
    const example = JSON.parse(readFileSync(new URL("./example-config.json", import.meta.url), "utf8"));
    const parsed = reporterConfigSchema.parse(example.reporter);
    expect(Object.keys(parsed.routes).sort()).toEqual([
      "arbitrum->arc",
      "arbitrum->base",
      "arc->arbitrum",
      "base->arbitrum",
    ]);
    expect(parsed.routes["arbitrum->base"]!.targetMessages).toBe(150);
  });

  it("parses an empty section with defaults and rejects a target under the low-water", () => {
    expect(reporterConfigSchema.parse(undefined)).toEqual({
      lowWaterMessages: 20,
      targetMessages: 100,
      minTopUpMessages: 5,
      maxAmbiguousDeferrals: 5,
      ambiguousDeferralMaxAgeMinutes: 60,
      routes: {},
    });
    expect(exampleConfig({ reporter: {} }).reporter.targetMessages).toBe(100);
    expect(() => reporterConfigSchema.parse({ routes: { a: { costPerMessage: "1", targetMessages: 3 } } })).toThrow(
      /targetMessages must exceed/
    );
    expect(() => reporterConfigSchema.parse({ routes: { a: { costPerMessage: "0x10" } } })).toThrow();
  });
});

describe("planFunding", () => {
  it("splits a USDC pool between a USDC and an ETH route by message shortfalls, ETH claim quoted", async () => {
    // The ETH route: low-water 50, target 100 messages, at 40 messages (shortfall 60); the USDC route empty (100).
    const h = harness(
      reporterSection({
        routes: {
          [ROUTES.usdcForeign]: { costPerMessage: "0.5" },
          [ROUTES.usdcHome]: { costPerMessage: "0.0002", lowWaterMessages: 50 },
        },
      })
    );
    h.funding.balances.set(ROUTES.usdcHome, 40n * COST.eth);
    h.treasuries.get("usdc-home")!.setBalance(ASSETS.usdcNative, usdc("1000"), usdc("40"));

    const usdcPlan = expectFund(await planFunding(h.plannerDeps("usdc-home"), h.route(ROUTES.usdcForeign)));
    const ethPlan = expectFund(await planFunding(h.plannerDeps("usdc-home"), h.route(ROUTES.usdcHome)));
    // 40 USDC shared 100:60.
    expect(usdcPlan.legs).toEqual([
      expect.objectContaining({ claimAmount: usdc("25"), transfer: false, quote: null, expectedOutput: usdc("25") }),
    ]);
    expect(usdcPlan.partial).toBe(true);
    const ethLeg = ethPlan.legs[0]!;
    expect(ethLeg.claimAmount).toBe(usdc("15"));
    expect(ethLeg.transfer).toBe(true);
    expect(ethLeg.quote).toEqual(
      expect.objectContaining({ inputAmount: usdc("15"), estimatedOutput: usdcToEth(usdc("15"), 18) })
    );
    expect(ethPlan.expectedTotal).toBe(usdcToEth(usdc("15"), 18));
    expect(h.routeProvider.requests).toEqual([
      expect.objectContaining({
        fromChainId: EXAMPLE_CHAINS.foreignUsdc,
        toChainId: EXAMPLE_CHAINS.home,
        amount: usdc("15"),
        purpose: "reporter",
      }),
    ]);
    expect(usdcPlan.legs[0]!.claimKey).toBe(claimKey("usdc-home", ASSETS.usdcNative));
  });

  it("never overfunds a route past its target when the pool is plentiful", async () => {
    const h = harness(
      reporterSection({
        routes: {
          [ROUTES.usdcForeign]: { costPerMessage: "0.5" },
          [ROUTES.usdcHome]: { costPerMessage: "0.0002", lowWaterMessages: 50 },
        },
      })
    );
    h.funding.balances.set(ROUTES.usdcHome, 40n * COST.eth);
    h.treasuries.get("usdc-home")!.setBalance(ASSETS.usdcNative, 0n, usdc("1000"));
    const usdcPlan = expectFund(await planFunding(h.plannerDeps("usdc-home"), h.route(ROUTES.usdcForeign)));
    const ethPlan = expectFund(await planFunding(h.plannerDeps("usdc-home"), h.route(ROUTES.usdcHome)));
    expect(usdcPlan.legs[0]!.claimAmount).toBe(usdc("50")); // exactly 100 messages of 0.5 USDC
    expect(usdcPlan.partial).toBe(false);
    // The ETH route needs 60 * 0.0002 = 0.012 ETH = 30 USDC at the quoted rate; its share is 375 USDC. The share
    // only probes the rate; the persisted quote is sized to the need.
    expect(ethPlan.need).toBe(60n * COST.eth);
    expect(h.routeProvider.requests.map((r) => r.amount)).toEqual([usdc("375"), usdc("30")]);
    expect(ethPlan.legs[0]!.quote!.inputAmount).toBe(usdc("30"));
    expect(ethPlan.legs[0]!.claimAmount).toBe(usdc("30"));
    expect(ethPlan.expectedTotal).toBeLessThanOrEqual(ethPlan.need);
    expect(ethPlan.partial).toBe(false);
  });

  it("sizes a small cross-asset top-up's quote to the need, so a share over the limit does not block it", async () => {
    const h = harness();
    // Base ETH reporter 10 messages short of its target, a large Base USDC pool, no ETH: the share (all of it, the
    // home route being full) is over the per-transfer limit, the need is not.
    h.funding.balances.set(ROUTES.ethForeign, 19n * COST.eth); // 81 messages short = 0.0162 ETH = 40.5 USDC
    h.funding.balances.set(ROUTES.ethHome, 100n * COST.eth);
    h.treasuries.get("eth-home")!.setBalance(ASSETS.baseUsdc, 0n, parseUnits("50000", 6));
    const limit = parseUnits("1000", 6);
    h.routeProvider.quotes.unshift({
      match: (request) => request.amount > limit,
      result: (request) => ({
        kind: "rejected",
        violations: [`limit: ${request.amount} over the per-transfer limit ${limit}`],
        quote: makeQuote(request, { estimatedOutput: usdcToEth(request.amount, 6) }),
      }),
    });
    const plan = expectFund(await planFunding(h.plannerDeps("eth-home"), h.route(ROUTES.ethForeign)));
    const need = 81n * COST.eth;
    expect(plan.need).toBe(need);
    expect(h.routeProvider.requests.map((r) => r.amount)).toEqual([parseUnits("50000", 6), parseUnits("40.5", 6)]);
    expect(plan.legs).toEqual([
      expect.objectContaining({
        asset: ASSETS.baseUsdc,
        claimAmount: parseUnits("40.5", 6),
        transfer: true,
        quote: expect.objectContaining({ inputAmount: parseUnits("40.5", 6), estimatedOutput: need }),
        expectedOutput: need,
      }),
    ]);
    expect(plan.partial).toBe(false);

    // Over the limit even at the need: nothing is quoted past the policy, the route defers.
    const tight = harness();
    tight.funding.balances.set(ROUTES.ethForeign, 0n);
    tight.funding.balances.set(ROUTES.ethHome, 100n * COST.eth);
    tight.treasuries.get("eth-home")!.setBalance(ASSETS.baseUsdc, 0n, parseUnits("50000", 6));
    tight.routeProvider.quotes.unshift({
      match: (request) => request.amount > parseUnits("10", 6),
      result: (request) => ({ kind: "rejected", violations: ["limit"], quote: makeQuote(request) }),
    });
    expect(await planFunding(tight.plannerDeps("eth-home"), tight.route(ROUTES.ethForeign))).toEqual(
      expect.objectContaining({ kind: "deferred", short: true })
    );
  });

  it("re-probes at a tenth, a hundredth and a thousandth when the share-sized probe has no route", async () => {
    const h = harness();
    // Base ETH reporter short, a 50,000 USDC pool: LI.FI has no route above 1,000 USDC (liquidity), so the
    // share-sized probe carries no rate. The smaller probes find one and the need-sized quote follows.
    h.funding.balances.set(ROUTES.ethForeign, 19n * COST.eth); // 81 messages short = 0.0162 ETH = 40.5 USDC
    h.funding.balances.set(ROUTES.ethHome, 100n * COST.eth);
    h.treasuries.get("eth-home")!.setBalance(ASSETS.baseUsdc, 0n, parseUnits("50000", 6));
    h.routeProvider.quotes.unshift({
      match: (request) => request.amount > parseUnits("1000", 6),
      result: { kind: "no-route", reason: "no liquidity" },
    });
    const plan = expectFund(await planFunding(h.plannerDeps("eth-home"), h.route(ROUTES.ethForeign)));
    const need = 81n * COST.eth;
    expect(h.routeProvider.requests.map((r) => r.amount)).toEqual([
      parseUnits("50000", 6),
      parseUnits("5000", 6),
      parseUnits("500", 6),
      parseUnits("40.5", 6),
    ]);
    expect(plan.legs).toEqual([
      expect.objectContaining({
        asset: ASSETS.baseUsdc,
        claimAmount: parseUnits("40.5", 6),
        transfer: true,
        quote: expect.objectContaining({ inputAmount: parseUnits("40.5", 6), estimatedOutput: need }),
      }),
    ]);

    // No route at any probe: the asset is skipped after the bounded probes, the route defers.
    const dry = harness();
    dry.funding.balances.set(ROUTES.ethForeign, 0n);
    dry.funding.balances.set(ROUTES.ethHome, 100n * COST.eth);
    dry.treasuries.get("eth-home")!.setBalance(ASSETS.baseUsdc, 0n, parseUnits("50000", 6));
    dry.routeProvider.quotes.unshift({ match: () => true, result: { kind: "no-route", reason: "no liquidity" } });
    expect(await planFunding(dry.plannerDeps("eth-home"), dry.route(ROUTES.ethForeign))).toEqual(
      expect.objectContaining({ kind: "deferred", short: true })
    );
    expect(dry.routeProvider.requests.map((r) => r.amount)).toEqual([
      parseUnits("50000", 6),
      parseUnits("5000", 6),
      parseUnits("500", 6),
      parseUnits("50", 6),
    ]);
  });

  it("counts a sibling's in-flight withdrawal once: three equal routes, one with an open operation", async () => {
    const third = {
      id: "eth-home->third",
      pairId: "eth-home",
      chainId: EXAMPLE_CHAINS.foreignEth,
      reporter: "0x00000000000000000000000000000000000000d5" as const,
      fundingMethod: "nativeTransfer" as const,
    };
    const topology = exampleTopology();
    topology.routes = [...topology.routes!, third];
    const reporter = reporterSection({
      routes: {
        [ROUTES.ethForeign]: { costPerMessage: "0.0002" },
        [ROUTES.ethHome]: { costPerMessage: "0.0002" },
        [third.id]: { costPerMessage: "0.0002" },
      },
    });
    const h = harness(reporter, makeFakePorts(exampleConfig({ topology, reporter })));
    for (const id of [ROUTES.ethForeign, ROUTES.ethHome, third.id]) h.funding.balances.set(id, 0n);
    // 0.03 ETH and 30 USDC (0.012 ETH) for three routes that each need 0.02 ETH.
    const eth = 3n * 10n ** 16n;
    const treasury = h.treasuries.get("eth-home")!;
    treasury.setBalance(ASSETS.ethNative, 0n, eth);
    treasury.setBalance(ASSETS.baseUsdc, 0n, parseUnits("30", 6));
    // The first route withdraws its ETH third into its holding, and its USDC conversion stays in flight.
    h.transfers.onRun(
      () => true,
      (intent) => ({ status: "in-progress", operationId: `t-${intent.parentOperationId}`, step: "send" })
    );
    await h.loop(ROUTES.ethForeign).tick(h.tickCtx());
    const [op] = await h.ports.journal.listOperations({ routeId: ROUTES.ethForeign, status: "open" });
    const legs = (op!.payload as unknown as { legs: LegPlan[] }).legs;
    expect(legs.map((l) => l.claimAmount)).toEqual([eth / 3n, parseUnits("10", 6)]);
    const firstHolding = await h.ports.journal.ledger.holdings({
      scope: { kind: "bridging", routeId: ROUTES.ethForeign },
      chainId: EXAMPLE_CHAINS.foreignEth,
      asset: "native",
      location: "eoa",
    });
    expect(firstHolding.reduce((acc, row) => acc + row.amount, 0n)).toBe(eth / 3n);
    treasury.setBalance(ASSETS.ethNative, 0n, eth - eth / 3n);
    treasury.setBalance(ASSETS.baseUsdc, 0n, parseUnits("20", 6));

    // Each of the two others still gets exactly a third of each asset's pool.
    for (const id of [ROUTES.ethHome, third.id]) {
      const plan = expectFund(await planFunding(h.plannerDeps("eth-home"), h.route(id)));
      expect(plan.shareE18).toBe(10n ** 18n / 3n);
      expect(plan.legs.map((l) => l.claimAmount)).toEqual([eth / 3n, parseUnits("10", 6)]);
    }
  });

  it("follow-up 008: a sibling whose balance read fails never shrinks the shortfall weights", async () => {
    const h = harness();
    const treasury = h.treasuries.get("eth-home")!;
    treasury.setBalance(ASSETS.ethNative, 0n, 10n ** 16n);
    treasury.setBalance(ASSETS.baseUsdc, 0n, 0n);
    h.funding.balances.set(ROUTES.ethForeign, 0n);
    h.funding.balances.set(ROUTES.ethHome, 0n);
    const plan = async () => expectFund(await planFunding(h.plannerDeps("eth-home"), h.route(ROUTES.ethForeign)));
    const empty = await plan();
    expect(empty.partial).toBe(true);

    // The sibling's read fails: it weighs as an empty reporter (its largest shortfall), never as absent.
    const balance = h.funding.balance.bind(h.funding);
    h.funding.balance = async (route) => {
      if (route.id === ROUTES.ethHome) throw new Error("HTTP request failed.");
      return balance(route);
    };
    const unreadable = await plan();
    expect(unreadable.shareE18).toBe(empty.shareE18);
    expect(unreadable.legs.map((l) => l.claimAmount)).toEqual(empty.legs.map((l) => l.claimAmount));

    // Had it been skipped, the planning route would take the whole pool: the share a full sibling leaves it.
    h.funding.balance = balance;
    h.funding.balances.set(ROUTES.ethHome, 100n * COST.eth);
    expect((await plan()).shareE18).toBeGreaterThan(unreadable.shareE18);
  });

  it("triggers for a low reporter while its pair's HomeGateway is above its refill threshold", async () => {
    const h = harness();
    h.homeGateways.get("eth-home")!.available = parseUnits("1000", 18);
    h.treasuries.get("eth-home")!.setBalance(ASSETS.ethNative, parseUnits("5", 18), parseUnits("1", 18));
    h.funding.balances.set(ROUTES.ethForeign, 10n * COST.eth);
    const plan = expectFund(await planFunding(h.plannerDeps("eth-home"), h.route(ROUTES.ethForeign)));
    expect(plan.need).toBe(90n * COST.eth);
    expect(plan.legs).toEqual([expect.objectContaining({ claimAmount: 90n * COST.eth, transfer: false })]);
    // Above its low-water the route is idle whatever the HomeGateway holds.
    h.funding.balances.set(ROUTES.ethForeign, 20n * COST.eth);
    h.homeGateways.get("eth-home")!.available = 0n;
    expect((await planFunding(h.plannerDeps("eth-home"), h.route(ROUTES.ethForeign))).kind).toBe("idle");
  });

  it("shares short funds proportionally; the second route gets its share after the first claimed", async () => {
    const h = harness();
    // Both empty: the foreign route needs 100 messages; the home route has 0 messages and a cost twice as high.
    const ports = h.ports;
    h.treasuries.get("eth-home")!.setBalance(ASSETS.ethNative, 0n, 3n * 10n ** 16n);
    h.funding.balances.set(ROUTES.ethForeign, 0n);
    h.funding.balances.set(ROUTES.ethHome, 50n * COST.eth); // above low-water 20: shortfall 50 messages, not eligible
    const alone = expectFund(await planFunding(h.plannerDeps("eth-home"), h.route(ROUTES.ethForeign)));
    expect(alone.legs[0]!.claimAmount).toBe(2n * 10n ** 16n); // its whole need, the other route is not low

    h.funding.balances.set(ROUTES.ethHome, 10n * COST.eth); // shortfall 90 messages
    const first = expectFund(await planFunding(h.plannerDeps("eth-home"), h.route(ROUTES.ethForeign)));
    // 0.03 ETH split 100:90.
    const firstShare = (3n * 10n ** 16n * 100n) / 190n;
    expect(first.legs[0]!.claimAmount).toBe(firstShare);
    expect(first.partial).toBe(true);
    // The first route's operation claims its share.
    const op = await ports.journal.createOperation({
      kind: "reporter-funding",
      description: "first",
      scopes: [{ kind: "bridging", routeId: ROUTES.ethForeign }],
      routeId: ROUTES.ethForeign,
      pairId: "eth-home",
      payload: null,
    });
    await ports.journal.ledger.claim({
      key: first.legs[0]!.claimKey,
      amount: firstShare,
      operationId: op.id,
      onchainAvailable: 3n * 10n ** 16n,
    });
    const second = expectFund(await planFunding(h.plannerDeps("eth-home"), h.route(ROUTES.ethHome)));
    const secondShare = (3n * 10n ** 16n * 90n) / 190n;
    expect(second.legs[0]!.claimAmount).toBe(secondShare);
    expect(second.legs[0]!.transfer).toBe(true);
    expect(firstShare + second.legs[0]!.claimAmount).toBeLessThanOrEqual(3n * 10n ** 16n);
  });

  it("notifies when short funds are shared", async () => {
    const h = harness();
    h.treasuries.get("eth-home")!.setBalance(ASSETS.ethNative, 0n, 3n * 10n ** 16n);
    h.funding.balances.set(ROUTES.ethForeign, 0n);
    h.funding.balances.set(ROUTES.ethHome, 10n * COST.eth);
    await h.loop(ROUTES.ethForeign).tick(h.tickCtx());
    // The reporter received its top-up and the ForeignGateway paid out the withdrawal.
    h.funding.balances.set(ROUTES.ethForeign, h.funding.funded[0]!.amount);
    h.treasuries.get("eth-home")!.setBalance(ASSETS.ethNative, 0n, 3n * 10n ** 16n - h.funding.funded[0]!.amount);
    await h.loop(ROUTES.ethHome).tick(h.tickCtx());
    const partial = h.ports.notifier.sent.filter((n) => n.dedupKey.endsWith(":partial"));
    expect(partial.map((n) => n.routeId)).toEqual([ROUTES.ethForeign, ROUTES.ethHome]);
    expect(partial.every((n) => n.severity === "warning")).toBe(true);
    const funded = h.funding.funded;
    expect(funded.map((f) => f.routeId)).toEqual([ROUTES.ethForeign, ROUTES.ethHome]);
    expect(funded[0]!.amount).toBe((3n * 10n ** 16n * 100n) / 190n);
    expect(funded[1]!.amount).toBe(3n * 10n ** 16n - funded[0]!.amount); // 90/190 of the pool, rounding dust included
  });

  it("keeps the second route's share while the first route's withdrawal and funding are in flight", async () => {
    const h = harness();
    const pool = 3n * 10n ** 16n;
    const treasury = h.treasuries.get("eth-home")!;
    treasury.setBalance(ASSETS.ethNative, 0n, pool);
    h.funding.balances.set(ROUTES.ethForeign, 0n);
    h.funding.balances.set(ROUTES.ethHome, 10n * COST.eth);
    const firstShare = (pool * 100n) / 190n;
    const secondShare = (pool * 90n) / 190n;
    // The first route's withdrawal is pending: its claim is open and the on-chain balance unchanged.
    h.ports.executor.script((_, o) => o.idempotencyKey.endsWith(":step:withdraw:0"), {
      status: "pending",
      hash: "0x01",
    });
    await h.loop(ROUTES.ethForeign).tick(h.tickCtx());
    const pending = expectFund(await planFunding(h.plannerDeps("eth-home"), h.route(ROUTES.ethHome)));
    expect(pending.legs[0]!.claimAmount).toBe(secondShare);
    // The withdrawal confirms (the balance drops, the claim settles) and the funding is pending.
    const [op] = await h.ports.journal.listOperations({ routeId: ROUTES.ethForeign });
    h.ports.executor.settle(`op:${op!.id}:step:withdraw:0`, {
      status: "confirmed",
      hash: "0x01",
      blockNumber: 1n,
      gasUsed: 1n,
    });
    h.ports.executor.script((_, o) => o.idempotencyKey.endsWith(":step:fund"), { status: "pending", hash: "0x02" });
    treasury.setBalance(ASSETS.ethNative, 0n, pool - firstShare);
    await h.loop(ROUTES.ethForeign).tick(h.tickCtx());
    expect((await h.ports.journal.getOperation(op!.id))!.step).toBe("funding");
    const inFlight = expectFund(await planFunding(h.plannerDeps("eth-home"), h.route(ROUTES.ethHome)));
    expect(inFlight.legs[0]!.claimAmount).toBe(secondShare);
  });

  it("never funds a route from another pair's bridging funds", async () => {
    const h = harness();
    h.treasuries.get("eth-home")!.setBalance(ASSETS.ethNative, 0n, parseUnits("10", 18));
    h.treasuries.get("usdc-home")!.setBalance(ASSETS.usdcNative, usdc("1000"), 0n);
    h.funding.balances.set(ROUTES.usdcHome, 0n);
    const plan = await planFunding(h.plannerDeps("usdc-home"), h.route(ROUTES.usdcHome));
    expect(plan).toEqual(expect.objectContaining({ kind: "deferred", short: true }));
    expect(h.routeProvider.requests).toEqual([]);

    // The loop defers and leaves the other pair's claims untouched.
    const result = await h.loop(ROUTES.usdcHome).tick(h.tickCtx());
    expect(result.status).toBe("deferred");
    expect(await h.ports.journal.ledger.openClaims(claimKey("eth-home", ASSETS.ethNative))).toEqual([]);
    expect(h.treasuries.get("eth-home")!.withdrawals).toEqual([]);
    expect(h.ports.notifier.sent.map((n) => n.dedupKey)).toContain(`reporter:${ROUTES.usdcHome}:short`);

    // Every leg a plan ever builds names its own pair's claim key.
    h.funding.balances.set(ROUTES.ethHome, 0n);
    const eth = expectFund(await planFunding(h.plannerDeps("eth-home"), h.route(ROUTES.ethHome)));
    expect(eth.legs.map((l: LegPlan) => l.claimKey)).toEqual([claimKey("eth-home", ASSETS.ethNative)]);
  });

  it("defers a top-up under the economic minimum", async () => {
    const h = harness();
    h.funding.balances.set(ROUTES.ethForeign, 0n);
    h.funding.balances.set(ROUTES.ethHome, 100n * COST.eth); // the other route of the pair is full
    h.treasuries.get("eth-home")!.setBalance(ASSETS.ethNative, 0n, 4n * COST.eth); // minimum is 5 messages
    const plan = await planFunding(h.plannerDeps("eth-home"), h.route(ROUTES.ethForeign));
    expect(plan).toEqual(expect.objectContaining({ kind: "deferred", short: true }));
    expect((plan as { reason: string }).reason).toMatch(/economic minimum/);
    const result = await h.loop(ROUTES.ethForeign).tick(h.tickCtx());
    expect(result.status).toBe("deferred");
    expect(h.ports.journal.operations.size).toBe(0);
    expect(h.ports.executor.submissions).toEqual([]);

    h.treasuries.get("eth-home")!.setBalance(ASSETS.ethNative, 0n, 5n * COST.eth);
    expect((await planFunding(h.plannerDeps("eth-home"), h.route(ROUTES.ethForeign))).kind).toBe("fund");
  });

  it("suspends only the route whose preflight fails", async () => {
    const h = harness();
    h.treasuries.get("eth-home")!.setBalance(ASSETS.ethNative, 0n, parseUnits("1", 18));
    h.funding.balances.set(ROUTES.ethForeign, 0n);
    h.funding.balances.set(ROUTES.ethHome, 0n);
    h.funding.preflights.set(ROUTES.ethForeign, { ok: false, reasons: [`no code at reporter 0xd3`] });

    const suspended = await h.loop(ROUTES.ethForeign).tick(h.tickCtx());
    const other = await h.loop(ROUTES.ethHome).tick(h.tickCtx());
    expect(suspended.status).toBe("suspended");
    expect(suspended.summary).toMatch(/no code at reporter/);
    expect(other.status).toBe("acted");
    expect(h.funding.funded.map((f) => f.routeId)).toEqual([ROUTES.ethHome]);
    const critical = h.ports.notifier.bySeverity("critical");
    expect(critical.map((n) => n.routeId)).toEqual([ROUTES.ethForeign]);
    const observations = await h.ports.journal.observations("suspended:");
    expect(observations).toEqual([
      expect.objectContaining({
        key: `suspended:reporter:${ROUTES.ethForeign}`,
        value: expect.objectContaining({ suspended: true }),
      }),
    ]);
    // Notified once while the reason holds; cleared by the loop when it no longer does.
    await h.loop(ROUTES.ethForeign).tick(h.tickCtx());
    expect(h.ports.notifier.bySeverity("critical")).toHaveLength(1);
    h.funding.preflights.delete(ROUTES.ethForeign);
    const resumed = await h.loop(ROUTES.ethForeign).tick(h.tickCtx());
    expect(resumed.status).toBe("acted");
    expect((await h.ports.journal.observations(`suspended:reporter:${ROUTES.ethForeign}`))[0]!.value).toEqual(
      expect.objectContaining({ suspended: false })
    );
  });
});

describe("planFunding, follow-up 010", () => {
  const usdc6 = (n: string) => parseUnits(n, 6);

  it("a large leftover holding with a small need: both branches transfer only the need-sized input", async () => {
    const need = 81n * COST.eth; // 0.0162 ETH = 40.5 USDC
    for (const [asset, amount, input, limit] of [
      [ASSETS.ethNative, 1000n * COST.eth, need, 200n * COST.eth],
      [ASSETS.baseUsdc, usdc6("50000"), usdc6("40.5"), usdc6("1000")],
    ] as const) {
      const h = harness();
      h.funding.balances.set(ROUTES.ethHome, 19n * COST.eth);
      h.funding.balances.set(ROUTES.ethForeign, 100n * COST.eth);
      await h.ports.journal.ledger.credit({
        scope: { kind: "bridging", routeId: ROUTES.ethHome },
        chainId: asset.chainId,
        asset: asset.address,
        location: "eoa",
        amount,
        operationId: "earlier",
        reason: "leftover",
      });
      h.routeProvider.quotes.unshift({
        match: (request) => request.amount > limit,
        result: (request) => ({
          kind: "rejected",
          violations: ["limit"],
          quote: makeQuote(request, { estimatedOutput: usdcToEth(request.amount, 6) }),
        }),
      });
      const plan = expectFund(await planFunding(h.plannerDeps("eth-home"), h.route(ROUTES.ethHome)));
      expect(plan.legs).toEqual([
        expect.objectContaining({
          asset,
          claimAmount: 0n,
          holdingAmount: amount,
          transferAmount: input,
          expectedOutput: need,
        }),
      ]);
      expect(plan.expectedTotal).toBe(need);
      expect(plan.partial).toBe(false);
      // The derivation for payloads journaled before run 010 gives the same amount.
      expect(needSizedInputs(plan.need, plan.holdingUsed, plan.legs)).toEqual([input]);
    }
  });

  it("a non-transferring leg carries no transferAmount", async () => {
    const h = harness();
    h.funding.balances.set(ROUTES.ethForeign, 10n * COST.eth);
    h.funding.balances.set(ROUTES.ethHome, 100n * COST.eth);
    h.treasuries.get("eth-home")!.setBalance(ASSETS.ethNative, 0n, parseUnits("1", 18));
    const plan = expectFund(await planFunding(h.plannerDeps("eth-home"), h.route(ROUTES.ethForeign)));
    expect(plan.legs).toHaveLength(1);
    expect(plan.legs[0]!.transfer).toBe(false);
    expect(plan.legs[0]).not.toHaveProperty("transferAmount");
    expect(needSizedInputs(plan.need, plan.holdingUsed, plan.legs)).toEqual([undefined]);
  });
});
