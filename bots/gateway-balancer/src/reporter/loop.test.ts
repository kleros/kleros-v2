import { parseUnits } from "viem";
import { describe, expect, it } from "vitest";
import { NATIVE, foreignGatewayClaimKey, scopeKey, type AccountingScope, type Operation } from "../domain";
import type { Journal, Ledger, ReporterFunding, TransferIntent, TransferOutcome, Transfers } from "../ports";
import { EXAMPLE_CHAINS, FakeRouteProvider, FakeTransfers, makeFakePorts, makeQuote, type FakePorts } from "../testing";
import { FEE_TOKEN_SELECTOR, NativeTransferReporterFunding, PreflightUnavailable } from "./adapter";
import { createReporterLoops } from "./index";
import { ReporterFundingLoop, type FundingPayload, type FundingState } from "./loop";
import { planFunding } from "./planner";
import { ASSETS, COST, harness, ROUTES, usdcToEth, type Harness } from "./testkit";

const bridging = (routeId: string): AccountingScope => ({ kind: "bridging", routeId });
const ethClaimKey = foreignGatewayClaimKey("eth-home", "bridging", `${EXAMPLE_CHAINS.foreignEth}:native`);
const usdcClaimKey = foreignGatewayClaimKey(
  "eth-home",
  "bridging",
  `${EXAMPLE_CHAINS.foreignEth}:${ASSETS.baseUsdc.address.toLowerCase()}`
);

async function holding(journal: Journal, scope: AccountingScope, chainId: number, asset: string = NATIVE) {
  const rows = await journal.ledger.holdings({ scope, chainId, asset: asset as never, location: "eoa" });
  return rows.reduce((acc, h) => acc + h.amount, 0n);
}

async function operations(h: Harness, routeId: string): Promise<Operation[]> {
  return h.ports.journal.listOperations({ kind: "reporter-funding", routeId });
}

function submissions(h: Harness, suffix: string) {
  return h.ports.executor.submissions.filter((s) => s.options.idempotencyKey.includes(suffix));
}

/** USDC (6 decimals) transfers complete at the scripted quote rate; `FakeTransfers` does the ledger moves. */
function convertAtQuoteRate(h: Harness): void {
  h.transfers.onRun(
    (intent) => intent.fromAsset.symbol === "USDC",
    (intent): TransferOutcome => {
      const received = usdcToEth(intent.amount, intent.fromAsset.decimals);
      return {
        status: "completed",
        operationId: `transfer-${intent.parentOperationId}`,
        received,
        receivedByScope: [{ scope: intent.allocations[0]!.scope, amount: received }],
        realizedLossBps: 0,
        txHashes: [],
      };
    }
  );
}

/** Only the other route of the pair is full, so a route's share is its whole need. */
function soloEthPair(h: Harness, routeId: string) {
  const other = routeId === ROUTES.ethForeign ? ROUTES.ethHome : ROUTES.ethForeign;
  h.funding.balances.set(other, 100n * COST.eth);
  h.funding.balances.set(routeId, 0n);
}

describe("reporter funding loop", () => {
  it("foreign-chain route: claims, withdraws and funds, with the holding and the claim settled", async () => {
    const h = harness();
    soloEthPair(h, ROUTES.ethForeign);
    h.treasuries.get("eth-home")!.setBalance(ASSETS.ethNative, parseUnits("3", 18), parseUnits("1", 18));
    const need = 100n * COST.eth;

    const result = await h.loop(ROUTES.ethForeign).tick(h.tickCtx());
    expect(result.status).toBe("acted");
    const [op] = await operations(h, ROUTES.ethForeign);
    expect(op).toEqual(expect.objectContaining({ status: "completed", step: "funded" }));
    expect(op!.scopes).toEqual([bridging(ROUTES.ethForeign)]);
    expect(h.treasuries.get("eth-home")!.withdrawals).toEqual([
      expect.objectContaining({ category: "bridging", amount: need, recipient: h.ports.signer }),
    ]);
    expect(h.ports.executor.submissions.map((s) => s.options.idempotencyKey)).toEqual([
      `op:${op!.id}:step:withdraw:0`,
      `op:${op!.id}:step:fund`,
    ]);
    const fund = submissions(h, ":step:fund")[0]!;
    expect(fund.request).toEqual({
      chainId: EXAMPLE_CHAINS.foreignEth,
      to: op!.payload && h.route(ROUTES.ethForeign).route.reporter,
      value: need,
    });
    expect((op!.stepPayload as unknown as FundingState).fundAmount).toBe(need);
    expect(await holding(h.ports.journal, bridging(ROUTES.ethForeign), EXAMPLE_CHAINS.foreignEth)).toBe(0n);
    expect(await h.ports.journal.ledger.openClaims(ethClaimKey)).toEqual([]);
    const claim = [...h.ports.journal.ledger.claims.values()][0]!;
    expect([claim.state, claim.actualAmount]).toEqual(["settled", need]);
    expect(await h.ports.journal.ledger.spentSince({ since: new Date(0), category: "reporter" })).toBe(need);
    const [observation] = await h.ports.journal.observations(`reporter:${ROUTES.ethForeign}`);
    expect(observation!.value).toEqual(
      expect.objectContaining({ balance: 0n, lowWater: 20n * COST.eth, target: need, suspended: false })
    );

    h.funding.balances.set(ROUTES.ethForeign, need);
    expect((await h.loop(ROUTES.ethForeign).tick(h.tickCtx())).status).toBe("idle");
    expect(h.ports.executor.submissions).toHaveLength(2);
  });

  it("Base USDC: converts through Transfers before funding and never credits after it", async () => {
    const h = harness();
    soloEthPair(h, ROUTES.ethForeign);
    const usdc = (n: string) => parseUnits(n, 6);
    h.treasuries.get("eth-home")!.setBalance(ASSETS.baseUsdc, 0n, usdc("10"));
    convertAtQuoteRate(h);
    await h.loop(ROUTES.ethForeign).tick(h.tickCtx());
    const [op] = await operations(h, ROUTES.ethForeign);
    expect(op!.status).toBe("completed");
    // 10 USDC buys 0.004 ETH = 20 messages, under the 100-message need: the whole pool is claimed.
    const leg = (op!.payload as unknown as FundingPayload).legs[0]!;
    expect(leg.quote).toEqual(
      expect.objectContaining({ inputAmount: usdc("10"), estimatedOutput: usdcToEth(usdc("10"), 6) })
    );
    expect(h.transfers.intents).toEqual([
      expect.objectContaining({
        parentOperationId: op!.id,
        fromChainId: EXAMPLE_CHAINS.foreignEth,
        toChainId: EXAMPLE_CHAINS.foreignEth,
        fromAsset: ASSETS.baseUsdc,
        toAsset: expect.objectContaining({ address: NATIVE, chainId: EXAMPLE_CHAINS.foreignEth }),
        amount: usdc("10"),
        allocations: [{ scope: bridging(ROUTES.ethForeign), amount: usdc("10") }],
        purpose: "reporter",
      }),
    ]);
    expect(submissions(h, ":step:fund")[0]!.request.value).toBe(usdcToEth(usdc("10"), 6));
    // The loop credited only the withdrawn USDC; the native credit is the transfer's own.
    const loopCredits = h.ports.journal.ledger.entries.filter((e) => e.operationId === op!.id && e.amount > 0n);
    expect(loopCredits.map((e) => [e.asset, e.amount])).toEqual([[ASSETS.baseUsdc.address, usdc("10")]]);
    expect(await holding(h.ports.journal, bridging(ROUTES.ethForeign), EXAMPLE_CHAINS.foreignEth)).toBe(0n);
    expect(
      await holding(h.ports.journal, bridging(ROUTES.ethForeign), EXAMPLE_CHAINS.foreignEth, ASSETS.baseUsdc.address)
    ).toBe(0n);
    expect(await h.ports.journal.ledger.openClaims(usdcClaimKey)).toEqual([]);
  });

  it("home-chain route: funds the persisted amount from its holding, never the whole holding", async () => {
    const h = harness();
    soloEthPair(h, ROUTES.ethHome);
    h.funding.balances.set(ROUTES.ethHome, 10n * COST.eth);
    await h.ports.journal.ledger.credit({
      scope: bridging(ROUTES.ethHome),
      chainId: EXAMPLE_CHAINS.home,
      asset: NATIVE,
      location: "eoa",
      amount: 150n * COST.eth,
      operationId: "earlier-transfer",
      reason: "transfer received",
    });
    expect((await h.loop(ROUTES.ethHome).tick(h.tickCtx())).status).toBe("acted");
    const [op] = await operations(h, ROUTES.ethHome);
    expect(op!.status).toBe("completed");
    expect((op!.payload as unknown as FundingPayload).legs).toEqual([]);
    expect(h.treasuries.get("eth-home")!.withdrawals).toEqual([]);
    expect(submissions(h, ":step:fund").map((s) => s.request.value)).toEqual([90n * COST.eth]);
    expect(await holding(h.ports.journal, bridging(ROUTES.ethHome), EXAMPLE_CHAINS.home)).toBe(60n * COST.eth);
  });

  it("home-chain route, short holding: bridges on bridging:<route> and funds what Transfers credited", async () => {
    const h = harness();
    soloEthPair(h, ROUTES.ethHome);
    h.treasuries.get("eth-home")!.setBalance(ASSETS.ethNative, 0n, parseUnits("1", 18));
    h.transfers.onRun(
      () => true,
      (intent) => ({ status: "in-progress", operationId: `t-${intent.parentOperationId}`, step: "send" })
    );
    const need = 100n * COST.eth;

    expect((await h.loop(ROUTES.ethHome).tick(h.tickCtx())).status).toBe("acted");
    const [op] = await operations(h, ROUTES.ethHome);
    expect(op!.status).toBe("open");
    expect(h.transfers.intents).toEqual([
      expect.objectContaining({
        fromChainId: EXAMPLE_CHAINS.foreignEth,
        toChainId: EXAMPLE_CHAINS.home,
        amount: need,
        allocations: [{ scope: bridging(ROUTES.ethHome), amount: need }],
      }),
    ]);
    expect(await holding(h.ports.journal, bridging(ROUTES.ethHome), EXAMPLE_CHAINS.foreignEth)).toBe(need);
    expect((await h.loop(ROUTES.ethHome).tick(h.tickCtx())).status).toBe("deferred");
    expect(submissions(h, ":step:fund")).toEqual([]);

    // The bridge lands with a fee: the test performs the transfer's ledger moves and switches the outcome.
    const received = need - 10n ** 13n;
    const transferId = `t-${op!.id}`;
    await h.ports.journal.ledger.debit({
      scope: bridging(ROUTES.ethHome),
      chainId: EXAMPLE_CHAINS.foreignEth,
      asset: NATIVE,
      location: "eoa",
      amount: need,
      operationId: transferId,
      reason: "transfer sent",
    });
    await h.ports.journal.ledger.credit({
      scope: bridging(ROUTES.ethHome),
      chainId: EXAMPLE_CHAINS.home,
      asset: NATIVE,
      location: "eoa",
      amount: received,
      operationId: transferId,
      reason: "transfer received",
    });
    h.transfers.outcomes.set(`${op!.id}:leg:0`, {
      status: "completed",
      operationId: transferId,
      received,
      receivedByScope: [{ scope: bridging(ROUTES.ethHome), amount: received }],
      realizedLossBps: 1,
      txHashes: [],
    });
    expect((await h.loop(ROUTES.ethHome).tick(h.tickCtx())).status).toBe("acted");
    const done = (await h.ports.journal.getOperation(op!.id))!;
    expect(done.status).toBe("completed");
    expect(submissions(h, ":step:fund").map((s) => s.request)).toEqual([
      { chainId: EXAMPLE_CHAINS.home, to: h.route(ROUTES.ethHome).route.reporter, value: received },
    ]);
    expect((done.stepPayload as unknown as FundingState).legs[0]!.received).toBe(received);
    expect(await holding(h.ports.journal, bridging(ROUTES.ethHome), EXAMPLE_CHAINS.home)).toBe(0n);
    expect(h.transfers.intents).toHaveLength(1);
  });

  it("a replaced funding outcome ends in attention with no second funding", async () => {
    const h = harness();
    soloEthPair(h, ROUTES.ethForeign);
    h.treasuries.get("eth-home")!.setBalance(ASSETS.ethNative, 0n, parseUnits("1", 18));
    h.ports.executor.script((_, o) => o.idempotencyKey.endsWith(":step:fund"), {
      status: "replaced",
      hash: "0x01",
      replacedByHash: "0x02",
    });
    await h.loop(ROUTES.ethForeign).tick(h.tickCtx());
    const [op] = await operations(h, ROUTES.ethForeign);
    expect(op!.status).toBe("attention");
    expect(op!.lastError).toMatch(/replaced/);
    expect(h.ports.notifier.bySeverity("critical")[0]!.operationId).toBe(op!.id);
    for (let i = 0; i < 3; i++) expect((await h.loop(ROUTES.ethForeign).tick(h.tickCtx())).status).toBe("suspended");
    expect(submissions(h, ":step:fund")).toHaveLength(1);
    expect(await operations(h, ROUTES.ethForeign)).toHaveLength(1);
    // Never credited back: the outcome is ambiguous.
    expect(await holding(h.ports.journal, bridging(ROUTES.ethForeign), EXAMPLE_CHAINS.foreignEth)).toBe(0n);
  });

  it("writes the debiting marker before the debit; a resume at it is attention", async () => {
    const h = harness();
    soloEthPair(h, ROUTES.ethForeign);
    h.treasuries.get("eth-home")!.setBalance(ASSETS.ethNative, 0n, parseUnits("1", 18));
    const ledger = h.ports.journal.ledger;
    const seen: Array<{ step: string; fundAmount: bigint | null }> = [];
    const originalDebit = ledger.debit.bind(ledger);
    ledger.debit = async (entry) => {
      const op = (await h.ports.journal.getOperation(entry.operationId))!;
      seen.push({ step: op.step, fundAmount: (op.stepPayload as unknown as FundingState).fundAmount });
      throw new Error("crash during the debit");
    };
    expect((await h.loop(ROUTES.ethForeign).tick(h.tickCtx())).status).toBe("failed");
    expect(seen).toEqual([{ step: "debiting", fundAmount: 100n * COST.eth }]);
    ledger.debit = originalDebit;

    expect((await h.loop(ROUTES.ethForeign).tick(h.tickCtx())).status).toBe("suspended");
    const [op] = await operations(h, ROUTES.ethForeign);
    expect(op!.status).toBe("attention");
    expect(op!.lastError).toMatch(/debiting marker/);
    expect(submissions(h, ":step:fund")).toEqual([]);
  });

  it("a failed funding credits the amount back under the same operation", async () => {
    const h = harness();
    soloEthPair(h, ROUTES.ethForeign);
    h.treasuries.get("eth-home")!.setBalance(ASSETS.ethNative, 0n, parseUnits("1", 18));
    h.ports.executor.script((_, o) => o.idempotencyKey.endsWith(":step:fund"), {
      status: "failed",
      error: "simulation failed revertData=none",
    });
    expect((await h.loop(ROUTES.ethForeign).tick(h.tickCtx())).status).toBe("deferred");
    const [op] = await operations(h, ROUTES.ethForeign);
    expect(op).toEqual(expect.objectContaining({ status: "failed", step: "refunded" }));
    expect(await holding(h.ports.journal, bridging(ROUTES.ethForeign), EXAMPLE_CHAINS.foreignEth)).toBe(
      100n * COST.eth
    );
    const moves = h.ports.journal.ledger.entries.filter((e) => e.operationId === op!.id).map((e) => e.amount);
    expect(moves).toEqual([100n * COST.eth, -100n * COST.eth, 100n * COST.eth]);
  });

  it("releases the claim and defers when the withdrawal simulation fails", async () => {
    const h = harness();
    soloEthPair(h, ROUTES.ethForeign);
    h.treasuries.get("eth-home")!.setBalance(ASSETS.ethNative, 0n, parseUnits("1", 18));
    h.ports.executor.script((_, o) => o.idempotencyKey.includes(":step:withdraw:"), {
      status: "failed",
      error: "execution reverted revertData=none",
    });
    expect((await h.loop(ROUTES.ethForeign).tick(h.tickCtx())).status).toBe("deferred");
    const [op] = await operations(h, ROUTES.ethForeign);
    expect(op!.status).toBe("failed");
    expect([...h.ports.journal.ledger.claims.values()].map((c) => c.state)).toEqual(["released"]);
    expect(await h.ports.journal.ledger.openClaims(ethClaimKey)).toEqual([]);
    expect(submissions(h, ":step:fund")).toEqual([]);
    expect(h.ports.journal.ledger.entries).toEqual([]);
  });

  it("defers and notifies without touching arbitration or gas holdings", async () => {
    const h = harness();
    soloEthPair(h, ROUTES.ethHome);
    h.treasuries.get("eth-home")!.setBalance(ASSETS.ethNative, parseUnits("5", 18), 0n);
    const others: AccountingScope[] = [
      { kind: "arbitration", pairId: "eth-home" },
      { kind: "gas", chainId: EXAMPLE_CHAINS.home },
    ];
    for (const scope of others) {
      await h.ports.journal.ledger.credit({
        scope,
        chainId: EXAMPLE_CHAINS.home,
        asset: NATIVE,
        location: "eoa",
        amount: parseUnits("1", 18),
        operationId: "seed",
        reason: "seed",
      });
    }
    expect((await h.loop(ROUTES.ethHome).tick(h.tickCtx())).status).toBe("deferred");
    expect(h.ports.notifier.sent.map((n) => n.dedupKey)).toContain(`reporter:${ROUTES.ethHome}:short`);
    expect(h.ports.journal.ledger.entries.filter((e) => e.amount < 0n)).toEqual([]);
    for (const scope of others) {
      expect(await holding(h.ports.journal, scope, EXAMPLE_CHAINS.home)).toBe(parseUnits("1", 18));
    }
    expect(h.ports.executor.submissions).toEqual([]);
    expect(
      await h.ports.journal.ledger.openClaims(
        foreignGatewayClaimKey("eth-home", "arbitration", `${EXAMPLE_CHAINS.foreignEth}:native`)
      )
    ).toEqual([]);
  });

  it("two loops over the same journal keep working when one is suspended", async () => {
    const h = harness();
    h.funding.balances.set(ROUTES.ethForeign, 0n);
    h.funding.balances.set(ROUTES.ethHome, 0n);
    h.treasuries.get("eth-home")!.setBalance(ASSETS.ethNative, 0n, parseUnits("1", 18));
    h.ports.executor.script((_, o) => o.idempotencyKey.endsWith(":step:fund") && o.operationId === "op-1", {
      status: "pending",
      hash: "0x0f",
    });
    const foreign = h.loop(ROUTES.ethForeign);
    const home = h.loop(ROUTES.ethHome);
    expect((await foreign.tick(h.tickCtx())).status).toBe("acted");
    const [op] = await operations(h, ROUTES.ethForeign);
    expect(op!.id).toBe("op-1");
    expect(op!.step).toBe("funding");

    // The foreign route is suspended (its preflight fails) with its funding still in flight.
    h.funding.preflights.set(ROUTES.ethForeign, { ok: false, reasons: ["no code at reporter"] });
    expect((await foreign.tick(h.tickCtx())).status).toBe("deferred");
    expect((await home.tick(h.tickCtx())).status).toBe("acted");
    expect((await operations(h, ROUTES.ethHome))[0]!.status).toBe("completed");

    h.ports.executor.settle(`op:${op!.id}:step:fund`, {
      status: "confirmed",
      hash: "0x0f",
      blockNumber: 5n,
      gasUsed: 1n,
    });
    expect((await foreign.tick(h.tickCtx())).status).toBe("suspended");
    expect((await h.ports.journal.getOperation(op!.id))!.status).toBe("completed");
    expect((await foreign.tick(h.tickCtx())).status).toBe("suspended");
    expect(await operations(h, ROUTES.ethForeign)).toHaveLength(1);
  });
});

// ------------------------------------------------------------------------------------------------ crash and resume

class Crash extends Error {}

/** The journal of the crashed process: every write after the first `allowed` throws before it happens. */
function crashingPorts(ports: FakePorts, allowed: number): { ports: FakePorts; writes: () => number } {
  let writes = 0;
  const gate = () => {
    writes += 1;
    if (writes > allowed) throw new Crash(`crash before write ${writes}`);
  };
  const wrap = <T extends object>(target: T, names: string[]): T =>
    new Proxy(target, {
      get(obj, prop, receiver) {
        const value = Reflect.get(obj, prop, receiver);
        if (typeof value !== "function") return value;
        if (names.includes(String(prop))) {
          return async (...args: unknown[]) => {
            gate();
            return (value as (...a: unknown[]) => unknown).apply(obj, args);
          };
        }
        return (value as (...a: unknown[]) => unknown).bind(obj);
      },
    });
  const ledger = wrap<Ledger>(ports.journal.ledger, [
    "claim",
    "releaseClaim",
    "settleClaim",
    "credit",
    "debit",
    "recordSpend",
  ]);
  const journal = wrap(ports.journal, ["createOperation", "updateOperation", "recordObservation"]);
  const journalWithLedger = new Proxy(journal, {
    get: (obj, prop, receiver) => (prop === "ledger" ? ledger : Reflect.get(obj, prop, receiver)),
  });
  return { ports: { ...ports, journal: journalWithLedger }, writes: () => writes };
}

type Scenario = { name: string; routeId: string; prepare: (h: Harness) => void };

const scenarios: Scenario[] = [
  {
    name: "foreign-chain route",
    routeId: ROUTES.ethForeign,
    prepare: (h) => h.treasuries.get("eth-home")!.setBalance(ASSETS.ethNative, 0n, parseUnits("1", 18)),
  },
  {
    name: "Base USDC conversion",
    routeId: ROUTES.ethForeign,
    prepare: (h) => {
      h.treasuries.get("eth-home")!.setBalance(ASSETS.baseUsdc, 0n, parseUnits("100", 6));
      convertAtQuoteRate(h);
    },
  },
  {
    name: "home-chain route bridging its share",
    routeId: ROUTES.ethHome,
    prepare: (h) => h.treasuries.get("eth-home")!.setBalance(ASSETS.ethNative, 0n, parseUnits("1", 18)),
  },
];

describe("reporter funding loop crash and resume", () => {
  for (const scenario of scenarios) {
    it(`${scenario.name}: resumes after a crash between any two writes`, async () => {
      // A clean run counts the journal writes of the whole operation.
      const clean = harness();
      soloEthPair(clean, scenario.routeId);
      scenario.prepare(clean);
      const counting = crashingPorts(clean.ports, Number.MAX_SAFE_INTEGER);
      await loopOver(counting.ports, clean, scenario.routeId).tick(clean.tickCtx());
      expect((await operations(clean, scenario.routeId))[0]!.status).toBe("completed");
      const total = counting.writes();
      expect(total).toBeGreaterThan(5);

      const outcomes = new Set<string>();
      for (let allowed = 0; allowed < total; allowed++) {
        const h = harness();
        soloEthPair(h, scenario.routeId);
        scenario.prepare(h);
        const crashed = crashingPorts(h.ports, allowed);
        const first = await loopOver(crashed.ports, h, scenario.routeId).tick(h.tickCtx());
        expect(first.status, `crash after ${allowed} writes`).toBe("failed");

        // The restarted process: a new loop over the same journal, executor and Transfers.
        for (let tick = 0; tick < 4; tick++) {
          syncReporterBalance(h, scenario.routeId);
          await h.loop(scenario.routeId).tick(h.tickCtx());
        }
        const ops = await operations(h, scenario.routeId);
        const label = `crash after ${allowed} writes: ${ops.map((o) => `${o.step}/${o.status}`).join(", ")}`;
        outcomes.add(ops.map((o) => `${o.step}/${o.status}`).join(","));
        expect(
          ops.filter((o) => o.status === "open"),
          label
        ).toEqual([]);
        expect(ops.length, label).toBeLessThanOrEqual(1);
        expect(submissions(h, ":step:withdraw:").length, label).toBeLessThanOrEqual(1);
        expect(h.transfers.intents.length, label).toBeLessThanOrEqual(1);
        const funds = submissions(h, ":step:fund");
        expect(funds.length, label).toBeLessThanOrEqual(1);
        const op = ops[0];
        if (op?.step === "funded") {
          expect(op.status, label).toBe("completed");
          expect(funds[0]!.request.value, label).toBe((op.stepPayload as unknown as FundingState).fundAmount);
        } else if (op) {
          expect(op.status, label).toBe("attention");
          expect(
            funds.filter((f) => f.outcome.status === "confirmed"),
            label
          ).toEqual([]);
        }
        // Never doubled: no holding goes negative and nothing beyond the need is sent.
        for (const row of await h.ports.journal.ledger.holdings()) {
          expect(row.amount, `${label} ${scopeKey(row.scope)}`).toBeGreaterThanOrEqual(0n);
        }
        expect(
          funds.reduce((acc, f) => acc + f.request.value, 0n),
          label
        ).toBeLessThanOrEqual(100n * COST.eth);
      }
      // Most crash points resume to a completed funding; the ambiguous windows end in attention.
      expect([...outcomes]).toEqual(
        expect.arrayContaining(["funded/completed", "debiting/attention", "sourcing/attention"])
      );
    });
  }
});

/** The fake reporter balance follows the confirmed fundings, as the chain would. */
function syncReporterBalance(h: Harness, routeId: string): void {
  const reporter = h.route(routeId).route.reporter;
  const received = h.ports.executor.submissions
    .filter((s) => s.request.to === reporter && s.outcome.status === "confirmed")
    .reduce((acc, s) => acc + s.request.value, 0n);
  h.funding.balances.set(routeId, received);
}

function loopOver(ports: FakePorts, h: Harness, routeId: string): ReporterFundingLoop {
  const route = h.ports.config.topology.routes.find((r) => r.id === routeId)!;
  return new ReporterFundingLoop(route, {
    ports,
    funding: h.funding,
    treasury: h.treasuries.get(route.pairId),
    transfers: h.transfers,
    routeProvider: h.routeProvider,
  });
}

describe("createReporterLoops", () => {
  it("builds one loop per route; an unconfigured cost per message suspends the route", async () => {
    const ports = makeFakePorts();
    const loops = createReporterLoops(ports, {
      gateways: { treasuries: new Map(), homeGateways: new Map() },
      transfers: new FakeTransfers(ports.journal),
      routeProvider: new FakeRouteProvider(),
    });
    expect(loops.map((l) => l.id)).toEqual(ports.config.topology.routes.map((r) => `reporter:${r.id}`));
    const result = await loops[0]!.tick({ now: ports.clock.now(), signal: new AbortController().signal });
    expect(result.status).toBe("suspended");
    expect(result.summary).toMatch(/no costPerMessage/);
    expect(ports.executor.submissions).toEqual([]);
  });
});

// ------------------------------------------------------------------------------------------------ follow-up 005

/**
 * `Transfers` with the real `LifiTransfers.start` semantics for a missing source holding: before it starts a
 * transfer it checks every allocation's `eoa` holding on the source chain and defers with the
 * `insufficient-holding:` code ([L20]) instead of throwing, as the fake's ledger debit would. Otherwise it delegates.
 */
class HoldingCheckedTransfers implements Transfers {
  constructor(
    private readonly journal: Journal,
    private readonly inner: FakeTransfers
  ) {}

  async run(intent: TransferIntent): Promise<TransferOutcome> {
    if (!this.inner.outcomes.has(`${intent.parentOperationId}:${intent.tag}`)) {
      for (const allocation of intent.allocations) {
        const held = await holding(this.journal, allocation.scope, intent.fromChainId, intent.fromAsset.address);
        if (held < allocation.amount) {
          return {
            status: "deferred",
            reason: `insufficient-holding: ${scopeKey(allocation.scope)} holding ${held} < ${allocation.amount}`,
          };
        }
      }
    }
    return this.inner.run(intent);
  }
}

function loopWith(h: Harness, routeId: string, transfers: Transfers, funding: ReporterFunding = h.funding) {
  const route = h.ports.config.topology.routes.find((r) => r.id === routeId)!;
  return new ReporterFundingLoop(route, {
    ports: h.ports,
    funding,
    treasury: h.treasuries.get(route.pairId),
    transfers,
    routeProvider: h.routeProvider,
  });
}

/** A home-chain route whose withdrawal confirmed but whose credit was lost (a crash between marker and credit). */
async function homeRouteWithLostCredit(h: Harness, transfers: Transfers): Promise<{ op: Operation }> {
  soloEthPair(h, ROUTES.ethHome);
  h.treasuries.get("eth-home")!.setBalance(ASSETS.ethNative, 0n, parseUnits("1", 18));
  const ledger = h.ports.journal.ledger;
  const credit = ledger.credit.bind(ledger);
  ledger.credit = async () => {
    throw new Error("crash before the withdrawal credit");
  };
  expect((await loopWith(h, ROUTES.ethHome, transfers).tick(h.tickCtx())).status).toBe("failed");
  ledger.credit = credit;
  const [op] = await operations(h, ROUTES.ethHome);
  expect((op!.stepPayload as unknown as FundingState).legs[0]!.status).toBe("credited");
  return { op: op! };
}

describe("reporter funding loop, follow-up 005", () => {
  it("home-chain route of a multi-asset pair: one operation with a same-unit leg and a cross-asset leg", async () => {
    const h = harness();
    soloEthPair(h, ROUTES.ethHome);
    const usdc = (n: string) => parseUnits(n, 6);
    const treasury = h.treasuries.get("eth-home")!;
    treasury.setBalance(ASSETS.ethNative, 0n, 50n * COST.eth); // 0.01 ETH, half the need
    treasury.setBalance(ASSETS.baseUsdc, 0n, usdc("100")); // worth 0.04 ETH
    convertAtQuoteRate(h);
    const need = 100n * COST.eth;

    expect((await h.loop(ROUTES.ethHome).tick(h.tickCtx())).status).toBe("acted");
    const [op] = await operations(h, ROUTES.ethHome);
    expect(op).toEqual(expect.objectContaining({ status: "completed", step: "funded" }));
    const legs = (op!.payload as unknown as FundingPayload).legs;
    expect(legs).toEqual([
      expect.objectContaining({ asset: ASSETS.ethNative, claimAmount: 50n * COST.eth, transfer: true, quote: null }),
      expect.objectContaining({
        asset: ASSETS.baseUsdc,
        claimAmount: usdc("25"),
        transfer: true,
        quote: expect.objectContaining({ inputAmount: usdc("25"), estimatedOutput: 50n * COST.eth }),
      }),
    ]);
    expect(h.transfers.intents.map((i) => [i.tag, i.fromAsset.symbol, i.toChainId, i.amount])).toEqual([
      ["leg:0", "ETH", EXAMPLE_CHAINS.home, 50n * COST.eth],
      ["leg:1", "USDC", EXAMPLE_CHAINS.home, usdc("25")],
    ]);
    for (const intent of h.transfers.intents) {
      expect(intent.allocations).toEqual([{ scope: bridging(ROUTES.ethHome), amount: intent.amount }]);
    }
    expect(submissions(h, ":step:withdraw:").map((s) => s.options.idempotencyKey)).toEqual([
      `op:${op!.id}:step:withdraw:0`,
      `op:${op!.id}:step:withdraw:1`,
    ]);
    expect(submissions(h, ":step:fund").map((s) => s.request)).toEqual([
      { chainId: EXAMPLE_CHAINS.home, to: h.route(ROUTES.ethHome).route.reporter, value: need },
    ]);
    expect([...h.ports.journal.ledger.claims.values()].map((c) => [c.state, c.actualAmount])).toEqual([
      ["settled", 50n * COST.eth],
      ["settled", usdc("25")],
    ]);
    for (const [chainId, asset] of [
      [EXAMPLE_CHAINS.home, NATIVE],
      [EXAMPLE_CHAINS.foreignEth, NATIVE],
      [EXAMPLE_CHAINS.foreignEth, ASSETS.baseUsdc.address],
    ] as const) {
      expect(await holding(h.ports.journal, bridging(ROUTES.ethHome), chainId, asset)).toBe(0n);
    }
  });

  it("refuses a CCIP reporter that pays in an ERC20 feeToken with a critical notification", async () => {
    const h = harness();
    soloEthPair(h, ROUTES.ethForeign);
    h.treasuries.get("eth-home")!.setBalance(ASSETS.ethNative, 0n, parseUnits("1", 18));
    const route = h.route(ROUTES.ethForeign).route;
    const chain = h.ports.chains.get(EXAMPLE_CHAINS.foreignEth)!;
    chain.setCode(route.reporter);
    chain.setNativeBalance(route.reporter, 0n);
    chain.onRead((call) => call.functionName === "feeToken", "0x00000000000000000000000000000000000000fe");
    const real = new NativeTransferReporterFunding(h.ports.config.topology, h.ports.chains, h.ports.signer);

    const result = await loopWith(h, ROUTES.ethForeign, h.transfers, real).tick(h.tickCtx());
    expect(result.status).toBe("suspended");
    expect(result.summary).toMatch(/ERC20 feeToken 0x0+fe/);
    const [critical] = h.ports.notifier.bySeverity("critical");
    expect(critical).toEqual(expect.objectContaining({ routeId: ROUTES.ethForeign }));
    expect(critical!.body).toMatch(/feeToken/);
    expect(h.ports.executor.submissions).toEqual([]);
    expect(h.ports.journal.operations.size).toBe(0);
  });

  it("clears its own suspension when the reason no longer holds; a restart clears nothing by itself", async () => {
    const h = harness();
    soloEthPair(h, ROUTES.ethForeign);
    h.treasuries.get("eth-home")!.setBalance(ASSETS.ethNative, 0n, parseUnits("1", 18));
    h.ports.executor.script((_, o) => o.idempotencyKey.endsWith(":step:fund") && o.operationId === "op-1", {
      status: "replaced",
      hash: "0x01",
      replacedByHash: "0x02",
    });
    await h.loop(ROUTES.ethForeign).tick(h.tickCtx());
    const [op] = await operations(h, ROUTES.ethForeign);
    expect([op!.id, op!.status]).toEqual(["op-1", "attention"]);
    const key = `suspended:reporter:${ROUTES.ethForeign}`;
    const suspended = async () => (await h.ports.journal.observations(key)).find((o) => o.key === key)!.value;

    // A restart (a new loop instance over the same journal) while the reason holds: still suspended, no resume.
    expect((await h.loop(ROUTES.ethForeign).tick(h.tickCtx())).status).toBe("suspended");
    expect((await h.loop(ROUTES.ethForeign).tick(h.tickCtx())).status).toBe("suspended");
    expect(await suspended()).toEqual(expect.objectContaining({ suspended: true }));
    expect(h.ports.notifier.sent.filter((n) => n.dedupKey.endsWith(":resumed"))).toEqual([]);
    expect(h.ports.notifier.sent.filter((n) => n.title.endsWith("suspended"))).toHaveLength(1);

    // The operator closes the operation: the next tick of any instance clears the suspension and funds again.
    await h.ports.journal.updateOperation(op!.id, { status: "failed", lastError: "reconciled by the operator" });
    expect((await h.loop(ROUTES.ethForeign).tick(h.tickCtx())).status).toBe("acted");
    expect(await suspended()).toEqual(expect.objectContaining({ suspended: false }));
    expect(h.ports.notifier.sent.filter((n) => n.dedupKey.endsWith(":resumed"))).toHaveLength(1);
  });

  it("real Transfers semantics: a lost withdrawal credit defers insufficient-holding, then attention", async () => {
    const h = harness();
    const transfers = new HoldingCheckedTransfers(h.ports.journal, h.transfers);
    const { op } = await homeRouteWithLostCredit(h, transfers);
    const max = h.ports.config.reporter.maxAmbiguousDeferrals;
    for (let i = 1; i < max; i++) {
      // The first resume settles the claim (progress), then only defers.
      const status = (await loopWith(h, ROUTES.ethHome, transfers).tick(h.tickCtx())).status;
      expect(status, `tick ${i}`).toBe(i === 1 ? "acted" : "deferred");
      const state = (await h.ports.journal.getOperation(op.id))!.stepPayload as unknown as FundingState;
      expect(state.legs[0]!.deferrals).toBe(i);
    }
    const warnings = h.ports.notifier.sent.filter(
      (n) => n.dedupKey === `reporter:${ROUTES.ethHome}:transfer-ambiguous:${op.id}`
    );
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings.every((n) => n.severity === "warning")).toBe(true);
    expect(h.ports.notifier.bySeverity("critical")).toEqual([]);

    expect((await loopWith(h, ROUTES.ethHome, transfers).tick(h.tickCtx())).status).toBe("suspended");
    const done = (await h.ports.journal.getOperation(op.id))!;
    expect(done.status).toBe("attention");
    expect(done.lastError).toMatch(/insufficient-holding:/);
    expect(h.ports.notifier.bySeverity("critical").map((n) => n.dedupKey)).toContain(
      `reporter:${ROUTES.ethHome}:attention:${op.id}`
    );
    // Never transferred, never funded; its withdrawal no longer counts in the pair's pool.
    expect(h.transfers.intents).toEqual([]);
    expect(submissions(h, ":step:fund")).toEqual([]);
    expect(
      await h.ports.journal.listOperations({ kind: "reporter-funding", pairId: "eth-home", status: "open" })
    ).toEqual([]);
  });

  it("an ambiguous deferral also goes to attention past the age limit", async () => {
    const h = harness();
    h.transfers.onRun(() => true, { status: "deferred", reason: "insufficient-holding: bridging holding 0 < 1" });
    soloEthPair(h, ROUTES.ethHome);
    h.treasuries.get("eth-home")!.setBalance(ASSETS.ethNative, 0n, parseUnits("1", 18));
    expect((await h.loop(ROUTES.ethHome).tick(h.tickCtx())).status).toBe("acted");
    const [op] = await operations(h, ROUTES.ethHome);
    expect(op!.status).toBe("open");
    h.ports.clock.advance(h.ports.config.reporter.ambiguousDeferralMaxAgeMinutes * 60_000);
    expect((await h.loop(ROUTES.ethHome).tick(h.tickCtx())).status).toBe("suspended");
    expect((await h.ports.journal.getOperation(op!.id))!.status).toBe("attention");
  });

  for (const reason of [
    "price-unavailable: 2 of 3 sources",
    "no-route: no quote for USDC@1002 -> ETH@1003",
    "policy-rejected: limit: over the daily limit",
  ]) {
    const code = reason.slice(0, reason.indexOf(":"));
    it(`a ${code} deferral warns once per operation and keeps retrying, never attention`, async () => {
      const h = harness();
      h.transfers.onRun(() => true, { status: "deferred", reason });
      soloEthPair(h, ROUTES.ethHome);
      h.treasuries.get("eth-home")!.setBalance(ASSETS.ethNative, 0n, parseUnits("1", 18));
      await h.loop(ROUTES.ethHome).tick(h.tickCtx());
      const [op] = await operations(h, ROUTES.ethHome);
      const ticks = h.ports.config.reporter.maxAmbiguousDeferrals * 2;
      for (let i = 0; i < ticks; i++) {
        h.ports.clock.advance(h.ports.config.reporter.ambiguousDeferralMaxAgeMinutes * 60_000);
        expect((await h.loop(ROUTES.ethHome).tick(h.tickCtx())).status).toBe("deferred");
      }
      const after = (await h.ports.journal.getOperation(op!.id))!;
      expect(after.status).toBe("open");
      expect((after.stepPayload as unknown as FundingState).legs[0]!.deferrals).toBe(0);
      const warned = h.ports.notifier.sent.filter((n) => n.operationId === op!.id && n.severity === "warning");
      expect(new Set(warned.map((n) => n.dedupKey))).toEqual(
        new Set([`reporter:${ROUTES.ethHome}:transfer-deferred:${op!.id}`])
      );
      expect(h.ports.notifier.bySeverity("critical")).toEqual([]);
      expect(h.ports.logger.entries.some((e) => e.level === "warn" && e.message === "reporter transfer deferred")).toBe(
        true
      );

      // The reason clears: the same operation transfers and funds.
      h.transfers.scripts.length = 0;
      expect((await h.loop(ROUTES.ethHome).tick(h.tickCtx())).status).toBe("acted");
      expect((await h.ports.journal.getOperation(op!.id))!.status).toBe("completed");
    });
  }

  it("an allocations-mismatch deferral goes to attention at once", async () => {
    const h = harness();
    h.transfers.onRun(() => true, { status: "deferred", reason: "allocations-mismatch: allocations sum to 1, not 2" });
    soloEthPair(h, ROUTES.ethHome);
    h.treasuries.get("eth-home")!.setBalance(ASSETS.ethNative, 0n, parseUnits("1", 18));
    await h.loop(ROUTES.ethHome).tick(h.tickCtx());
    const [op] = await operations(h, ROUTES.ethHome);
    expect(op!.status).toBe("attention");
    expect(op!.lastError).toMatch(/allocations-mismatch:/);
    expect(h.ports.notifier.bySeverity("critical")[0]!.operationId).toBe(op!.id);
  });

  it("an unrecognised deferral reason is ambiguous and bounded", async () => {
    const h = harness();
    h.transfers.onRun(() => true, { status: "deferred", reason: "something new the bot does not know" });
    soloEthPair(h, ROUTES.ethHome);
    h.treasuries.get("eth-home")!.setBalance(ASSETS.ethNative, 0n, parseUnits("1", 18));
    await h.loop(ROUTES.ethHome).tick(h.tickCtx());
    const [op] = await operations(h, ROUTES.ethHome);
    for (let i = 1; i < h.ports.config.reporter.maxAmbiguousDeferrals; i++) {
      expect((await h.ports.journal.getOperation(op!.id))!.status).toBe("open");
      await h.loop(ROUTES.ethHome).tick(h.tickCtx());
    }
    expect((await h.ports.journal.getOperation(op!.id))!.status).toBe("attention");
    expect(h.ports.notifier.sent.map((n) => n.dedupKey)).toContain(
      `reporter:${ROUTES.ethHome}:transfer-ambiguous:${op!.id}`
    );
  });
});

describe("reporter funding loop, follow-up 006", () => {
  it("a failed feeToken() read defers with a warning: no suspension, no funding, funds once readable", async () => {
    const h = harness();
    soloEthPair(h, ROUTES.ethForeign);
    h.treasuries.get("eth-home")!.setBalance(ASSETS.ethNative, 0n, parseUnits("1", 18));
    const route = h.route(ROUTES.ethForeign).route;
    const chain = h.ports.chains.get(EXAMPLE_CHAINS.foreignEth)!;
    // A dispatcher with the feeToken() selector: the function exists, so a failed read says nothing about the fees.
    chain.setCode(route.reporter, `0x63${FEE_TOKEN_SELECTOR}14`);
    let read: () => unknown = () => {
      throw new Error("HTTP request failed. revertData=none");
    };
    chain.onRead(
      (call) => call.functionName === "feeToken",
      () => read()
    );
    const real = new NativeTransferReporterFunding(h.ports.config.topology, h.ports.chains, h.ports.signer);

    for (let i = 0; i < 2; i++) {
      const result = await loopWith(h, ROUTES.ethForeign, h.transfers, real).tick(h.tickCtx());
      expect(result.status).toBe("deferred");
      expect(result.summary).toMatch(/preflight of route .* unavailable: feeToken\(\)/);
    }
    expect(h.ports.journal.operations.size).toBe(0);
    expect(h.ports.executor.submissions).toEqual([]);
    expect(h.ports.notifier.bySeverity("critical")).toEqual([]);
    const warned = h.ports.notifier.sent.filter(
      (n) => n.dedupKey === `reporter:${ROUTES.ethForeign}:preflight-unavailable`
    );
    expect(warned.length).toBeGreaterThan(0);
    expect(warned.every((n) => n.severity === "warning")).toBe(true);
    const key = `suspended:reporter:${ROUTES.ethForeign}`;
    expect((await h.ports.journal.observations(key)).filter((o) => o.key === key)).toEqual([]);
    const capacity = (await h.ports.journal.observations(`reporter:${ROUTES.ethForeign}`))[0]!.value as {
      suspended: boolean;
    };
    expect(capacity.suspended).toBe(false);

    read = () => "0x0000000000000000000000000000000000000000";
    expect((await loopWith(h, ROUTES.ethForeign, h.transfers, real).tick(h.tickCtx())).status).toBe("acted");
    expect(submissions(h, ":step:fund")).toHaveLength(1);
  });

  it("only consecutive ambiguous deferrals count: a transient or in-progress outcome resets the counter", async () => {
    const h = harness();
    let reason = "insufficient-holding: bridging holding 0 < 1";
    h.transfers.onRun(
      () => true,
      () => ({ status: "deferred", reason })
    );
    soloEthPair(h, ROUTES.ethHome);
    h.treasuries.get("eth-home")!.setBalance(ASSETS.ethNative, 0n, parseUnits("1", 18));
    await h.loop(ROUTES.ethHome).tick(h.tickCtx());
    const [op] = await operations(h, ROUTES.ethHome);
    const leg = async () =>
      ((await h.ports.journal.getOperation(op!.id))!.stepPayload as unknown as FundingState).legs[0]!;
    expect((await leg()).deferrals).toBe(1);

    // An hour of price-unavailable (past the age limit, more deferrals than the bound).
    reason = "price-unavailable: 2 of 3 sources";
    const minutes = h.ports.config.reporter.ambiguousDeferralMaxAgeMinutes;
    for (let i = 0; i < h.ports.config.reporter.maxAmbiguousDeferrals + 1; i++) {
      h.ports.clock.advance(Math.ceil((minutes * 60_000) / 4));
      expect((await h.loop(ROUTES.ethHome).tick(h.tickCtx())).status).toBe("deferred");
    }
    expect(await leg()).toEqual(expect.objectContaining({ deferrals: 0, deferredSince: null }));

    // One more ambiguous deferral: the first of a new run, not attention.
    reason = "insufficient-holding: bridging holding 0 < 1";
    expect((await h.loop(ROUTES.ethHome).tick(h.tickCtx())).status).toBe("deferred");
    expect((await h.ports.journal.getOperation(op!.id))!.status).toBe("open");
    expect(await leg()).toEqual(
      expect.objectContaining({ deferrals: 1, deferredSince: h.ports.clock.now().toISOString() })
    );

    // An in-progress transfer resets it too.
    const key = `${op!.id}:leg:0`;
    h.transfers.outcomes.set(key, { status: "in-progress", operationId: "transfer-1", step: "sent" });
    expect((await h.loop(ROUTES.ethHome).tick(h.tickCtx())).status).toBe("deferred");
    expect((await leg()).deferrals).toBe(0);
    h.transfers.outcomes.delete(key);
    h.ports.clock.advance(minutes * 60_000);
    expect((await h.loop(ROUTES.ethHome).tick(h.tickCtx())).status).toBe("deferred");
    expect((await h.ports.journal.getOperation(op!.id))!.status).toBe("open");
    expect(h.ports.notifier.bySeverity("critical")).toEqual([]);
  });

  describe("a failed funding credits back through the crediting marker", () => {
    const fundAmount = 100n * COST.eth;

    function failedFunding(): Harness {
      const h = harness();
      soloEthPair(h, ROUTES.ethForeign);
      h.treasuries.get("eth-home")!.setBalance(ASSETS.ethNative, 0n, parseUnits("1", 18));
      h.ports.executor.script((_, o) => o.idempotencyKey.endsWith(":step:fund"), {
        status: "failed",
        error: "simulation failed revertData=none",
      });
      return h;
    }

    const routeHolding = (h: Harness) =>
      holding(h.ports.journal, bridging(ROUTES.ethForeign), EXAMPLE_CHAINS.foreignEth);
    const moves = (h: Harness, opId: string) =>
      h.ports.journal.ledger.entries.filter((e) => e.operationId === opId).map((e) => e.amount);

    it("a crash after the marker and before the credit: the resume credits once", async () => {
      const h = failedFunding();
      const ledger = h.ports.journal.ledger;
      const credit = ledger.credit.bind(ledger);
      ledger.credit = async (entry) => {
        if (entry.reason === "reporter funding not executed") throw new Error("crash before the credit back");
        return credit(entry);
      };
      expect((await h.loop(ROUTES.ethForeign).tick(h.tickCtx())).status).toBe("failed");
      ledger.credit = credit;
      const [op] = await operations(h, ROUTES.ethForeign);
      expect([op!.step, op!.status]).toEqual(["crediting", "open"]);
      const state = op!.stepPayload as unknown as FundingState;
      expect(state.refund).toEqual(expect.objectContaining({ outcome: "failed", holdingBefore: 0n }));
      expect(await routeHolding(h)).toBe(0n);

      expect((await h.loop(ROUTES.ethForeign).tick(h.tickCtx())).status).toBe("acted");
      const after = (await h.ports.journal.getOperation(op!.id))!;
      expect([after.step, after.status]).toEqual(["refunded", "failed"]);
      expect(await routeHolding(h)).toBe(fundAmount);
      expect(moves(h, op!.id)).toEqual([fundAmount, -fundAmount, fundAmount]);
      expect(submissions(h, ":step:fund")).toHaveLength(1);
    });

    it("a crash after the credit and before the terminal marker: the resume never credits twice", async () => {
      const h = failedFunding();
      const journal = h.ports.journal;
      const update = journal.updateOperation.bind(journal);
      journal.updateOperation = async (id, change) => {
        if (change.step === "refunded") throw new Error("crash before the terminal marker");
        return update(id, change);
      };
      expect((await h.loop(ROUTES.ethForeign).tick(h.tickCtx())).status).toBe("failed");
      journal.updateOperation = update;
      const [op] = await operations(h, ROUTES.ethForeign);
      expect([op!.step, op!.status]).toEqual(["crediting", "open"]);
      expect(await routeHolding(h)).toBe(fundAmount);

      await h.loop(ROUTES.ethForeign).tick(h.tickCtx());
      const after = (await h.ports.journal.getOperation(op!.id))!;
      expect([after.step, after.status]).toEqual(["refunded", "failed"]);
      expect(await routeHolding(h)).toBe(fundAmount);
      expect(moves(h, op!.id)).toEqual([fundAmount, -fundAmount, fundAmount]);
    });

    it("a resume finding the holding neither before nor after the credit goes to attention", async () => {
      const h = failedFunding();
      const ledger = h.ports.journal.ledger;
      const credit = ledger.credit.bind(ledger);
      ledger.credit = async (entry) => {
        if (entry.reason === "reporter funding not executed") throw new Error("crash before the credit back");
        return credit(entry);
      };
      await h.loop(ROUTES.ethForeign).tick(h.tickCtx());
      ledger.credit = credit;
      const [op] = await operations(h, ROUTES.ethForeign);
      await ledger.credit({
        scope: bridging(ROUTES.ethForeign),
        chainId: EXAMPLE_CHAINS.foreignEth,
        asset: NATIVE,
        location: "eoa",
        amount: 7n,
        operationId: "op-other",
        reason: "unrelated",
      });

      expect((await h.loop(ROUTES.ethForeign).tick(h.tickCtx())).status).toBe("suspended");
      const after = (await h.ports.journal.getOperation(op!.id))!;
      expect(after.status).toBe("attention");
      expect(after.lastError).toMatch(/crediting marker/);
      expect(moves(h, op!.id)).toEqual([fundAmount, -fundAmount]);
      expect(h.ports.notifier.bySeverity("critical")[0]!.operationId).toBe(op!.id);
    });

    it("follow-up 008: credits back a failed funding only when it was never signed", async () => {
      // Never signed (the executor's record is `failed` with no hash and no signed raw transaction): credited back.
      const unsigned = failedFunding();
      await unsigned.loop(ROUTES.ethForeign).tick(unsigned.tickCtx());
      const [refunded] = await operations(unsigned, ROUTES.ethForeign);
      expect((await unsigned.ports.journal.getTransaction(`op:${refunded!.id}:step:fund`))!.signedRaw).toBeNull();
      expect([refunded!.step, refunded!.status]).toEqual(["refunded", "failed"]);
      expect(await routeHolding(unsigned)).toBe(fundAmount);

      // A record showing a signed transaction (a `failed` answer that contradicts it): attention, nothing credited.
      const h = failedFunding();
      const journal = h.ports.journal;
      const getTransaction = journal.getTransaction.bind(journal);
      journal.getTransaction = async (key) => {
        const record = await getTransaction(key);
        return record && key.endsWith(":step:fund")
          ? { ...record, status: "broadcast", hash: `0x${"ab".repeat(32)}`, signedRaw: "0x02f8" }
          : record;
      };
      await h.loop(ROUTES.ethForeign).tick(h.tickCtx());
      const [op] = await operations(h, ROUTES.ethForeign);
      expect(op!.status).toBe("attention");
      expect((await h.loop(ROUTES.ethForeign).tick(h.tickCtx())).status).toBe("suspended");
      expect(op!.lastError).toMatch(/may have been signed, so nothing is credited back/);
      expect(await routeHolding(h)).toBe(0n);
      expect(moves(h, op!.id)).toEqual([fundAmount, -fundAmount]);
      expect(op!.step).not.toBe("crediting");
      expect(h.ports.notifier.bySeverity("critical")[0]!.operationId).toBe(op!.id);
    });
  });
});

describe("reporter funding loop, follow-up 007", () => {
  const ERC20_FEE = {
    ok: false,
    reasons: ["reporter pays its fees in the ERC20 feeToken 0xfe; only reporters paying native fees are supported"],
  };

  /** The home-chain route's bridge is in flight (tick 1), then lands; the test does the transfer's ledger moves. */
  async function homeRouteBridgeLanded(h: Harness): Promise<{ op: Operation; received: bigint }> {
    soloEthPair(h, ROUTES.ethHome);
    h.treasuries.get("eth-home")!.setBalance(ASSETS.ethNative, 0n, parseUnits("1", 18));
    h.transfers.onRun(
      () => true,
      (intent) => ({ status: "in-progress", operationId: `t-${intent.parentOperationId}`, step: "send" })
    );
    const need = 100n * COST.eth;
    expect((await h.loop(ROUTES.ethHome).tick(h.tickCtx())).status).toBe("acted");
    const [op] = await operations(h, ROUTES.ethHome);
    const received = need - 10n ** 13n;
    const transferId = `t-${op!.id}`;
    await h.ports.journal.ledger.debit({
      scope: bridging(ROUTES.ethHome),
      chainId: EXAMPLE_CHAINS.foreignEth,
      asset: NATIVE,
      location: "eoa",
      amount: need,
      operationId: transferId,
      reason: "transfer sent",
    });
    await h.ports.journal.ledger.credit({
      scope: bridging(ROUTES.ethHome),
      chainId: EXAMPLE_CHAINS.home,
      asset: NATIVE,
      location: "eoa",
      amount: received,
      operationId: transferId,
      reason: "transfer received",
    });
    h.transfers.outcomes.set(`${op!.id}:leg:0`, {
      status: "completed",
      operationId: transferId,
      received,
      receivedByScope: [{ scope: bridging(ROUTES.ethHome), amount: received }],
      realizedLossBps: 1,
      txHashes: [],
    });
    // Nothing more to claim: a later operation can only fund from the holding.
    h.treasuries.get("eth-home")!.setBalance(ASSETS.ethNative, 0n, 0n);
    return { op: op!, received };
  }

  it("a pending operation whose reporter turned ERC20-fee is not funded; its funds stay in the holding", async () => {
    const h = harness();
    const { op, received } = await homeRouteBridgeLanded(h);
    h.funding.preflights.set(ROUTES.ethHome, ERC20_FEE);

    const result = await h.loop(ROUTES.ethHome).tick(h.tickCtx());
    expect(result.status).toBe("suspended");
    expect(result.summary).toMatch(/ERC20 feeToken/);
    expect(submissions(h, ":step:fund")).toEqual([]);
    const closed = (await h.ports.journal.getOperation(op.id))!;
    expect([closed.status, closed.step]).toEqual(["failed", "funding-blocked"]);
    expect((closed.stepPayload as unknown as FundingState).fundAmount).toBeNull();
    expect(await holding(h.ports.journal, bridging(ROUTES.ethHome), EXAMPLE_CHAINS.home)).toBe(received);
    expect(h.ports.notifier.bySeverity("critical").map((n) => n.title)).toEqual([
      `Reporter ${ROUTES.ethHome} suspended`,
    ]);

    // Still refused: nothing new starts.
    expect((await h.loop(ROUTES.ethHome).tick(h.tickCtx())).status).toBe("suspended");
    expect(await operations(h, ROUTES.ethHome)).toHaveLength(1);

    // The reporter pays native fees again: a new operation funds exactly the holding.
    h.funding.preflights.delete(ROUTES.ethHome);
    expect((await h.loop(ROUTES.ethHome).tick(h.tickCtx())).status).toBe("acted");
    expect(submissions(h, ":step:fund").map((s) => s.request.value)).toEqual([received]);
    expect(await holding(h.ports.journal, bridging(ROUTES.ethHome), EXAMPLE_CHAINS.home)).toBe(0n);
  });

  it("a pending operation whose preflight is unavailable waits unfunded, then funds once it passes", async () => {
    const h = harness();
    const { op, received } = await homeRouteBridgeLanded(h);
    const passing = h.funding.preflight.bind(h.funding);
    let unavailable = true;
    h.funding.preflight = async (route) => {
      if (unavailable) throw new PreflightUnavailable(route.id, "transfer simulation failed: HTTP request failed.");
      return passing(route);
    };

    for (let i = 0; i < 2; i++) {
      expect((await h.loop(ROUTES.ethHome).tick(h.tickCtx())).status).toBe("deferred");
      expect(submissions(h, ":step:fund")).toEqual([]);
      expect((await h.ports.journal.getOperation(op.id))!.status).toBe("open");
      expect(await holding(h.ports.journal, bridging(ROUTES.ethHome), EXAMPLE_CHAINS.home)).toBe(received);
    }
    expect(h.ports.notifier.bySeverity("critical")).toEqual([]);

    unavailable = false;
    expect((await h.loop(ROUTES.ethHome).tick(h.tickCtx())).status).toBe("acted");
    expect((await h.ports.journal.getOperation(op.id))!.status).toBe("completed");
    expect(submissions(h, ":step:fund").map((s) => s.request.value)).toEqual([received]);
  });

  it("a resume at the funding marker with nothing submitted credits back when the route turned suspended", async () => {
    const h = harness();
    soloEthPair(h, ROUTES.ethForeign);
    h.treasuries.get("eth-home")!.setBalance(ASSETS.ethNative, 0n, parseUnits("1", 18));
    h.ports.executor.script(
      (_, o) => o.idempotencyKey.endsWith(":step:fund"),
      () => {
        throw new Error("crash between the funding marker and the submit");
      }
    );
    expect((await h.loop(ROUTES.ethForeign).tick(h.tickCtx())).status).toBe("failed");
    const [op] = await operations(h, ROUTES.ethForeign);
    expect([op!.status, op!.step]).toEqual(["open", "funding"]);
    const amount = (op!.stepPayload as unknown as FundingState).fundAmount!;
    expect(await holding(h.ports.journal, bridging(ROUTES.ethForeign), EXAMPLE_CHAINS.foreignEth)).toBe(0n);

    h.funding.preflights.set(ROUTES.ethForeign, ERC20_FEE);
    expect((await h.loop(ROUTES.ethForeign).tick(h.tickCtx())).status).toBe("suspended");
    const closed = (await h.ports.journal.getOperation(op!.id))!;
    expect([closed.status, closed.step]).toEqual(["failed", "refunded"]);
    expect(closed.lastError).toMatch(/not submitted: preflight failed/);
    expect(await holding(h.ports.journal, bridging(ROUTES.ethForeign), EXAMPLE_CHAINS.foreignEth)).toBe(amount);
    expect(h.ports.executor.submissions.filter((s) => s.options.idempotencyKey.endsWith(":step:fund"))).toEqual([]);
  });

  it("a funding already submitted before the suspension is resolved, never abandoned", async () => {
    const h = harness();
    soloEthPair(h, ROUTES.ethForeign);
    h.treasuries.get("eth-home")!.setBalance(ASSETS.ethNative, 0n, parseUnits("1", 18));
    h.ports.executor.script((_, o) => o.idempotencyKey.endsWith(":step:fund"), {
      status: "pending",
      hash: "0x0f",
    });
    expect((await h.loop(ROUTES.ethForeign).tick(h.tickCtx())).status).toBe("acted");
    const [op] = await operations(h, ROUTES.ethForeign);
    expect(op!.step).toBe("funding");

    h.funding.preflights.set(ROUTES.ethForeign, ERC20_FEE);
    h.ports.executor.settle(`op:${op!.id}:step:fund`, {
      status: "confirmed",
      hash: "0x0f",
      blockNumber: 7n,
      gasUsed: 21_000n,
    });
    expect((await h.loop(ROUTES.ethForeign).tick(h.tickCtx())).status).toBe("suspended");
    expect((await h.ports.journal.getOperation(op!.id))!.status).toBe("completed");
    expect(submissions(h, ":step:fund")).toHaveLength(1);
  });
});

describe("reporter funding loop, follow-up 009", () => {
  const ABORTED = "aborted: shutdown revertData=none";

  it("an aborted funding retries under a new key: no notification, no suspension, no spent budget", async () => {
    const h = harness();
    soloEthPair(h, ROUTES.ethForeign);
    h.treasuries.get("eth-home")!.setBalance(ASSETS.ethNative, 0n, parseUnits("1", 18));
    let aborts = 3;
    h.ports.executor.script(
      (_, o) => o.idempotencyKey.endsWith(":step:fund") && aborts-- > 0,
      () => ({ status: "failed", error: ABORTED })
    );
    for (let i = 0; i < 3; i++) {
      expect((await h.loop(ROUTES.ethForeign).tick(h.tickCtx())).status).toBe("deferred");
    }
    const keys = submissions(h, ":step:fund").map((s) => s.options.idempotencyKey);
    expect(new Set(keys).size).toBe(3);
    const closed = await operations(h, ROUTES.ethForeign);
    expect(closed.map((op) => [op.status, op.step])).toEqual(Array(3).fill(["failed", "refunded"]));
    expect(closed.every((op) => op.lastError?.startsWith("funding failed: aborted:"))).toBe(true);
    expect(h.ports.notifier.sent).toEqual([]);
    const suspended = await h.ports.journal.observations(`suspended:`);
    expect(suspended.filter((o) => (o.value as { suspended?: boolean }).suspended)).toEqual([]);
    // The amount is back in the holding every time and never withdrawn twice.
    expect(await holding(h.ports.journal, bridging(ROUTES.ethForeign), EXAMPLE_CHAINS.foreignEth)).toBe(
      100n * COST.eth
    );
    expect(submissions(h, ":step:withdraw:")).toHaveLength(1);

    // The fourth attempt is not refused by any budget: it funds the reporter.
    expect((await h.loop(ROUTES.ethForeign).tick(h.tickCtx())).status).toBe("acted");
    const funded = (await operations(h, ROUTES.ethForeign)).filter((op) => op.status === "completed");
    expect(funded).toHaveLength(1);
    expect(submissions(h, ":step:fund")).toHaveLength(4);
    expect(await holding(h.ports.journal, bridging(ROUTES.ethForeign), EXAMPLE_CHAINS.foreignEth)).toBe(0n);
    expect(h.ports.notifier.bySeverity("warning")).toEqual([]);
    expect(h.ports.notifier.bySeverity("critical")).toEqual([]);
  });

  it("a non-aborted failed funding still warns", async () => {
    const h = harness();
    soloEthPair(h, ROUTES.ethForeign);
    h.treasuries.get("eth-home")!.setBalance(ASSETS.ethNative, 0n, parseUnits("1", 18));
    h.ports.executor.script((_, o) => o.idempotencyKey.endsWith(":step:fund"), {
      status: "failed",
      error: "simulation failed revertData=none",
    });
    await h.loop(ROUTES.ethForeign).tick(h.tickCtx());
    expect(h.ports.notifier.bySeverity("warning").map((n) => n.title)).toEqual([
      `Reporter ${ROUTES.ethForeign}: funding failed`,
    ]);
  });

  it("an aborted withdrawal releases its claim and is retried under a new key next tick, silently", async () => {
    const h = harness();
    soloEthPair(h, ROUTES.ethForeign);
    h.treasuries.get("eth-home")!.setBalance(ASSETS.ethNative, 0n, parseUnits("1", 18));
    let aborts = 1;
    h.ports.executor.script(
      (_, o) => o.idempotencyKey.includes(":step:withdraw:") && aborts-- > 0,
      () => ({ status: "failed", error: "aborted: wait budget expired revertData=none" })
    );
    expect((await h.loop(ROUTES.ethForeign).tick(h.tickCtx())).status).toBe("deferred");
    expect(await h.ports.journal.ledger.openClaims(ethClaimKey)).toEqual([]);
    expect((await h.loop(ROUTES.ethForeign).tick(h.tickCtx())).status).toBe("acted");
    const keys = submissions(h, ":step:withdraw:").map((s) => s.options.idempotencyKey);
    expect(new Set(keys).size).toBe(2);
    expect(submissions(h, ":step:fund")).toHaveLength(1);
    expect(h.ports.notifier.sent.filter((n) => n.severity !== "info")).toEqual([]);
    const released = h.ports.logger.entries.filter((e) => e.message.startsWith("bridging withdrawal not executed"));
    expect(released.map((e) => e.level)).toEqual(["info"]);
  });
});

describe("reporter funding loop, follow-up 010", () => {
  const usdc6 = (n: string) => parseUnits(n, 6);
  const need = 81n * COST.eth; // 0.0162 ETH = 40.5 USDC at the scripted rate

  /** The home-chain ETH route 81 messages short, with a large leftover holding on the foreign chain. */
  async function leftover(h: Harness, asset: typeof ASSETS.ethNative, amount: bigint, limit: bigint) {
    soloEthPair(h, ROUTES.ethHome);
    h.funding.balances.set(ROUTES.ethHome, 19n * COST.eth);
    await h.ports.journal.ledger.credit({
      scope: bridging(ROUTES.ethHome),
      chainId: asset.chainId,
      asset: asset.address,
      location: "eoa",
      amount,
      operationId: "earlier-failed-transfer",
      reason: "transfer failed, funds kept",
    });
    // The per-transfer limit: the whole leftover is refused, the need passes.
    h.transfers.onRun(
      (intent) => intent.amount > limit,
      (intent) => ({ status: "deferred", reason: `policy-rejected: ${intent.amount} over the limit ${limit}` })
    );
    h.routeProvider.quotes.unshift({
      match: (request) => request.amount > limit,
      result: (request) => ({
        kind: "rejected",
        violations: [`limit: ${request.amount} over ${limit}`],
        quote: makeQuote(request, { estimatedOutput: usdcToEth(request.amount, request.fromAsset.decimals) }),
      }),
    });
    convertAtQuoteRate(h);
  }

  const scenarios = [
    { name: "same-unit", asset: ASSETS.ethNative, amount: 1000n * COST.eth, limit: 200n * COST.eth, input: need },
    { name: "cross-asset", asset: ASSETS.baseUsdc, amount: usdc6("50000"), limit: usdc6("1000"), input: usdc6("40.5") },
  ];

  for (const scenario of scenarios) {
    it(`${scenario.name}: a large leftover holding with a small need transfers only the need`, async () => {
      const h = harness();
      await leftover(h, scenario.asset, scenario.amount, scenario.limit);
      expect((await h.loop(ROUTES.ethHome).tick(h.tickCtx())).status).toBe("acted");
      const [op] = await operations(h, ROUTES.ethHome);
      expect(op).toEqual(expect.objectContaining({ status: "completed", step: "funded" }));
      expect((op!.payload as unknown as FundingPayload).legs).toEqual([
        expect.objectContaining({
          asset: scenario.asset,
          claimAmount: 0n,
          holdingAmount: scenario.amount,
          transferAmount: scenario.input,
          expectedOutput: need,
        }),
      ]);
      expect(h.transfers.intents.map((i) => [i.amount, i.allocations])).toEqual([
        [scenario.input, [{ scope: bridging(ROUTES.ethHome), amount: scenario.input }]],
      ]);
      expect(submissions(h, ":step:fund").map((s) => s.request.value)).toEqual([need]);
      expect(h.ports.notifier.bySeverity("warning")).toEqual([]);
      // The remainder of the leftover stays untouched for a later operation.
      expect(
        await holding(h.ports.journal, bridging(ROUTES.ethHome), scenario.asset.chainId, scenario.asset.address)
      ).toBe(scenario.amount - scenario.input);
      expect(await holding(h.ports.journal, bridging(ROUTES.ethHome), EXAMPLE_CHAINS.home)).toBe(0n);
    });

    it(`${scenario.name}: a resume over a payload without transferAmount derives the need-sized amount`, async () => {
      const h = harness();
      await leftover(h, scenario.asset, scenario.amount, scenario.limit);
      const plan = await planFunding(h.plannerDeps("eth-home"), h.route(ROUTES.ethHome));
      if (plan.kind !== "fund") throw new Error(`expected a fund plan, got ${plan.kind}`);
      // The format journaled before run 010: no transferAmount, and an expectedOutput of the whole holding.
      const legs = plan.legs.map(({ transferAmount: _, ...leg }) => ({
        ...leg,
        expectedOutput:
          leg.quote === null
            ? leg.holdingAmount + leg.claimAmount
            : (leg.quote.estimatedOutput * (leg.holdingAmount + leg.claimAmount)) / leg.quote.inputAmount,
      }));
      const payload = {
        routeId: ROUTES.ethHome,
        pairId: "eth-home",
        chainId: EXAMPLE_CHAINS.home,
        balance: plan.balance,
        lowWater: plan.thresholds.lowWater,
        target: plan.thresholds.target,
        need: plan.need,
        holdingUsed: plan.holdingUsed,
        expectedTotal: plan.expectedTotal,
        partial: plan.partial,
        shareE18: plan.shareE18,
        legs,
      };
      expect(JSON.stringify(payload, (_, v) => (typeof v === "bigint" ? `${v}` : v))).not.toContain("transferAmount");
      const op = await h.ports.journal.createOperation({
        kind: "reporter-funding",
        description: "journaled before run 010",
        scopes: [bridging(ROUTES.ethHome)],
        pairId: "eth-home",
        routeId: ROUTES.ethHome,
        payload: payload as never,
      });
      expect((await h.loop(ROUTES.ethHome).tick(h.tickCtx())).status).toBe("acted");
      expect((await h.ports.journal.getOperation(op.id))!.status).toBe("completed");
      expect(h.transfers.intents.map((i) => i.amount)).toEqual([scenario.input]);
      expect(submissions(h, ":step:fund").map((s) => s.request.value)).toEqual([need]);
      expect(
        await holding(h.ports.journal, bridging(ROUTES.ethHome), scenario.asset.chainId, scenario.asset.address)
      ).toBe(scenario.amount - scenario.input);
    });
  }
});
