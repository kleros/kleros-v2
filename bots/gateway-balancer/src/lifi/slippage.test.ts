import { describe, expect, it } from "vitest";
import type { AccountingScope, Address, Asset, Hex } from "../domain";
import type { RouteQuote, RouteRequest, TransferIntent, TransferStatus } from "../ports";
import {
  EXAMPLE_ADDRESSES,
  EXAMPLE_CHAINS,
  FAKE_LIFI_DIAMOND,
  FAKE_SIGNER,
  FakePriceOracle,
  FakeRouteProvider,
  exampleConfig,
  fakeHash,
  makeFakePorts,
  makeQuote,
  type FakePorts,
} from "../testing";
import { LifiClient } from "./client";
import { LifiRouteProvider } from "./provider";
import {
  computeBaseline,
  convertAtPrices,
  legMinimumOutput,
  minimumAcceptableOutput,
  normalizeFees,
  withinBudget,
} from "./slippage";
import {
  ASSETS,
  QUOTE_ROUTES,
  SIGNER,
  fixtureFetch,
  mainnetConfig,
  simulateAllowances,
  withRecheck,
} from "./testSupport";
import { LifiTransfers } from "./transfers";

const ETH = 10n ** 18n;
const scope: AccountingScope = { kind: "arbitration", pairId: "eth-home" };
const usdc: Asset = {
  chainId: EXAMPLE_CHAINS.foreignEth,
  address: EXAMPLE_ADDRESSES.usdcOnForeignEth,
  symbol: "USDC",
  decimals: 6,
};
const HOME_USDC: Address = "0x00000000000000000000000000000000000000c5";
const homeUsdc: Asset = { chainId: EXAMPLE_CHAINS.home, address: HOME_USDC, symbol: "USDC", decimals: 6 };
const homeEth: Asset = { chainId: EXAMPLE_CHAINS.home, address: "native", symbol: "ETH", decimals: 18 };
const AMOUNT = 3_000_000_000n; // 3000 USDC = 1 ETH at 3000 USD

function quoteFor(request: RouteRequest, overrides: Partial<RouteQuote>): RouteQuote {
  return makeQuote({ ...request, minimumOutput: undefined }, overrides);
}

/** A bridge-and-swap whose bridge delivers USDC on the home chain (the destination swap did not run). */
async function twoLegSetup(legTwoMinimum: bigint) {
  const ports = makeFakePorts(exampleConfig({ lifi: { pollIntervalSeconds: 30 } }));
  const oracle = new FakePriceOracle().set("ETH", 3000n * ETH).set("USDC", ETH);
  const routes = withRecheck(new FakeRouteProvider());
  // Leg one loses 3 percent, inside the budget on its own.
  routes.onQuote(
    (r) => r.fromChainId === EXAMPLE_CHAINS.foreignEth,
    (r) => ({
      kind: "quote",
      quote: quoteFor(r, {
        estimatedOutput: (97n * ETH) / 100n,
        minimumOutput: (97n * ETH) / 100n,
        // The bridge step delivers USDC on the home chain (a baseline is recorded for it at send).
        raw: { bridgeOutput: { address: HOME_USDC, estimate: null } },
      }),
    })
  );
  routes.onQuote(
    (r) => r.fromChainId === EXAMPLE_CHAINS.home,
    (r) => ({ kind: "quote", quote: quoteFor(r, { estimatedOutput: legTwoMinimum, minimumOutput: legTwoMinimum }) })
  );
  simulateAllowances(ports);
  const transfers = new LifiTransfers({ ports, config: ports.config.lifi, routeProvider: routes, priceOracle: oracle });
  const parent = await ports.journal.createOperation({
    kind: "refill",
    description: "p",
    scopes: [scope],
    payload: null,
  });
  await ports.journal.ledger.credit({
    scope,
    chainId: usdc.chainId,
    asset: usdc.address,
    location: "eoa",
    amount: AMOUNT,
    operationId: parent.id,
    reason: "withdrawn",
  });
  const intent: TransferIntent = {
    parentOperationId: parent.id,
    tag: "withdraw-0",
    fromChainId: usdc.chainId,
    fromAsset: usdc,
    amount: AMOUNT,
    toChainId: EXAMPLE_CHAINS.home,
    toAsset: homeEth,
    allocations: [{ scope, amount: AMOUNT }],
    purpose: "refill",
  };
  return { ports, oracle, routes, transfers, intent };
}

function receipt(ports: FakePorts, hash: Hex) {
  ports.chains.get(EXAMPLE_CHAINS.home)!.receipts.set(hash, {
    hash,
    blockNumber: 1n,
    status: "success",
    gasUsed: 1n,
    effectiveGasPrice: 1n,
    from: FAKE_SIGNER,
    to: FAKE_SIGNER,
  });
}

/** Runs leg one to the delivery of 2910 USDC (97 percent) on the home chain. */
async function bridgeDeliversIntermediate(setup: Awaited<ReturnType<typeof twoLegSetup>>) {
  const { ports, routes, transfers, intent } = setup;
  for (let i = 0; i < 3; i++) await transfers.run(intent);
  const send = ports.executor.submissions.find((s) => s.request.to === FAKE_LIFI_DIAMOND)!;
  const status: TransferStatus = {
    state: "done",
    received: 2_910_000_000n,
    receivedAsset: homeUsdc,
    receivingTxHash: fakeHash("leg-1-received"),
  };
  routes.statuses.set((send.outcome as { hash: Hex }).hash, status);
  receipt(ports, fakeHash("leg-1-received"));
  ports.chains.get(EXAMPLE_CHAINS.home)!.setErc20Balance(HOME_USDC, FAKE_SIGNER, 2_910_000_000n);
  ports.clock.advance(30_000);
  return transfers.run(intent);
}

describe("operation-level loss budget", () => {
  it("defines the baseline at oracle prices and the minimum acceptable output under maxLossBps", async () => {
    const oracle = new FakePriceOracle().set("ETH", 3000n * ETH).set("USDC", ETH);
    const baseline = await computeBaseline(oracle, {}, { amount: AMOUNT, symbol: "USDC", decimals: 6 }, homeEth);
    expect(baseline).toMatchObject({ kind: "baseline", amount: ETH });
    expect(minimumAcceptableOutput(ETH, 500)).toBe((95n * ETH) / 100n);
    // WETH prices as ETH: same symbol, no oracle read needed.
    const same = await computeBaseline(
      new FakePriceOracle(),
      { WETH: "ETH" },
      { amount: 5n, symbol: "WETH", decimals: 18 },
      homeEth
    );
    expect(same).toMatchObject({ kind: "baseline", amount: 5n });
    expect(convertAtPrices(ETH, { decimals: 18, priceE18: 3000n * ETH }, { decimals: 6, priceE18: ETH })).toBe(
      3_000_000_000n
    );
  });

  it("rejects two steps each under 5 percent that lose 6 percent combined", async () => {
    // Leg two quotes 97 percent of leg one's 97 percent: 94.09 percent of the baseline.
    const setup = await twoLegSetup((9409n * ETH) / 10_000n);
    expect(await bridgeDeliversIntermediate(setup)).toMatchObject({ status: "in-progress", step: "requote" });
    const outcome = await setup.transfers.run(setup.intent);
    expect(outcome).toMatchObject({ status: "in-progress", step: expect.stringMatching(/^policy-rejected: budget/) });
    // Nothing is sent for leg two; the intermediate USDC stays in transit, preserved.
    expect(setup.ports.executor.submissions.filter((s) => s.request.chainId === EXAMPLE_CHAINS.home)).toHaveLength(0);
    const [held] = await setup.ports.journal.ledger.holdings({
      scope,
      chainId: EXAMPLE_CHAINS.home,
      location: "in-transit",
    });
    expect(held).toMatchObject({ asset: HOME_USDC, amount: 2_910_000_000n });
    expect(await setup.ports.journal.ledger.holdings({ scope, chainId: usdc.chainId })).toEqual([]);
  });

  it("measures a requote after a partial step against the original baseline, not a fresh one", async () => {
    const setup = await twoLegSetup((955n * ETH) / 1000n);
    await bridgeDeliversIntermediate(setup);
    // ETH falls to 2000 USD: a fresh baseline for 2910 USDC would be 1.455 ETH and reject 0.955 ETH.
    setup.oracle.set("ETH", 2000n * ETH);
    const outcome = await setup.transfers.run(setup.intent);
    expect(outcome).toMatchObject({ status: "in-progress", step: "approve" });
    const legTwo = setup.routes.requests.at(-1)!;
    expect(legTwo).toMatchObject({ fromChainId: EXAMPLE_CHAINS.home, amount: 2_910_000_000n });
    expect(legTwo.minimumOutput).toBe((95n * ETH) / 100n);

    await setup.transfers.run(setup.intent); // approve on the home chain
    await setup.transfers.run(setup.intent); // swap
    const swap = setup.ports.executor.submissions.filter((s) => s.request.to === FAKE_LIFI_DIAMOND).at(-1)!;
    expect(swap.request.chainId).toBe(EXAMPLE_CHAINS.home);
    const swapHash = (swap.outcome as { hash: Hex }).hash;
    setup.routes.statuses.set(swapHash, {
      state: "done",
      received: (955n * ETH) / 1000n,
      receivedAsset: homeEth,
      receivingTxHash: swapHash,
    });
    receipt(setup.ports, swapHash);
    setup.ports.clock.advance(30_000);
    const done = await setup.transfers.run(setup.intent);
    expect(done).toMatchObject({ status: "completed", received: (955n * ETH) / 1000n, realizedLossBps: 450 });
    // Exactly one bridge: the source chain saw one LI.FI send.
    expect(
      setup.ports.executor.submissions.filter(
        (s) => s.request.chainId === usdc.chainId && s.request.to === FAKE_LIFI_DIAMOND
      )
    ).toHaveLength(1);
    const [home] = await setup.ports.journal.ledger.holdings({ scope, chainId: EXAMPLE_CHAINS.home, location: "eoa" });
    expect(home).toMatchObject({ asset: "native", amount: (955n * ETH) / 1000n });
  });

  it("requotes a stale quote before the send against the original baseline", async () => {
    const setup = await twoLegSetup(ETH);
    const { transfers, intent, ports, routes, oracle } = setup;
    await transfers.run(intent); // quote
    await transfers.run(intent); // approve
    ports.clock.advance(121_000);
    oracle.set("USDC", ETH / 2n); // a fresh baseline would halve the minimum
    expect(await transfers.run(intent)).toMatchObject({ status: "in-progress", step: "send" });
    expect(routes.requests).toHaveLength(2);
    expect(routes.requests[1]!.minimumOutput).toBe((95n * ETH) / 100n);
  });

  it("defers the operation when a price is unavailable instead of proceeding", async () => {
    const setup = await twoLegSetup(ETH);
    setup.oracle.setUnavailable("ETH", "stale", "older than 10 minutes");
    expect(await setup.transfers.run(setup.intent)).toEqual({
      status: "deferred",
      reason: "price-unavailable: ETH price stale: older than 10 minutes",
    });
    expect(setup.routes.requests).toHaveLength(0);
    expect(await setup.ports.journal.listOperations({ kind: "transfer" })).toHaveLength(0);
  });

  it("normalizes fees into the output asset before comparing", async () => {
    const oracle = new FakePriceOracle().set("ETH", 3000n * ETH).set("USDC", ETH);
    const fees = await normalizeFees(
      oracle,
      {},
      [
        {
          name: "bridge",
          amount: 30_000_000n,
          included: true,
          token: { address: usdc.address, chainId: usdc.chainId, symbol: "USDC", decimals: 6 },
        },
      ],
      homeEth
    );
    expect(fees).toEqual({ kind: "fees", amount: ETH / 100n, included: ETH / 100n, onTop: 0n }); // 30 USDC = 0.01 ETH
    const legMinimum = legMinimumOutput((95n * ETH) / 100n, 0n);
    expect(withinBudget({ legMinimum, quoteMinimumOutput: (945n * ETH) / 1000n, feesInOutput: 0n })).toBe(false);
    expect(withinBudget({ legMinimum, quoteMinimumOutput: (945n * ETH) / 1000n, feesInOutput: ETH / 100n })).toBe(true);
    // Earlier legs' fees reduce what a later leg must reach.
    expect(legMinimumOutput((95n * ETH) / 100n, ETH / 100n)).toBe((94n * ETH) / 100n);
    const missing = await normalizeFees(
      new FakePriceOracle().set("ETH", ETH),
      {},
      [
        {
          name: "x",
          amount: 1n,
          included: true,
          token: { address: usdc.address, chainId: 1, symbol: "USDC", decimals: 6 },
        },
      ],
      homeEth
    );
    expect(missing.kind).toBe("unavailable");
  });

  it("subtracts fees paid on top (included: false) from the budget instead of adding them", async () => {
    const oracle = new FakePriceOracle().set("ETH", 3000n * ETH).set("USDC", ETH);
    const token = { address: usdc.address, chainId: usdc.chainId, symbol: "USDC", decimals: 6 };
    const fee = (included: boolean) => ({ name: "bridge", amount: 30_000_000n, included, token });
    const inside = await normalizeFees(oracle, {}, [fee(true)], homeEth);
    const onTop = await normalizeFees(oracle, {}, [fee(false)], homeEth);
    expect(inside).toEqual({ kind: "fees", amount: ETH / 100n, included: ETH / 100n, onTop: 0n });
    expect(onTop).toEqual({ kind: "fees", amount: -(ETH / 100n), included: 0n, onTop: ETH / 100n });
    const legMinimum = (95n * ETH) / 100n;
    const quoteMinimumOutput = (955n * ETH) / 1000n;
    // 0.955 ETH out: passes on its own, and with a fee already deducted from the input.
    expect(withinBudget({ legMinimum, quoteMinimumOutput, feesInOutput: 0n })).toBe(true);
    expect(
      withinBudget({ legMinimum, quoteMinimumOutput, feesInOutput: inside.kind === "fees" ? inside.amount : 0n })
    ).toBe(true);
    // The same 0.01 ETH paid on top leaves a net 0.945 ETH: under the 0.95 minimum.
    expect(
      withinBudget({ legMinimum, quoteMinimumOutput, feesInOutput: onTop.kind === "fees" ? onTop.amount : 0n })
    ).toBe(false);
  });

  it("compares a recorded quote's minimum output plus its normalized fees with the budget", async () => {
    const config = mainnetConfig();
    const oracle = new FakePriceOracle().set("ETH", 2700n * ETH).set("USDC", ETH);
    const ports = makeFakePorts(config);
    const provider = new LifiRouteProvider({
      client: new LifiClient({
        fetch: fixtureFetch(QUOTE_ROUTES),
        config: config.lifi,
        chains: config.topology.chains,
      }),
      config: config.lifi,
      priceOracle: oracle,
      ledger: ports.journal.ledger,
      clock: ports.clock,
      signer: SIGNER,
    });
    const request: RouteRequest = {
      fromChainId: 8453,
      fromAsset: ASSETS.baseUsdc,
      toChainId: 42161,
      toAsset: ASSETS.arbEth,
      amount: 100_000_000n,
      sender: SIGNER,
      recipient: SIGNER,
      purpose: "refill",
    };
    const toEth = (units: bigint) => (units * 10n ** 12n) / 2700n;
    const quotedMinimum = 36_718_190_000_000_000n;
    const fees = toEth(250_000n) + toEth(21_095n);
    expect((await provider.quote({ ...request, minimumOutput: quotedMinimum + fees })).kind).toBe("quote");
    const over = await provider.quote({ ...request, minimumOutput: quotedMinimum + fees + 1n });
    expect(over.kind).toBe("rejected");
    if (over.kind === "rejected") expect(over.violations).toEqual([expect.stringMatching(/^budget:/)]);
  });
});
