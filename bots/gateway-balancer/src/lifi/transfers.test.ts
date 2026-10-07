import { decodeFunctionData, erc20Abi } from "viem";
import { describe, expect, it, vi } from "vitest";
import { scopeKey, type AccountingScope, type Address, type Asset, type Hex } from "../domain";
import type { RouteQuote, RouteRequest, TransferIntent, TransferOutcome, TransferStatus } from "../ports";
import { WRAPPED_NATIVE_ABI } from "../gateway/abi/weth";
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
import { simulateAllowances, withRecheck } from "./testSupport";
import { LifiTransfers } from "./transfers";

export const scope: AccountingScope = { kind: "arbitration", pairId: "eth-home" };
export const usdc: Asset = {
  chainId: EXAMPLE_CHAINS.foreignEth,
  address: EXAMPLE_ADDRESSES.usdcOnForeignEth,
  symbol: "USDC",
  decimals: 6,
};
export const homeEth: Asset = { chainId: EXAMPLE_CHAINS.home, address: "native", symbol: "ETH", decimals: 18 };
export const foreignEth: Asset = { chainId: EXAMPLE_CHAINS.foreignEth, address: "native", symbol: "ETH", decimals: 18 };
export const homeWeth: Asset = {
  chainId: EXAMPLE_CHAINS.home,
  address: EXAMPLE_ADDRESSES.wethOnHome,
  symbol: "WETH",
  decimals: 18,
};
export const ETH = 10n ** 18n;
const AMOUNT = 3_000_000_000n; // 3000 USDC: 1 ETH at the baseline prices below
const RECEIVING: Hex = fakeHash("receiving");

/** `makeQuote` stringifies its request, which cannot carry the bigint `minimumOutput`. */
export function quoteFor(request: RouteRequest, overrides: Partial<RouteQuote> = {}): RouteQuote {
  return makeQuote({ ...request, minimumOutput: undefined }, overrides);
}

export function setup(options: { holding?: bigint; quote?: Partial<RouteQuote>; lifi?: Record<string, unknown> } = {}) {
  const ports = makeFakePorts(
    exampleConfig({ lifi: { pollIntervalSeconds: 30, statusTimeoutSeconds: 3600, ...options.lifi } })
  );
  const oracle = new FakePriceOracle().set("ETH", 3000n * ETH).set("USDC", ETH);
  const routes = withRecheck(new FakeRouteProvider());
  routes.onQuote(
    () => true,
    (request) => ({
      kind: "quote",
      quote: quoteFor(request, {
        // The credit is capped at the estimate: the scripted receipts below stay at or under 1 ETH.
        estimatedOutput: ETH,
        minimumOutput: (98n * ETH) / 100n,
        ...options.quote,
      }),
    })
  );
  simulateAllowances(ports);
  const transfers = new LifiTransfers({ ports, config: ports.config.lifi, routeProvider: routes, priceOracle: oracle });
  return { ports, oracle, routes, transfers };
}

export async function parentWithHolding(ports: FakePorts, amount = AMOUNT): Promise<TransferIntent> {
  const parent = await ports.journal.createOperation({
    kind: "refill",
    description: "test parent",
    scopes: [scope],
    pairId: "eth-home",
    payload: null,
  });
  await ports.journal.ledger.credit({
    scope,
    chainId: usdc.chainId,
    asset: usdc.address,
    location: "eoa",
    amount,
    operationId: parent.id,
    reason: "withdrawn",
  });
  return {
    parentOperationId: parent.id,
    tag: "withdraw-0",
    fromChainId: usdc.chainId,
    fromAsset: usdc,
    amount,
    toChainId: homeEth.chainId,
    toAsset: homeEth,
    allocations: [{ scope, amount }],
    purpose: "refill",
  };
}

async function holding(ports: FakePorts, chainId: number, asset: string, location: "eoa" | "in-transit") {
  const [h] = await ports.journal.ledger.holdings({ scope, chainId, asset: asset as Asset["address"], location });
  return h?.amount ?? 0n;
}

function sendHashOf(ports: FakePorts): Hex {
  const send = ports.executor.submissions.find((s) => s.request.to === FAKE_LIFI_DIAMOND);
  if (!send || !("hash" in send.outcome)) throw new Error("no bridge submission");
  return send.outcome.hash as Hex;
}

function done(received: bigint, asset: Asset = homeEth, hash: Hex = RECEIVING): TransferStatus {
  return { state: "done", received, receivedAsset: asset, receivingTxHash: hash };
}

function confirmReceipt(
  ports: FakePorts,
  hash: Hex = RECEIVING,
  status: "success" | "reverted" = "success",
  chainId: number = EXAMPLE_CHAINS.home
) {
  ports.chains.get(chainId)!.receipts.set(hash, {
    hash,
    blockNumber: 10n,
    status,
    gasUsed: 50_000n,
    effectiveGasPrice: 1n,
    from: FAKE_SIGNER,
    to: FAKE_SIGNER,
  });
}

/** Runs until the outcome is no longer `in-progress`, one poll interval apart. */
export async function drive(transfers: LifiTransfers, ports: FakePorts, intent: TransferIntent, max = 20) {
  let outcome: TransferOutcome = await transfers.run(intent);
  for (let i = 0; i < max && outcome.status === "in-progress"; i++) {
    ports.clock.advance(30_000);
    outcome = await transfers.run(intent);
  }
  return outcome;
}

const bridgeSubmissions = (ports: FakePorts) =>
  ports.executor.submissions.filter((s) => s.request.to === FAKE_LIFI_DIAMOND);
const approvals = (ports: FakePorts) => ports.executor.submissions.filter((s) => s.request.to === usdc.address);

describe("transfers step machine", () => {
  it("approves, sends, polls, credits LI.FI's received amount; holdings eoa -> in-transit -> eoa", async () => {
    const { ports, routes, transfers } = setup();
    const home = ports.chains.get(EXAMPLE_CHAINS.home)!;
    home.setNativeBalance(FAKE_SIGNER, ETH / 10n);
    const intent = await parentWithHolding(ports);

    const quoted = await transfers.run(intent);
    expect(quoted).toMatchObject({ status: "in-progress", step: "approve" });
    expect(ports.executor.submissions).toHaveLength(0);
    // The request carried the operation budget: 1 ETH baseline less 500 bps.
    expect(routes.requests[0]!.minimumOutput).toBe((95n * ETH) / 100n);

    expect(await transfers.run(intent)).toMatchObject({ status: "in-progress", step: "send" });
    expect(approvals(ports)).toHaveLength(1);
    const [spender, bound] = decodeFunctionData({ abi: erc20Abi, data: approvals(ports)[0]!.request.data! }).args as [
      string,
      bigint,
    ];
    expect([spender.toLowerCase(), bound]).toEqual([FAKE_LIFI_DIAMOND, AMOUNT]);

    expect(await transfers.run(intent)).toMatchObject({ status: "in-progress", step: "bridging" });
    expect(bridgeSubmissions(ports)).toHaveLength(1);
    expect(await holding(ports, usdc.chainId, usdc.address, "eoa")).toBe(0n);
    expect(await holding(ports, usdc.chainId, usdc.address, "in-transit")).toBe(AMOUNT);
    expect(await ports.journal.ledger.spentSince({ since: new Date(0), category: "transfer" })).toBe(AMOUNT);
    expect((await ports.journal.observations("in-transit:")).length).toBe(1);

    const hash = sendHashOf(ports);
    routes.statuses.set(hash, done((985n * ETH) / 1000n));
    confirmReceipt(ports);
    home.setNativeBalance(FAKE_SIGNER, ETH / 10n + (985n * ETH) / 1000n);
    ports.clock.advance(30_000);
    const outcome = await transfers.run(intent);
    expect(outcome).toMatchObject({
      status: "completed",
      received: (985n * ETH) / 1000n,
      receivedByScope: [{ scope, amount: (985n * ETH) / 1000n }],
      realizedLossBps: 150,
    });
    if (outcome.status === "completed") expect(outcome.txHashes).toContain(hash);
    expect(await holding(ports, usdc.chainId, usdc.address, "in-transit")).toBe(0n);
    expect(await holding(ports, homeEth.chainId, "native", "eoa")).toBe((985n * ETH) / 1000n);
    const [delta] = await ports.journal.observations("transfer-delta:");
    expect(delta!.value).toMatchObject({ credited: (985n * ETH) / 1000n, delta: (985n * ETH) / 1000n, short: false });
    expect(ports.notifier.bySeverity("warning")).toHaveLength(0);

    // Idempotent: the completed outcome again, no new submission, no new credit.
    expect(await transfers.run(intent)).toEqual(outcome);
    expect(ports.executor.submissions).toHaveLength(2);
    expect(await holding(ports, homeEth.chainId, "native", "eoa")).toBe((985n * ETH) / 1000n);
  });

  it("does at most one status poll per run, never sleeps, and keeps the send time in the step payload", async () => {
    const { ports, routes, transfers } = setup();
    const intent = await parentWithHolding(ports);
    for (let i = 0; i < 3; i++) await transfers.run(intent);
    routes.statuses.set(sendHashOf(ports), { state: "pending" });
    const status = vi.spyOn(routes, "status");
    const sleep = vi.spyOn(ports.clock, "sleep");
    const before = ports.clock.now().getTime();

    expect(await transfers.run(intent)).toMatchObject({ status: "in-progress", step: "bridging" });
    expect(status).toHaveBeenCalledTimes(1);
    expect(await transfers.run(intent)).toMatchObject({ status: "in-progress", step: "bridging" });
    expect(status).toHaveBeenCalledTimes(1); // within the poll interval: no second poll
    expect(ports.clock.now().getTime()).toBe(before);
    expect(sleep).not.toHaveBeenCalled();

    const [child] = await ports.journal.listOperations({ kind: "transfer" });
    expect((child!.stepPayload as { sentAt: string }).sentAt).toBe(new Date(before).toISOString());
    ports.clock.advance(30_000);
    await transfers.run(intent);
    expect(status).toHaveBeenCalledTimes(2);
  });

  it("warns on a balance delta short of the credited amount and completes regardless", async () => {
    const { ports, routes, transfers } = setup();
    const home = ports.chains.get(EXAMPLE_CHAINS.home)!;
    home.setNativeBalance(FAKE_SIGNER, ETH);
    const intent = await parentWithHolding(ports);
    for (let i = 0; i < 3; i++) await transfers.run(intent);
    routes.statuses.set(sendHashOf(ports), done(ETH - 1n));
    confirmReceipt(ports);
    home.setNativeBalance(FAKE_SIGNER, ETH + ETH / 2n);
    ports.clock.advance(30_000);
    expect((await transfers.run(intent)).status).toBe("completed");
    expect(await holding(ports, homeEth.chainId, "native", "eoa")).toBe(ETH - 1n);
    expect(ports.notifier.bySeverity("warning").map((n) => n.dedupKey)).toEqual([
      expect.stringMatching(/^transfer-delta:/),
    ]);
  });

  it("serializes two legs to one destination: the second waits, each is credited its own amount once", async () => {
    const { ports, routes, transfers } = setup();
    const home = ports.chains.get(EXAMPLE_CHAINS.home)!;
    const first = await parentWithHolding(ports, AMOUNT);
    const second = await parentWithHolding(ports, AMOUNT);
    for (let i = 0; i < 3; i++) {
      await transfers.run(first);
      await transfers.run(second);
    }
    // The first is bridging; the second waits for its inbound slot with one warning naming the first.
    expect(bridgeSubmissions(ports)).toHaveLength(1);
    const [firstChild] = await ports.journal.listOperations({ kind: "transfer", parentId: first.parentOperationId });
    expect(await transfers.run(second)).toMatchObject({
      status: "in-progress",
      step: `awaiting-inbound-slot: ${firstChild!.id}`,
    });
    const waits = ports.notifier.sent.filter((n) => n.dedupKey?.startsWith("transfer-slot-wait:"));
    expect(waits.length).toBeGreaterThan(0);
    expect(new Set(waits.map((n) => n.dedupKey)).size).toBe(1);
    expect(waits[0]!.body).toContain(firstChild!.id);

    routes.statuses.set(sendHashOf(ports), done(ETH - 10n, homeEth, fakeHash("recv-a")));
    confirmReceipt(ports, fakeHash("recv-a"));
    home.setNativeBalance(FAKE_SIGNER, ETH - 10n);
    ports.clock.advance(30_000);
    expect(await transfers.run(first)).toMatchObject({ status: "completed", received: ETH - 10n });

    // The slot is free: the second sends now (its stale quote is requoted first) and is credited its own amount.
    const outcome = await drive(transfers, ports, second, 4);
    expect(outcome).toMatchObject({ status: "in-progress", step: "bridging" });
    const b = (bridgeSubmissions(ports)[1]!.outcome as { hash: Hex }).hash;
    routes.statuses.set(b, done(ETH - 20n, homeEth, fakeHash("recv-b")));
    confirmReceipt(ports, fakeHash("recv-b"));
    home.setNativeBalance(FAKE_SIGNER, 2n * ETH - 30n);
    ports.clock.advance(30_000);
    expect(await transfers.run(second)).toMatchObject({ status: "completed", received: ETH - 20n });
    expect(await holding(ports, homeEth.chainId, "native", "eoa")).toBe(2n * ETH - 30n);
    expect(await transfers.run(first)).toMatchObject({ status: "completed", received: ETH - 10n });
    expect(await holding(ports, homeEth.chainId, "native", "eoa")).toBe(2n * ETH - 30n);
  });

  it("runs legs to different destinations in parallel, each credited its own amount, never twice", async () => {
    const { ports, routes, transfers } = setup();
    const home = ports.chains.get(EXAMPLE_CHAINS.home)!;
    const native = await parentWithHolding(ports, AMOUNT);
    // A native delivery may arrive as WETH, so WETH on the home chain shares its slot (decisions [L44]): the second
    // leg swaps to the foreign chain's own ETH instead.
    const token = { ...(await parentWithHolding(ports, AMOUNT)), toChainId: foreignEth.chainId, toAsset: foreignEth };
    // The second finds the first's allowance on chain and skips its approval; the first send spends it, so the
    // second approves before its own send.
    for (let i = 0; i < 5; i++) {
      await transfers.run(native);
      await transfers.run(token);
    }
    expect(approvals(ports)).toHaveLength(2);
    const [a, b] = bridgeSubmissions(ports).map((s) => (s.outcome as { hash: Hex }).hash);
    expect(b).toBeDefined();
    routes.statuses.set(a!, done(ETH - 10n, homeEth, fakeHash("recv-a")));
    routes.statuses.set(b!, done(ETH - 20n, foreignEth, fakeHash("recv-b")));
    confirmReceipt(ports, fakeHash("recv-a"));
    confirmReceipt(ports, fakeHash("recv-b"), "success", foreignEth.chainId);
    home.setNativeBalance(FAKE_SIGNER, ETH - 10n);
    ports.chains.get(foreignEth.chainId)!.setNativeBalance(FAKE_SIGNER, ETH - 20n);
    ports.clock.advance(30_000);
    expect(await transfers.run(native)).toMatchObject({ status: "completed", received: ETH - 10n });
    expect(await transfers.run(token)).toMatchObject({ status: "completed", received: ETH - 20n });
    expect(await holding(ports, homeEth.chainId, "native", "eoa")).toBe(ETH - 10n);
    expect(await holding(ports, foreignEth.chainId, "native", "eoa")).toBe(ETH - 20n);
  });

  it("splits the received amount and moves holdings pro-rata per allocation", async () => {
    const { ports, routes, transfers } = setup();
    const other: AccountingScope = { kind: "arbitration", pairId: "usdc-home" };
    const intent = await parentWithHolding(ports, 2_000_000_000n);
    await ports.journal.ledger.credit({
      scope: other,
      chainId: usdc.chainId,
      asset: usdc.address,
      location: "eoa",
      amount: 1_000_000_000n,
      operationId: intent.parentOperationId,
      reason: "test",
    });
    const split = {
      ...intent,
      amount: AMOUNT,
      allocations: [
        { scope, amount: 2_000_000_000n },
        { scope: other, amount: 1_000_000_000n },
      ],
    };
    for (let i = 0; i < 3; i++) await transfers.run(split);
    routes.statuses.set(sendHashOf(ports), done((99n * ETH) / 100n));
    confirmReceipt(ports);
    ports.clock.advance(30_000);
    expect(await transfers.run(split)).toMatchObject({
      status: "completed",
      receivedByScope: [
        { scope, amount: (66n * ETH) / 100n },
        { scope: other, amount: (33n * ETH) / 100n },
      ],
    });
    const [otherHome] = await ports.journal.ledger.holdings({
      scope: other,
      chainId: homeEth.chainId,
      location: "eoa",
    });
    expect(otherHome!.amount).toBe((33n * ETH) / 100n);
    expect(await holding(ports, usdc.chainId, usdc.address, "eoa")).toBe(0n);
  });

  it("unwraps a wrapped delivery before crediting native ETH", async () => {
    const { ports, routes, transfers } = setup({ quote: { deliversWrapped: true, toAsset: homeWeth } });
    const intent = await parentWithHolding(ports);
    for (let i = 0; i < 3; i++) await transfers.run(intent);
    routes.statuses.set(sendHashOf(ports), done(ETH, homeWeth));
    confirmReceipt(ports);
    ports.chains.get(EXAMPLE_CHAINS.home)!.setErc20Balance(homeWeth.address as Address, FAKE_SIGNER, ETH);
    ports.clock.advance(30_000);
    expect(await transfers.run(intent)).toMatchObject({ status: "in-progress", step: "unwrap" });
    expect(await holding(ports, homeEth.chainId, "native", "eoa")).toBe(0n);
    const outcome = await transfers.run(intent);
    expect(outcome).toMatchObject({ status: "completed", received: ETH });
    const unwrap = ports.executor.submissions.at(-1)!;
    expect(unwrap.request).toMatchObject({ chainId: EXAMPLE_CHAINS.home, to: EXAMPLE_ADDRESSES.wethOnHome, value: 0n });
    expect(decodeFunctionData({ abi: WRAPPED_NATIVE_ABI, data: unwrap.request.data! }).args).toEqual([ETH]);
    expect(await holding(ports, homeEth.chainId, "native", "eoa")).toBe(ETH);
    expect(await holding(ports, homeEth.chainId, EXAMPLE_ADDRESSES.wethOnHome, "eoa")).toBe(0n);
  });

  it("ends in attention when the status stays unknown past the timeout, and never bridges again", async () => {
    const { ports, transfers } = setup();
    const intent = await parentWithHolding(ports);
    for (let i = 0; i < 3; i++) await transfers.run(intent);
    // No status scripted: the fake answers `unknown`.
    expect(await transfers.run(intent)).toMatchObject({ status: "in-progress" });
    ports.clock.advance(3_601_000);
    expect(await transfers.run(intent)).toMatchObject({
      status: "attention",
      reason: expect.stringMatching(/unknown past the timeout/),
    });
    expect(await transfers.run(intent)).toMatchObject({ status: "attention" });
    expect(bridgeSubmissions(ports)).toHaveLength(1);
    expect(await holding(ports, usdc.chainId, usdc.address, "in-transit")).toBe(AMOUNT);
  });

  it("keeps polling a pending transfer past the timeout with a single warning", async () => {
    const { ports, routes, transfers } = setup();
    const intent = await parentWithHolding(ports);
    for (let i = 0; i < 3; i++) await transfers.run(intent);
    routes.statuses.set(sendHashOf(ports), { state: "pending" });
    ports.clock.advance(3_601_000);
    expect((await transfers.run(intent)).status).toBe("in-progress");
    ports.clock.advance(30_000);
    expect((await transfers.run(intent)).status).toBe("in-progress");
    expect(ports.notifier.bySeverity("warning")).toHaveLength(1);
  });

  it("ends in attention, not completed, for a receipt under the minimum output", async () => {
    const { ports, routes, transfers } = setup();
    const intent = await parentWithHolding(ports);
    for (let i = 0; i < 3; i++) await transfers.run(intent);
    routes.statuses.set(sendHashOf(ports), done((97n * ETH) / 100n));
    confirmReceipt(ports);
    ports.clock.advance(30_000);
    expect(await transfers.run(intent)).toMatchObject({
      status: "attention",
      reason: expect.stringMatching(/under the quoted minimum/),
    });
    expect(await holding(ports, homeEth.chainId, "native", "eoa")).toBe(0n);
  });

  it("waits for the receiving transaction and refuses a reverted one or an unexpected asset", async () => {
    const { ports, routes, transfers } = setup();
    const intent = await parentWithHolding(ports);
    for (let i = 0; i < 3; i++) await transfers.run(intent);
    routes.statuses.set(sendHashOf(ports), done(ETH));
    ports.clock.advance(30_000);
    expect((await transfers.run(intent)).status).toBe("in-progress"); // receipt not visible yet
    confirmReceipt(ports, RECEIVING, "reverted");
    ports.clock.advance(30_000);
    expect(await transfers.run(intent)).toMatchObject({
      status: "attention",
      reason: expect.stringMatching(/reverted/),
    });

    const second = setup();
    const intent2 = await parentWithHolding(second.ports);
    for (let i = 0; i < 3; i++) await second.transfers.run(intent2);
    second.routes.statuses.set(sendHashOf(second.ports), done(ETH, { ...usdc }));
    second.ports.clock.advance(30_000);
    expect(await second.transfers.run(intent2)).toMatchObject({
      status: "attention",
      reason: expect.stringMatching(/unexpected asset/),
    });
  });

  it("credits a failed (never signed) send back and retries under a new key", async () => {
    const { ports, transfers } = setup();
    let failures = 1;
    ports.executor.script((request) => request.to === FAKE_LIFI_DIAMOND && failures-- > 0, {
      status: "failed",
      error: "simulation reverted revertData=none",
    });
    const intent = await parentWithHolding(ports);
    await transfers.run(intent);
    await transfers.run(intent);
    expect(await transfers.run(intent)).toMatchObject({
      status: "in-progress",
      step: expect.stringMatching(/send failed/),
    });
    expect(await holding(ports, usdc.chainId, usdc.address, "eoa")).toBe(AMOUNT);
    expect(await holding(ports, usdc.chainId, usdc.address, "in-transit")).toBe(0n);
    expect(await transfers.run(intent)).toMatchObject({ status: "in-progress", step: "bridging" });
    expect(bridgeSubmissions(ports).map((s) => s.options.idempotencyKey)).toEqual([
      expect.stringMatching(/:step:send-0$/),
      expect.stringMatching(/:step:send-0:1$/),
    ]);
    expect(await holding(ports, usdc.chainId, usdc.address, "in-transit")).toBe(AMOUNT);
  });

  it("goes to attention on a replaced or reverted bridge transaction", async () => {
    const { ports, transfers } = setup();
    ports.executor.script((r) => r.to === FAKE_LIFI_DIAMOND, {
      status: "replaced",
      hash: fakeHash("x"),
      replacedByHash: null,
    });
    const intent = await parentWithHolding(ports);
    expect((await drive(transfers, ports, intent)).status).toBe("attention");
    expect(bridgeSubmissions(ports)).toHaveLength(1);
  });

  it("defers with exactly the five reason codes of decisions [L20]", async () => {
    const { ports, routes, oracle, transfers } = setup();
    const intent = await parentWithHolding(ports);
    const reasons: string[] = [];
    const defer = async (i: TransferIntent) => {
      const outcome = await transfers.run(i);
      if (outcome.status !== "deferred") throw new Error(`expected deferred, got ${outcome.status}`);
      reasons.push(outcome.reason);
    };
    await defer({ ...intent, allocations: [{ scope, amount: AMOUNT - 1n }] });
    oracle.setUnavailable("ETH", "stale", "older than 10 minutes");
    await defer(intent);
    oracle.set("ETH", 3000n * ETH);
    await defer({ ...intent, amount: AMOUNT * 2n, allocations: [{ scope, amount: AMOUNT * 2n }] });
    routes.quotes.unshift({ match: () => true, result: { kind: "no-route", reason: "1002" } });
    await defer(intent);
    routes.quotes[0] = { match: () => true, result: { kind: "rejected", violations: ["tool: x is not allowlisted"] } };
    await defer(intent);
    expect(reasons.map((r) => r.slice(0, r.indexOf(":") + 1))).toEqual([
      "allocations-mismatch:",
      "price-unavailable:",
      "insufficient-holding:",
      "no-route:",
      "policy-rejected:",
    ]);
    for (const reason of reasons) expect(reason).toMatch(/^[a-z-]+: \S/);
    expect(await ports.journal.listOperations({ kind: "transfer" })).toHaveLength(0);
  });

  it("reads the on-chain allowance: skips an approval it covers, re-approves under a new key once spent", async () => {
    const { ports, transfers } = setup();
    const first = await parentWithHolding(ports);
    const second = { ...(await parentWithHolding(ports)), toChainId: foreignEth.chainId, toAsset: foreignEth };
    const reads = vi.spyOn(ports.chains.get(usdc.chainId)!, "readContract");
    expect(await transfers.run(first)).toMatchObject({ step: "approve" });
    expect(await transfers.run(first)).toMatchObject({ step: "send" });
    expect(approvals(ports)).toHaveLength(1);
    // The second operation's quote: the allowance on chain already covers it, so it signs no approval.
    expect(await transfers.run(second)).toMatchObject({ step: "send" });
    expect(await transfers.run(second)).toMatchObject({ step: "bridging" });
    expect(approvals(ports)).toHaveLength(1);
    expect(reads.mock.calls.some(([call]) => call.functionName === "allowance")).toBe(true);
    // That send spent the allowance: the first approves again, under the next attempt's key, then sends.
    expect(await transfers.run(first)).toMatchObject({ step: "approve" });
    expect(await transfers.run(first)).toMatchObject({ step: "send" });
    expect(await transfers.run(first)).toMatchObject({ step: "bridging" });
    expect(approvals(ports).map((a) => a.options.idempotencyKey)).toEqual([
      expect.stringMatching(/:step:approve-0-quote-[0-9a-f]+$/),
      expect.stringMatching(/:step:approve-0-quote-[0-9a-f]+:1$/),
    ]);
    expect(bridgeSubmissions(ports)).toHaveLength(2);
  });

  it("re-checks the daily limit when a cached quote is sent, counting other operations' sends", async () => {
    // 3000 USDC per transfer, 4000 per day: two transfers quoted before either is sent cannot both go.
    const limits = [{ chainId: usdc.chainId, asset: usdc.address, decimals: 6, perTransfer: "3000", daily: "4000" }];
    const { ports, transfers } = setup({ lifi: { limits } });
    const first = await parentWithHolding(ports);
    // Another destination chain, so the inbound slot of the first does not hold the second back.
    const second = { ...(await parentWithHolding(ports)), toChainId: foreignEth.chainId, toAsset: foreignEth };
    await transfers.run(first);
    await transfers.run(second);
    expect(await transfers.run(first)).toMatchObject({ status: "in-progress", step: "send" });
    expect(await transfers.run(second)).toMatchObject({ status: "in-progress", step: "send" });
    expect(await transfers.run(first)).toMatchObject({ status: "in-progress", step: "bridging" });
    // The first send spent the shared USDC allowance: the second re-approves, then meets the daily limit.
    expect(await transfers.run(second)).toMatchObject({ status: "in-progress", step: "approve" });
    expect(await transfers.run(second)).toMatchObject({ status: "in-progress", step: "send" });
    expect(await transfers.run(second)).toMatchObject({
      status: "in-progress",
      step: expect.stringMatching(/^policy-rejected: daily-limit: 3000000000 spent in 24h plus 3000000000 exceeds/),
    });
    expect(bridgeSubmissions(ports)).toHaveLength(1);
    expect(await holding(ports, usdc.chainId, usdc.address, "eoa")).toBe(AMOUNT); // the second's still unmoved
    // Once the window rolls past the first send, the second requotes (its quote is stale) and goes.
    ports.clock.advance(24 * 3_600_000 + 1);
    await drive(transfers, ports, second, 3);
    expect(bridgeSubmissions(ports)).toHaveLength(2);
    expect(await ports.journal.ledger.spentSince({ since: new Date(0), category: "transfer" })).toBe(2n * AMOUNT);
  });

  it("records the spend once per leg inside the send bracket: a crash or a failed send never adds a row", async () => {
    const { ports, transfers } = setup();
    let failures = 1;
    ports.executor.script((request) => request.to === FAKE_LIFI_DIAMOND && failures-- > 0, {
      status: "failed",
      error: "simulation reverted revertData=none",
    });
    const intent = await parentWithHolding(ports);
    await transfers.run(intent);
    await transfers.run(intent);
    // The spend is written before the submit (so another operation's send sees it) and before the step marker.
    const record = vi.spyOn(ports.journal.ledger, "recordSpend");
    expect(await transfers.run(intent)).toMatchObject({ step: expect.stringMatching(/send failed/) });
    expect(await transfers.run(intent)).toMatchObject({ step: "bridging" });
    expect(record).toHaveBeenCalledTimes(1);
    expect(await ports.journal.ledger.spentSince({ since: new Date(0), category: "transfer" })).toBe(AMOUNT);

    // A crash between the spend row and the `send:submit` marker: the resume is `attention`, no second row.
    const crashed = setup();
    const intent2 = await parentWithHolding(crashed.ports);
    await crashed.transfers.run(intent2);
    await crashed.transfers.run(intent2);
    const update = crashed.ports.journal.updateOperation.bind(crashed.ports.journal);
    crashed.ports.journal.updateOperation = async (id, change) => {
      if (change.step === "send:submit") throw new Error("simulated crash");
      return update(id, change);
    };
    expect(await crashed.transfers.run(intent2)).toMatchObject({
      step: expect.stringMatching(/^error: simulated crash/),
    });
    crashed.ports.journal.updateOperation = update;
    expect(await crashed.transfers.run(intent2)).toMatchObject({
      status: "attention",
      reason: expect.stringMatching(/ledger bracket "send:debiting"/),
    });
    expect(await crashed.ports.journal.ledger.spentSince({ since: new Date(0), category: "transfer" })).toBe(AMOUNT);
    expect(bridgeSubmissions(crashed.ports)).toHaveLength(0);
  });

  it("caps the credit at the quote's estimated output and warns when LI.FI reports more", async () => {
    const { ports, routes, transfers } = setup(); // estimate 1 ETH
    const intent = await parentWithHolding(ports);
    await drive(transfers, ports, intent, 3);
    routes.statuses.set(sendHashOf(ports), done(ETH * 1000n)); // over-reported (a 1e12 scaling slip, say)
    confirmReceipt(ports);
    const outcome = await drive(transfers, ports, intent);
    expect(outcome).toMatchObject({ status: "completed", received: ETH, receivedByScope: [{ scope, amount: ETH }] });
    expect(await holding(ports, homeEth.chainId, "native", "eoa")).toBe(ETH);
    const warning = ports.notifier.sent.find((n) => n.dedupKey?.startsWith("transfer-over-reported:"));
    expect(warning).toMatchObject({ severity: "warning" });
    expect(warning?.body).toContain(`reports ${ETH * 1000n}`);
  });

  it("checks an unsigned leg at send even when its own spend row aged out of the window", async () => {
    const limits = [{ chainId: usdc.chainId, asset: usdc.address, decimals: 6, perTransfer: "3000", daily: "4000" }];
    const { ports, transfers } = setup({ lifi: { limits } });
    let failures = 1;
    ports.executor.script((request) => request.to === FAKE_LIFI_DIAMOND && failures-- > 0, {
      status: "failed",
      error: "simulation reverted revertData=none",
    });
    const intent = await parentWithHolding(ports);
    await transfers.run(intent); // quote
    await transfers.run(intent); // approve
    expect(await transfers.run(intent)).toMatchObject({ step: expect.stringMatching(/send failed/) });
    // The leg's row (written at the failed send) ages out; another operation spends 3000 inside the new window.
    ports.clock.advance(25 * 3_600_000);
    await ports.journal.ledger.recordSpend({
      chainId: usdc.chainId,
      asset: usdc.address,
      category: "transfer",
      amount: AMOUNT,
      operationId: "other-op",
      at: ports.clock.now(),
    });
    expect(await transfers.run(intent)).toMatchObject({ step: "send" }); // stale quote: requoted
    expect(await transfers.run(intent)).toMatchObject({
      status: "in-progress",
      step: expect.stringMatching(/^policy-rejected: daily-limit: 3000000000 spent in 24h plus 3000000000 exceeds/),
    });
    expect(bridgeSubmissions(ports)).toHaveLength(1); // only the failed, never-signed attempt
  });

  it("gives a retry whose own row aged out a fresh row inside the window", async () => {
    const { ports, transfers } = setup();
    let failures = 1;
    ports.executor.script((request) => request.to === FAKE_LIFI_DIAMOND && failures-- > 0, {
      status: "failed",
      error: "simulation reverted revertData=none",
    });
    const intent = await parentWithHolding(ports);
    await transfers.run(intent);
    await transfers.run(intent);
    await transfers.run(intent); // failed send: one row
    ports.clock.advance(25 * 3_600_000);
    await transfers.run(intent); // requote
    expect(await transfers.run(intent)).toMatchObject({ step: "bridging" });
    const since = new Date(ports.clock.now().getTime() - 24 * 3_600_000);
    expect(await ports.journal.ledger.spentSince({ since, category: "transfer" })).toBe(AMOUNT);
  });

  it("requotes a stale quote at a send:submit resume with nothing submitted, never with a record", async () => {
    const { ports, routes, transfers } = setup();
    const intent = await parentWithHolding(ports);
    await transfers.run(intent); // quote
    await transfers.run(intent); // approve
    // A crash after the `send:submit` marker, before the executor recorded anything.
    const spy = vi.spyOn(ports.executor, "submit").mockImplementationOnce(async () => {
      throw new Error("simulated crash");
    });
    expect(await transfers.run(intent)).toMatchObject({ step: expect.stringMatching(/^error: simulated crash/) });
    spy.mockRestore();
    expect((await ports.journal.listOperations({ kind: "transfer" }))[0]!.step).toBe("send:submit");
    const quotes = routes.requests.length;
    ports.clock.advance(121_000);
    expect(await transfers.run(intent)).toMatchObject({ status: "in-progress", step: "send" });
    expect(routes.requests).toHaveLength(quotes + 1);
    expect(await transfers.run(intent)).toMatchObject({ status: "in-progress", step: "bridging" });
    expect(bridgeSubmissions(ports)).toHaveLength(1);
    expect(await holding(ports, usdc.chainId, usdc.address, "in-transit")).toBe(AMOUNT);
    expect(await ports.journal.ledger.spentSince({ since: new Date(0), category: "transfer" })).toBe(AMOUNT);

    // A recorded (pending) send is resolved under its key however old the quote is.
    const other = setup();
    other.ports.executor.script((r) => r.to === FAKE_LIFI_DIAMOND, { status: "pending", hash: fakeHash("p") });
    const intent2 = await parentWithHolding(other.ports);
    await other.transfers.run(intent2);
    await other.transfers.run(intent2);
    expect(await other.transfers.run(intent2)).toMatchObject({ step: "send:submit" });
    const before = other.routes.requests.length;
    other.ports.clock.advance(3_600_000);
    expect(await other.transfers.run(intent2)).toMatchObject({ step: "send:submit" });
    expect(other.routes.requests).toHaveLength(before);
    expect(bridgeSubmissions(other.ports)).toHaveLength(1);
  });

  it("credits a failed send back only when the journal holds no signed transaction for it", async () => {
    const { ports, transfers } = setup();
    ports.executor.script((r) => r.to === FAKE_LIFI_DIAMOND, { status: "failed", error: "inconsistent" });
    const submit = ports.executor.submit.bind(ports.executor);
    vi.spyOn(ports.executor, "submit").mockImplementation(async (request, options) => {
      const outcome = await submit(request, options);
      // An executor bug: a `failed` answer for a record that carries signed bytes.
      if (request.to === FAKE_LIFI_DIAMOND) {
        await ports.journal.updateTransaction(options.idempotencyKey, { signedRaw: "0x02" });
      }
      return outcome;
    });
    const intent = await parentWithHolding(ports);
    await transfers.run(intent);
    await transfers.run(intent);
    expect(await transfers.run(intent)).toMatchObject({
      status: "attention",
      reason: expect.stringMatching(/record under .* is failed with a signed transaction; the funds stay in transit/),
    });
    expect(await holding(ports, usdc.chainId, usdc.address, "in-transit")).toBe(AMOUNT);
    expect(await holding(ports, usdc.chainId, usdc.address, "eoa")).toBe(0n);
  });

  it("checks the holding before the price, so a lost credit is insufficient-holding: (decisions [L25])", async () => {
    const { ports, oracle, transfers } = setup();
    // The credit after a crash is one unit short of the intent.
    const short = await parentWithHolding(ports, AMOUNT - 1n);
    const intent = { ...short, amount: AMOUNT, allocations: [{ scope, amount: AMOUNT }] };
    oracle.setUnavailable("ETH", "stale", "older than 10 minutes");
    const outcome = await transfers.run(intent);
    expect(outcome).toMatchObject({ status: "deferred", reason: expect.stringMatching(/^insufficient-holding: /) });
    const priceReads = vi.spyOn(oracle, "price");
    await transfers.run(intent);
    expect(priceReads).not.toHaveBeenCalled();
  });

  it("credits only once the receiving transaction is the destination chain's confirmations deep", async () => {
    const { ports, routes, transfers } = setup();
    const home = ports.chains.get(EXAMPLE_CHAINS.home)!;
    const depth = ports.config.topology.chains.find((c) => c.id === EXAMPLE_CHAINS.home)!.confirmations;
    expect(depth).toBeGreaterThan(1);
    const intent = await parentWithHolding(ports);
    for (let i = 0; i < 3; i++) await transfers.run(intent);
    routes.statuses.set(sendHashOf(ports), done(ETH));
    confirmReceipt(ports);
    home.blockNumber = 10n + BigInt(depth) - 2n; // one block short
    ports.clock.advance(30_000);
    expect(await transfers.run(intent)).toMatchObject({ status: "in-progress", step: "bridging" });
    expect(await holding(ports, homeEth.chainId, "native", "eoa")).toBe(0n);
    home.blockNumber += 1n;
    ports.clock.advance(30_000);
    expect(await transfers.run(intent)).toMatchObject({ status: "completed", received: ETH });
    expect(await holding(ports, homeEth.chainId, "native", "eoa")).toBe(ETH);
  });

  it("nets the transfer's own gas on the destination chain out of the transfer-delta observation", async () => {
    const { ports, routes, transfers } = setup({ quote: { deliversWrapped: true, toAsset: homeWeth } });
    const home = ports.chains.get(EXAMPLE_CHAINS.home)!;
    home.setNativeBalance(FAKE_SIGNER, ETH);
    const intent = await parentWithHolding(ports);
    for (let i = 0; i < 3; i++) await transfers.run(intent);
    routes.statuses.set(sendHashOf(ports), done(ETH, homeWeth));
    confirmReceipt(ports);
    home.setErc20Balance(homeWeth.address as Address, FAKE_SIGNER, ETH);
    ports.clock.advance(30_000);
    expect(await transfers.run(intent)).toMatchObject({ status: "in-progress", step: "unwrap" });
    // The unwrap costs 40_000 gas at 2 wei on the home chain; the EOA ends with 1 ETH more, less that gas.
    const [child] = await ports.journal.listOperations({ kind: "transfer" });
    const unwrapHash = fakeHash(`op:${child!.id}:step:unwrap`);
    home.receipts.set(unwrapHash, {
      hash: unwrapHash,
      blockNumber: 11n,
      status: "success",
      gasUsed: 40_000n,
      effectiveGasPrice: 2n,
      from: FAKE_SIGNER,
      to: EXAMPLE_ADDRESSES.wethOnHome,
    });
    home.setNativeBalance(FAKE_SIGNER, 2n * ETH - 80_000n);
    expect(await transfers.run(intent)).toMatchObject({ status: "completed", received: ETH });
    const [delta] = await ports.journal.observations(`transfer-delta:${child!.id}`);
    expect(delta!.value).toMatchObject({ credited: ETH, delta: ETH, gas: 80_000n, short: false });
    expect(ports.notifier.bySeverity("warning")).toHaveLength(0);
  });

  it("defers without creating anything when there is no route, a policy rejection or too little holding", async () => {
    const { ports, routes, transfers } = setup();
    const intent = await parentWithHolding(ports);
    routes.quotes.unshift({ match: () => true, result: { kind: "no-route", reason: "1002" } });
    expect(await transfers.run(intent)).toEqual({ status: "deferred", reason: "no-route: 1002" });
    routes.quotes[0] = { match: () => true, result: { kind: "rejected", violations: ["tool: x is not allowlisted"] } };
    expect(await transfers.run(intent)).toEqual({
      status: "deferred",
      reason: "policy-rejected: tool: x is not allowlisted",
    });
    routes.quotes.shift();
    expect(
      (await transfers.run({ ...intent, amount: AMOUNT * 2n, allocations: [{ scope, amount: AMOUNT * 2n }] })).status
    ).toBe("deferred");
    expect(await ports.journal.listOperations({ kind: "transfer" })).toHaveLength(0);
  });

  it("returns attention for a child reconciliation left in attention, and creates no new child", async () => {
    const { ports, transfers } = setup();
    const intent = await parentWithHolding(ports);
    for (let i = 0; i < 3; i++) await transfers.run(intent);
    const [child] = await ports.journal.listOperations({ kind: "transfer" });
    await ports.journal.updateOperation(child!.id, {
      status: "attention",
      lastError: "reconcile: unknown transaction",
    });
    const restarted = setup();
    const again = new LifiTransfers({
      ports,
      config: ports.config.lifi,
      routeProvider: restarted.routes,
      priceOracle: restarted.oracle,
    });
    expect(await again.run(intent)).toEqual({
      status: "attention",
      operationId: child!.id,
      reason: "reconcile: unknown transaction",
    });
    expect(await ports.journal.listOperations({ kind: "transfer" })).toHaveLength(1);
    expect(bridgeSubmissions(ports)).toHaveLength(1);
  });

  it("goes to attention when it resumes at a ledger bracket marker", async () => {
    const { ports, transfers } = setup();
    const intent = await parentWithHolding(ports);
    await transfers.run(intent);
    const [child] = await ports.journal.listOperations({ kind: "transfer" });
    await ports.journal.updateOperation(child!.id, { step: "send:debiting" });
    expect(await transfers.run(intent)).toMatchObject({
      status: "attention",
      reason: expect.stringMatching(/ledger bracket/),
    });
  });
});

describe("verified credit (decisions [L39])", () => {
  const homeUsdc: Asset = {
    chainId: EXAMPLE_CHAINS.home,
    address: "0x00000000000000000000000000000000000000c9",
    symbol: "USDC",
    decimals: 6,
  };
  const weth = homeWeth.address as Address;
  const unverified = (ports: FakePorts) =>
    ports.notifier.sent.filter((n) => n.dedupKey?.startsWith("transfer-unverified:"));

  it("credits a WETH delivery when the WETH balance rises, against the WETH baseline recorded at send", async () => {
    const { ports, routes, transfers } = setup({ quote: { deliversWrapped: true, toAsset: homeWeth } });
    const home = ports.chains.get(EXAMPLE_CHAINS.home)!;
    home.setErc20Balance(weth, FAKE_SIGNER, 5n); // some WETH dust before the send
    home.setNativeBalance(FAKE_SIGNER, 7n * ETH);
    const intent = await parentWithHolding(ports);
    for (let i = 0; i < 3; i++) await transfers.run(intent);
    const [child] = await ports.journal.listOperations({ kind: "transfer" });
    expect((child!.stepPayload as { baselines: unknown }).baselines).toEqual([
      { asset: "native", amount: 7n * ETH },
      { asset: weth.toLowerCase(), amount: 5n },
    ]);
    routes.statuses.set(sendHashOf(ports), done(ETH, homeWeth));
    confirmReceipt(ports);
    home.setErc20Balance(weth, FAKE_SIGNER, ETH + 5n);
    ports.clock.advance(30_000);
    expect(await transfers.run(intent)).toMatchObject({ status: "in-progress", step: "unwrap" });
    expect(await transfers.run(intent)).toMatchObject({ status: "completed", received: ETH });
    expect(await holding(ports, homeEth.chainId, "native", "eoa")).toBe(ETH);
    expect(unverified(ports)).toHaveLength(0);
  });

  it("credits nothing for a WETH delivery when only the native balance rises, and ends in attention", async () => {
    const { ports, routes, transfers } = setup({
      quote: { deliversWrapped: true, toAsset: homeWeth },
      lifi: { creditCheckMaxTicks: 2 },
    });
    const home = ports.chains.get(EXAMPLE_CHAINS.home)!;
    const intent = await parentWithHolding(ports);
    for (let i = 0; i < 3; i++) await transfers.run(intent);
    routes.statuses.set(sendHashOf(ports), done(ETH, homeWeth));
    confirmReceipt(ports);
    home.setNativeBalance(FAKE_SIGNER, ETH); // the native balance rises, the WETH balance does not
    ports.clock.advance(30_000);
    expect(await transfers.run(intent)).toMatchObject({
      status: "in-progress",
      step: "bridging: delivery not verified",
    });
    expect(unverified(ports)).toHaveLength(1);
    expect(unverified(ports)[0]!.body).toMatch(/the WETH balance rose by 0; nothing is credited/);
    ports.clock.advance(30_000);
    expect(await transfers.run(intent)).toMatchObject({
      status: "attention",
      reason: expect.stringMatching(/^unverified delivery: .* \(2 checks\)$/),
    });
    expect(await holding(ports, homeEth.chainId, "native", "eoa")).toBe(0n);
    expect(await holding(ports, homeEth.chainId, weth, "eoa")).toBe(0n);
    expect(await holding(ports, usdc.chainId, usdc.address, "in-transit")).toBe(AMOUNT);
    expect(ports.executor.submissions.filter((s) => s.request.to === weth)).toHaveLength(0); // no unwrap
  });

  it("ends an ERC20 leg in attention after the age limit, crediting nothing, also without a baseline", async () => {
    const { ports, routes, transfers } = setup({ lifi: { creditCheckMaxAgeSeconds: 60 } });
    const home = ports.chains.get(EXAMPLE_CHAINS.home)!;
    const intent = { ...(await parentWithHolding(ports)), toAsset: homeWeth };
    for (let i = 0; i < 3; i++) await transfers.run(intent);
    // The baseline read failed at send: the delivery cannot be verified at all.
    const [child] = await ports.journal.listOperations({ kind: "transfer" });
    const state = child!.stepPayload as { baselines: { asset: string; amount: bigint | null }[] };
    await ports.journal.updateOperation(child!.id, {
      stepPayload: { ...state, baselines: state.baselines.map((b) => ({ ...b, amount: null })) } as never,
    });
    routes.statuses.set(sendHashOf(ports), done(ETH, homeWeth));
    confirmReceipt(ports);
    home.setErc20Balance(weth, FAKE_SIGNER, ETH);
    ports.clock.advance(30_000);
    expect((await transfers.run(intent)).status).toBe("in-progress");
    expect(unverified(ports)[0]!.body).toMatch(/no WETH balance was recorded at send/);
    ports.clock.advance(61_000);
    expect(await transfers.run(intent)).toMatchObject({ status: "attention" });
    expect(await holding(ports, homeEth.chainId, weth, "eoa")).toBe(0n);
  });

  it("credits a native leg the capped amount and only warns on a short balance delta", async () => {
    const { ports, routes, transfers } = setup(); // estimate 1 ETH
    const home = ports.chains.get(EXAMPLE_CHAINS.home)!;
    const intent = await parentWithHolding(ports);
    for (let i = 0; i < 3; i++) await transfers.run(intent);
    routes.statuses.set(sendHashOf(ports), done(2n * ETH));
    confirmReceipt(ports);
    home.setNativeBalance(FAKE_SIGNER, ETH / 2n);
    ports.clock.advance(30_000);
    expect(await transfers.run(intent)).toMatchObject({ status: "completed", received: ETH });
    expect(await holding(ports, homeEth.chainId, "native", "eoa")).toBe(ETH);
    expect(ports.notifier.bySeverity("warning").map((n) => n.dedupKey!.split(":")[0])).toEqual([
      "transfer-over-reported",
      "transfer-delta",
    ]);
  });

  it("gates an intermediate ERC20 delivery on its own baseline and caps it at the bridge step's estimate", async () => {
    const raw = { bridgeOutput: { address: homeUsdc.address, estimate: "2990000000" } };
    const { ports, routes, transfers } = setup({ quote: { raw }, lifi: { creditCheckMaxTicks: 3 } });
    const home = ports.chains.get(EXAMPLE_CHAINS.home)!;
    home.setErc20Balance(homeUsdc.address as Address, FAKE_SIGNER, 1_000n);
    const intent = await parentWithHolding(ports);
    for (let i = 0; i < 3; i++) await transfers.run(intent);
    const [child] = await ports.journal.listOperations({ kind: "transfer" });
    expect((child!.stepPayload as { baselines: unknown }).baselines).toContainEqual({
      asset: homeUsdc.address,
      amount: 1_000n,
    });
    // The destination swap did not run: LI.FI reports USDC on the home chain, more than the bridge step estimated.
    routes.statuses.set(sendHashOf(ports), done(2_995_000_000n, homeUsdc));
    confirmReceipt(ports);
    ports.clock.advance(30_000);
    expect(await transfers.run(intent)).toMatchObject({ step: "bridging: delivery not verified" });
    const homeUsdcHolding = () => holding(ports, homeUsdc.chainId, homeUsdc.address, "in-transit");
    expect(await homeUsdcHolding()).toBe(0n);
    home.setErc20Balance(homeUsdc.address as Address, FAKE_SIGNER, 1_000n + 2_995_000_000n);
    ports.clock.advance(30_000);
    expect(await transfers.run(intent)).toMatchObject({ status: "in-progress", step: "requote" });
    expect(await homeUsdcHolding()).toBe(2_990_000_000n);
    expect(await holding(ports, usdc.chainId, usdc.address, "in-transit")).toBe(0n);
  });

  it("keeps a second leg waiting behind one that is unwrapping, and lets it go once that one completes", async () => {
    const { ports, routes, transfers } = setup({ quote: { deliversWrapped: true, toAsset: homeWeth } });
    const home = ports.chains.get(EXAMPLE_CHAINS.home)!;
    ports.executor.script((r) => r.to === weth, { status: "pending", hash: fakeHash("unwrap") });
    const first = await parentWithHolding(ports);
    const second = await parentWithHolding(ports);
    for (let i = 0; i < 3; i++) await transfers.run(first);
    routes.statuses.set(sendHashOf(ports), done(ETH, homeWeth, fakeHash("recv-a")));
    confirmReceipt(ports, fakeHash("recv-a"));
    home.setErc20Balance(weth, FAKE_SIGNER, ETH);
    ports.clock.advance(30_000);
    expect(await transfers.run(first)).toMatchObject({ step: "unwrap" });
    expect(await transfers.run(first)).toMatchObject({ step: "unwrap" }); // pending
    const [a] = await ports.journal.listOperations({ kind: "transfer" });

    let outcome = await drive(transfers, ports, second, 3);
    expect(outcome).toMatchObject({ status: "in-progress", step: `awaiting-inbound-slot: ${a!.id}` });
    const wait = ports.notifier.sent.filter((n) => n.dedupKey?.startsWith("transfer-slot-wait:"));
    expect(wait).toHaveLength(1);
    expect(wait[0]!.body).toContain(`waits for transfer ${a!.id} (step unwrap)`);
    expect(bridgeSubmissions(ports)).toHaveLength(1);

    // The unwrap confirms: the first completes, its WETH is gone, the second sends with a fresh WETH baseline.
    ports.executor.settle(`op:${a!.id}:step:unwrap`, {
      status: "confirmed",
      hash: fakeHash("unwrap"),
      blockNumber: 12n,
      gasUsed: 30_000n,
    });
    home.setErc20Balance(weth, FAKE_SIGNER, 0n);
    expect(await transfers.run(first)).toMatchObject({ status: "completed", received: ETH });
    outcome = await drive(transfers, ports, second, 4);
    expect(outcome).toMatchObject({ status: "in-progress", step: "bridging" });
    const b = await ports.journal.listOperations({ kind: "transfer", parentId: second.parentOperationId });
    expect((b[0]!.stepPayload as { baselines: unknown }).baselines).toContainEqual({
      asset: weth.toLowerCase(),
      amount: 0n,
    });
    expect(bridgeSubmissions(ports)).toHaveLength(2);
    expect(wait).toHaveLength(1);
  });

  it("releases the inbound slot when the holding leg goes to attention", async () => {
    const { ports, transfers } = setup();
    const first = await parentWithHolding(ports);
    const second = await parentWithHolding(ports);
    for (let i = 0; i < 3; i++) await transfers.run(first);
    const [a] = await ports.journal.listOperations({ kind: "transfer" });
    expect(await drive(transfers, ports, second, 3)).toMatchObject({
      step: `awaiting-inbound-slot: ${a!.id}`,
    });
    // No status for the first: unknown past the timeout is attention, which frees the slot.
    ports.clock.advance(3_601_000);
    expect(await transfers.run(first)).toMatchObject({ status: "attention" });
    expect(await drive(transfers, ports, second, 4)).toMatchObject({ status: "in-progress", step: "bridging" });
    expect(bridgeSubmissions(ports)).toHaveLength(2);
  });
});

describe("requote of a never-signed failed leg (decisions [L35])", () => {
  const limits = [{ chainId: usdc.chainId, asset: usdc.address, decimals: 6, perTransfer: "3000", daily: "4000" }];
  const dailyRejection = (request: RouteRequest) => ({
    kind: "rejected" as const,
    violations: ["daily-limit: 3000000000 spent in 24h plus 3000000000 exceeds 4000000000"],
    quote: quoteFor(request, { estimatedOutput: ETH, minimumOutput: (98n * ETH) / 100n }),
  });

  it("does not count the leg's own reserved spend twice when its requote meets the daily limit", async () => {
    const { ports, routes, transfers } = setup({ lifi: { limits } });
    let failures = 1;
    ports.executor.script((request) => request.to === FAKE_LIFI_DIAMOND && failures-- > 0, {
      status: "failed",
      error: "simulation reverted revertData=none",
    });
    const intent = await parentWithHolding(ports);
    await transfers.run(intent);
    await transfers.run(intent);
    expect(await transfers.run(intent)).toMatchObject({ step: expect.stringMatching(/send failed/) });
    // The provider now counts the leg's own row (3000) plus the requoted input (3000) against 4000.
    routes.quotes.unshift({ match: () => true, result: dailyRejection });
    ports.clock.advance(121_000);
    expect(await transfers.run(intent)).toMatchObject({ status: "in-progress", step: "send" });
    expect(await transfers.run(intent)).toMatchObject({ status: "in-progress", step: "bridging" });
    expect(await ports.journal.ledger.spentSince({ since: new Date(0), category: "transfer" })).toBe(AMOUNT);
  });

  it("still defers a fresh operation the provider rejects on the daily limit", async () => {
    const { ports, routes, transfers } = setup({ lifi: { limits } });
    routes.quotes.unshift({ match: () => true, result: dailyRejection });
    const intent = await parentWithHolding(ports);
    expect(await transfers.run(intent)).toMatchObject({
      status: "deferred",
      reason: expect.stringMatching(/^policy-rejected: daily-limit:/),
    });
  });
});

describe("run 008: re-evaluation, counters, continuation legs, delivery assets (decisions [L43], [L44], [L49])", () => {
  const homeUsdc: Asset = {
    chainId: EXAMPLE_CHAINS.home,
    address: "0x00000000000000000000000000000000000000c9",
    symbol: "USDC",
    decimals: 6,
  };
  const weth = homeWeth.address as Address;

  /** The default re-evaluation `setup` installs (decisions [L59]): its verdict and calls. */
  function recheckOf(routes: FakeRouteProvider) {
    const fake = withRecheck(routes);
    return { verdict: fake.verdict, calls: fake.rechecks };
  }

  it("re-evaluates the persisted unsigned quote against the current policy before approval and send", async () => {
    const { ports, routes, transfers } = setup();
    const { verdict, calls } = recheckOf(routes);
    const intent = await parentWithHolding(ports);
    expect(await transfers.run(intent)).toMatchObject({ step: "approve" });
    // The operator revoked the target since the quote: nothing is approved, the leg goes back to requote.
    verdict.violations = [`target: ${FAKE_LIFI_DIAMOND} on chain ${usdc.chainId} is not allowlisted`];
    expect(await transfers.run(intent)).toMatchObject({
      status: "in-progress",
      step: `policy-rejected: target: ${FAKE_LIFI_DIAMOND} on chain ${usdc.chainId} is not allowlisted`,
    });
    expect(approvals(ports)).toHaveLength(0);
    let [child] = await ports.journal.listOperations({ kind: "transfer" });
    expect(child!.step).toBe("requote");
    verdict.violations = [];
    expect(await transfers.run(intent)).toMatchObject({ step: "approve" });
    expect(await transfers.run(intent)).toMatchObject({ step: "send" });
    expect(approvals(ports)).toHaveLength(1);
    // A limit lowered after the approval blocks the send: no debit, no spend row, no bridge.
    verdict.violations = ["limit: 3000000000 exceeds the per-transfer limit 1000000000"];
    expect(await transfers.run(intent)).toMatchObject({ step: expect.stringMatching(/^policy-rejected: limit:/) });
    expect(bridgeSubmissions(ports)).toHaveLength(0);
    expect(await holding(ports, usdc.chainId, usdc.address, "eoa")).toBe(AMOUNT);
    expect(await ports.journal.ledger.spentSince({ since: new Date(0), category: "transfer" })).toBe(0n);
    [child] = await ports.journal.listOperations({ kind: "transfer" });
    expect(child!.step).toBe("requote");
    verdict.violations = [];
    expect(await transfers.run(intent)).toMatchObject({ step: "send" }); // the allowance still covers it
    expect(await transfers.run(intent)).toMatchObject({ step: "bridging" });
    expect(calls.every((c) => c.options && Object.keys(c.options as object).length === 0)).toBe(true);
    expect(calls.length).toBeGreaterThanOrEqual(4);
  });

  it("never lets an approval reset the failed send's attempt counter", async () => {
    const { ports, transfers } = setup();
    let failures = 1;
    ports.executor.script((request) => request.to === FAKE_LIFI_DIAMOND && failures-- > 0, {
      status: "failed",
      error: "simulation reverted revertData=none",
    });
    const intent = await parentWithHolding(ports);
    await transfers.run(intent); // approve
    await transfers.run(intent); // approved
    expect(await transfers.run(intent)).toMatchObject({ step: expect.stringMatching(/send failed/) });
    // The allowance now reads short (say another spender reset it): a re-approval comes before the retry.
    const chain = ports.chains.get(usdc.chainId)!;
    vi.spyOn(chain, "readContract").mockResolvedValueOnce(0n).mockResolvedValueOnce(0n);
    expect(await transfers.run(intent)).toMatchObject({ step: "approve" });
    expect(await transfers.run(intent)).toMatchObject({ step: "send" });
    expect(await transfers.run(intent)).toMatchObject({ step: "bridging" });
    expect(approvals(ports).map((a) => a.options.idempotencyKey)).toEqual([
      expect.stringMatching(/:step:approve-0-quote-[0-9a-f]+$/),
      expect.stringMatching(/:step:approve-0-quote-[0-9a-f]+:1$/),
    ]);
    // The retry is under a new key, never the failed one's (whose recorded failure would answer forever).
    expect(bridgeSubmissions(ports).map((s) => s.options.idempotencyKey)).toEqual([
      expect.stringMatching(/:step:send-0$/),
      expect.stringMatching(/:step:send-0:1$/),
    ]);
  });

  it("serializes a native delivery with a WETH one, and an intermediate with that token, on one chain", async () => {
    const { ports, transfers } = setup();
    const native = await parentWithHolding(ports);
    const wrapped = { ...(await parentWithHolding(ports)), toAsset: homeWeth };
    for (let i = 0; i < 3; i++) await transfers.run(native);
    const [a] = await ports.journal.listOperations({ kind: "transfer" });
    expect(await drive(transfers, ports, wrapped, 3)).toMatchObject({ step: `awaiting-inbound-slot: ${a!.id}` });
    expect(bridgeSubmissions(ports)).toHaveLength(1);

    const raw = { bridgeOutput: { address: homeUsdc.address, estimate: "2990000000" } };
    const second = setup({ quote: { raw } });
    const bridged = await parentWithHolding(second.ports);
    const token = { ...(await parentWithHolding(second.ports)), toAsset: homeUsdc };
    for (let i = 0; i < 3; i++) await second.transfers.run(bridged);
    const [b] = await second.ports.journal.listOperations({ kind: "transfer" });
    expect(await drive(second.transfers, second.ports, token, 3)).toMatchObject({
      step: `awaiting-inbound-slot: ${b!.id}`,
    });
    expect(bridgeSubmissions(second.ports)).toHaveLength(1);
  });

  it("passes a continuation leg once (no daily check, no second spend row), baselines at its send", async () => {
    const limits = [
      { chainId: usdc.chainId, asset: usdc.address, decimals: 6, perTransfer: "5000", daily: "5000" },
      // A tiny entry for the intermediate: a continuation is never checked or counted against it.
      { chainId: homeUsdc.chainId, asset: homeUsdc.address, decimals: 6, perTransfer: "1", daily: "1" },
    ];
    const raw = { bridgeOutput: { address: homeUsdc.address, estimate: "2990000000" } };
    const { ports, routes, transfers } = setup({ quote: { raw }, lifi: { limits } });
    const { calls } = recheckOf(routes);
    // The continuation swap on the home chain delivers WETH.
    routes.quotes.unshift({
      match: (r) => r.fromChainId === EXAMPLE_CHAINS.home,
      result: (r) => ({
        kind: "quote",
        quote: quoteFor(r, {
          deliversWrapped: true,
          toAsset: homeWeth,
          estimatedOutput: ETH,
          minimumOutput: (98n * ETH) / 100n,
        }),
      }),
    });
    const home = ports.chains.get(EXAMPLE_CHAINS.home)!;
    const intent = await parentWithHolding(ports);
    for (let i = 0; i < 3; i++) await transfers.run(intent);
    routes.statuses.set(sendHashOf(ports), done(2_990_000_000n, homeUsdc));
    confirmReceipt(ports);
    home.setErc20Balance(homeUsdc.address as Address, FAKE_SIGNER, 2_990_000_000n);
    ports.clock.advance(30_000);
    expect(await transfers.run(intent)).toMatchObject({ step: "requote" });
    // WETH arrives from elsewhere before the continuation is sent: it is not this transfer's delivery.
    home.setErc20Balance(weth, FAKE_SIGNER, ETH);
    let outcome = await drive(transfers, ports, intent, 3);
    expect(outcome).toMatchObject({ status: "in-progress", step: "bridging" });
    const continuation = calls.filter((c) => c.request.fromChainId === EXAMPLE_CHAINS.home);
    expect(continuation.length).toBeGreaterThan(0);
    expect(continuation[0]!.options).toEqual({
      continuationOf: { chainId: usdc.chainId, asset: usdc, amount: AMOUNT, bridgeOutput: homeUsdc.address },
    });
    expect(await ports.journal.ledger.spentSince({ since: new Date(0), category: "transfer" })).toBe(AMOUNT);
    const [child] = await ports.journal.listOperations({ kind: "transfer" });
    expect((child!.stepPayload as { baselines: unknown }).baselines).toContainEqual({
      asset: weth.toLowerCase(),
      amount: ETH,
    });

    const swapHash = (bridgeSubmissions(ports)[1]!.outcome as { hash: Hex }).hash;
    routes.statuses.set(swapHash, done(ETH, homeWeth, fakeHash("swap-recv")));
    confirmReceipt(ports, fakeHash("swap-recv"));
    ports.clock.advance(30_000);
    // Measured from the continuation's own send, the WETH has not risen: nothing is credited.
    expect(await transfers.run(intent)).toMatchObject({ step: "bridging: delivery not verified" });
    home.setErc20Balance(weth, FAKE_SIGNER, 2n * ETH);
    ports.clock.advance(30_000);
    expect(await transfers.run(intent)).toMatchObject({ step: "unwrap" });
    outcome = await transfers.run(intent);
    expect(outcome).toMatchObject({ status: "completed", received: ETH });
    expect(await ports.journal.ledger.spentSince({ since: new Date(0), category: "transfer" })).toBe(AMOUNT);
  });
});

describe("run 009: resumes, moved-back legs, WETH baselines, aborted submits ([L51], [L54], [L58], [L61])", () => {
  const weth = homeWeth.address as Address;
  const sendKeys = (ports: FakePorts) => bridgeSubmissions(ports).map((s) => s.options.idempotencyKey);

  /** Runs to `send:submit` with nothing recorded under the send key: a crash between the bracket and the submit. */
  async function crashedBeforeSubmit(ports: FakePorts, transfers: LifiTransfers, intent: TransferIntent) {
    await transfers.run(intent); // quote
    await transfers.run(intent); // approve
    const spy = vi.spyOn(ports.executor, "submit").mockImplementationOnce(async () => {
      throw new Error("simulated crash");
    });
    expect(await transfers.run(intent)).toMatchObject({ step: expect.stringMatching(/^error: simulated crash/) });
    spy.mockRestore();
    const [child] = await ports.journal.listOperations({ kind: "transfer" });
    expect(child!.step).toBe("send:submit");
    expect(await holding(ports, usdc.chainId, usdc.address, "in-transit")).toBe(AMOUNT);
    return child!;
  }

  it("re-evaluates the full policy, daily limit included, at a resume with nothing sent; blocked, it moves back", async () => {
    const limits = [{ chainId: usdc.chainId, asset: usdc.address, decimals: 6, perTransfer: "3000", daily: "4000" }];
    const { ports, transfers } = setup({ lifi: { limits } });
    const intent = await parentWithHolding(ports);
    await crashedBeforeSubmit(ports, transfers, intent);
    // Another operation sent 3000 USDC meanwhile: this leg's own row (3000) plus that one exceed the 4000 limit.
    await ports.journal.ledger.recordSpend({
      chainId: usdc.chainId,
      asset: usdc.address,
      category: "transfer",
      amount: AMOUNT,
      operationId: "other-op",
      at: ports.clock.now(),
    });
    const record = vi.spyOn(ports.journal.ledger, "recordSpend");
    expect(await transfers.run(intent)).toMatchObject({
      status: "in-progress",
      step: expect.stringMatching(/^policy-rejected: daily-limit: 6000000000 spent in 24h plus 0 exceeds 4000000000/),
    });
    // Nothing signed; the money is back in `eoa` (never booked in transit while nothing is sent).
    expect(bridgeSubmissions(ports)).toHaveLength(0);
    expect(await holding(ports, usdc.chainId, usdc.address, "in-transit")).toBe(0n);
    expect(await holding(ports, usdc.chainId, usdc.address, "eoa")).toBe(AMOUNT);
    const [child] = await ports.journal.listOperations({ kind: "transfer" });
    expect(child!.step).toBe("requote");
    expect((child!.stepPayload as { attempt: number }).attempt).toBe(1);
    // The leg keeps its one spend row (decisions [L58]): nothing written, nothing negative.
    expect(record).not.toHaveBeenCalled();
    expect(await ports.journal.ledger.spentSince({ since: new Date(0), category: "transfer" })).toBe(2n * AMOUNT);
  });

  it("requotes a leg the re-evaluated policy blocked under a new attempt key, reusing its spend row", async () => {
    const { ports, routes, transfers } = setup();
    const intent = await parentWithHolding(ports);
    await crashedBeforeSubmit(ports, transfers, intent);
    routes.verdict.violations = [`target: ${FAKE_LIFI_DIAMOND} on chain ${usdc.chainId} is not allowlisted`];
    expect(await transfers.run(intent)).toMatchObject({ step: expect.stringMatching(/^policy-rejected: target:/) });
    expect(await holding(ports, usdc.chainId, usdc.address, "eoa")).toBe(AMOUNT);
    // Requoted (the fake's quote passes), then blocked again by the re-evaluation at send, before the bracket: it
    // stays booked in `eoa`, nothing is debited again.
    expect(await transfers.run(intent)).toMatchObject({ step: "send" });
    expect(await transfers.run(intent)).toMatchObject({ step: expect.stringMatching(/^policy-rejected: target:/) });
    expect(await holding(ports, usdc.chainId, usdc.address, "in-transit")).toBe(0n);
    expect(await holding(ports, usdc.chainId, usdc.address, "eoa")).toBe(AMOUNT);
    routes.verdict.violations = [];
    const record = vi.spyOn(ports.journal.ledger, "recordSpend");
    expect(await transfers.run(intent)).toMatchObject({ step: "send" });
    expect(await transfers.run(intent)).toMatchObject({ step: "bridging" });
    expect(record).not.toHaveBeenCalled();
    expect(await ports.journal.ledger.spentSince({ since: new Date(0), category: "transfer" })).toBe(AMOUNT);
    expect(await holding(ports, usdc.chainId, usdc.address, "in-transit")).toBe(AMOUNT);
    expect(await holding(ports, usdc.chainId, usdc.address, "eoa")).toBe(0n);
    expect(sendKeys(ports)).toEqual([expect.stringMatching(/:step:send-0:1$/)]);
  });

  it("goes to attention when the move-back itself is interrupted (crash inside its bracket)", async () => {
    const { ports, routes, transfers } = setup();
    const intent = await parentWithHolding(ports);
    await crashedBeforeSubmit(ports, transfers, intent);
    routes.verdict.violations = ["tool: fake-bridge is not allowlisted"];
    const credit = vi.spyOn(ports.journal.ledger, "credit").mockRejectedValueOnce(new Error("simulated crash"));
    expect(await transfers.run(intent)).toMatchObject({ step: expect.stringMatching(/^error: simulated crash/) });
    credit.mockRestore();
    expect(await transfers.run(intent)).toMatchObject({
      status: "attention",
      reason: expect.stringMatching(/ledger bracket "send:crediting"/),
    });
  });

  it("records the WETH baseline of a native-destination leg not quoted as wrapped, and unwraps", async () => {
    const { ports, routes, transfers } = setup(); // deliversWrapped: false
    const home = ports.chains.get(EXAMPLE_CHAINS.home)!;
    home.setErc20Balance(weth, FAKE_SIGNER, 5n);
    home.setNativeBalance(FAKE_SIGNER, 7n * ETH);
    const intent = await parentWithHolding(ports);
    for (let i = 0; i < 3; i++) await transfers.run(intent);
    const [child] = await ports.journal.listOperations({ kind: "transfer" });
    expect((child!.stepPayload as { baselines: unknown }).baselines).toEqual([
      { asset: "native", amount: 7n * ETH },
      { asset: weth.toLowerCase(), amount: 5n },
    ]);
    // LI.FI delivers WETH unexpectedly: verified against its own baseline, unwrapped, credited as native.
    routes.statuses.set(sendHashOf(ports), done(ETH, homeWeth));
    confirmReceipt(ports);
    home.setErc20Balance(weth, FAKE_SIGNER, ETH + 5n);
    ports.clock.advance(30_000);
    expect(await transfers.run(intent)).toMatchObject({ status: "in-progress", step: "unwrap" });
    expect(await transfers.run(intent)).toMatchObject({ status: "completed", received: ETH });
    expect(await holding(ports, homeEth.chainId, "native", "eoa")).toBe(ETH);
  });

  it("retries an aborted: submit (approve, send, unwrap) under a new attempt key, with no notification", async () => {
    const { ports, routes, transfers } = setup({ quote: { deliversWrapped: true, toAsset: homeWeth } });
    const aborted = { status: "failed" as const, error: "aborted: shutdown revertData=none" };
    let approveAborts = 1;
    let sendAborts = 2;
    let unwrapAborts = 1;
    ports.executor.script((r) => r.to === usdc.address && approveAborts-- > 0, aborted);
    ports.executor.script((r) => r.to === FAKE_LIFI_DIAMOND && sendAborts-- > 0, aborted);
    ports.executor.script((r) => r.to === weth && unwrapAborts-- > 0, aborted);
    const home = ports.chains.get(EXAMPLE_CHAINS.home)!;
    const intent = await parentWithHolding(ports);
    let outcome = await drive(transfers, ports, intent, 8);
    expect(outcome).toMatchObject({ status: "in-progress", step: "bridging" });
    expect(approvals(ports).map((a) => a.options.idempotencyKey)).toEqual([
      expect.stringMatching(/:step:approve-0-quote-[0-9a-f]+$/),
      expect.stringMatching(/:step:approve-0-quote-[0-9a-f]+:1$/),
    ]);
    expect(sendKeys(ports)).toEqual([
      expect.stringMatching(/:step:send-0$/),
      expect.stringMatching(/:step:send-0:1$/),
      expect.stringMatching(/:step:send-0:2$/),
    ]);
    // Each aborted send was credited back before its retry: one bracket, one spend row.
    expect(await holding(ports, usdc.chainId, usdc.address, "in-transit")).toBe(AMOUNT);
    expect(await ports.journal.ledger.spentSince({ since: new Date(0), category: "transfer" })).toBe(AMOUNT);
    const sent = bridgeSubmissions(ports).at(-1)!.outcome;
    if (sent.status !== "confirmed") throw new Error("expected the last send confirmed");
    routes.statuses.set(sent.hash, done(ETH, homeWeth));
    confirmReceipt(ports);
    home.setErc20Balance(weth, FAKE_SIGNER, ETH);
    outcome = await drive(transfers, ports, intent, 6);
    expect(outcome).toMatchObject({ status: "completed", received: ETH });
    const unwraps = ports.executor.submissions.filter((s) => s.request.to === weth);
    expect(unwraps.map((u) => u.options.idempotencyKey)).toEqual([
      expect.stringMatching(/:step:unwrap$/),
      expect.stringMatching(/:step:unwrap:1$/),
    ]);
    // Nothing about the aborted submits: only the delta warning (the fake unwrap moves no native balance).
    expect(ports.notifier.sent.map((n) => n.dedupKey)).toEqual([expect.stringMatching(/^transfer-delta:/)]);
  });
});

describe("transfers crash and resume", () => {
  /** Crashes the n-th journal write of an operation (the write is lost, nothing after it runs). */
  function crashAt(ports: FakePorts, n: number) {
    const original = ports.journal.updateOperation.bind(ports.journal);
    let calls = 0;
    ports.journal.updateOperation = async (...args) => {
      calls += 1;
      if (calls === n) throw new Error(`simulated crash at write ${n}`);
      return original(...args);
    };
    return () => {
      ports.journal.updateOperation = original;
    };
  }

  it("resumes after a crash at every step boundary: no second approval or bridge, never a double credit", async () => {
    let completedWithoutCrash = false;
    const resumedOutcomes: string[] = [];
    for (let n = 1; n < 40 && !completedWithoutCrash; n++) {
      const { ports, routes, transfers, oracle } = setup();
      ports.chains.get(EXAMPLE_CHAINS.home)!.setNativeBalance(FAKE_SIGNER, 0n);
      const intent = await parentWithHolding(ports);
      confirmReceipt(ports);
      const restore = crashAt(ports, n);
      let crashed = false;
      let outcome: TransferOutcome | undefined;
      for (let i = 0; i < 12; i++) {
        try {
          outcome = await transfers.run(intent);
        } catch {
          crashed = true;
          break;
        }
        if (outcome.status === "in-progress" && outcome.step.startsWith("error:")) {
          crashed = true;
          break;
        }
        if (bridgeSubmissions(ports).length === 1) routes.statuses.set(sendHashOf(ports), done(ETH));
        if (outcome.status !== "in-progress") break;
        ports.clock.advance(30_000);
      }
      restore();
      if (!crashed) {
        completedWithoutCrash = true;
        expect(outcome?.status).toBe("completed");
        continue;
      }
      // Restart: a new step machine over the same journal, executor and LI.FI.
      const restarted = new LifiTransfers({
        ports,
        config: ports.config.lifi,
        routeProvider: routes,
        priceOracle: oracle,
      });
      let resumed: TransferOutcome = await restarted.run(intent);
      for (let i = 0; i < 12 && resumed.status === "in-progress"; i++) {
        if (bridgeSubmissions(ports).length === 1) routes.statuses.set(sendHashOf(ports), done(ETH));
        ports.clock.advance(30_000);
        resumed = await restarted.run(intent);
      }
      resumedOutcomes.push(resumed.status);
      expect(approvals(ports).length, `crash at write ${n}`).toBeLessThanOrEqual(1);
      expect(bridgeSubmissions(ports).length, `crash at write ${n}`).toBeLessThanOrEqual(1);
      expect(await ports.journal.listOperations({ kind: "transfer" })).toHaveLength(1);
      const credited = await holding(ports, homeEth.chainId, "native", "eoa");
      expect(credited, `crash at write ${n}`).toBeLessThanOrEqual(ETH);
      if (resumed.status === "completed") {
        expect(credited).toBe(ETH);
        expect(await holding(ports, usdc.chainId, usdc.address, "in-transit")).toBe(0n);
      } else {
        expect(resumed.status, `crash at write ${n}`).toBe("attention");
        if (resumed.status === "attention") expect(resumed.reason).toMatch(/ledger bracket/);
      }
      expect(
        (await holding(ports, usdc.chainId, usdc.address, "eoa")) +
          (await holding(ports, usdc.chainId, usdc.address, "in-transit")),
        `crash at write ${n}`
      ).toBeLessThanOrEqual(AMOUNT);
    }
    expect(completedWithoutCrash).toBe(true);
    // Every journal write of the run was a crash point; most resume to completion, the bracketed ones to attention.
    expect(resumedOutcomes.length).toBeGreaterThanOrEqual(6);
    expect(resumedOutcomes).toContain("completed");
    expect(resumedOutcomes).toContain("attention");
  });
});

describe("run 010: every blocked path, re-approval recheck, receipt reads ([L64], [L67])", () => {
  const homeUsdc: Asset = {
    chainId: EXAMPLE_CHAINS.home,
    address: "0x00000000000000000000000000000000000000c9",
    symbol: "USDC",
    decimals: 6,
  };
  const BRIDGED = 2_990_000_000n;
  const homeChain = EXAMPLE_CHAINS.home;

  /** A bridge that delivered the intermediate `homeUsdc` (LI.FI PARTIAL): the continuation is at `requote`. */
  async function atContinuation(lifi: Record<string, unknown> = {}) {
    const raw = { bridgeOutput: { address: homeUsdc.address, estimate: BRIDGED.toString() } };
    const env = setup({ quote: { raw }, lifi });
    const { ports, routes, transfers } = env;
    const intent = await parentWithHolding(ports);
    for (let i = 0; i < 3; i++) await transfers.run(intent);
    routes.statuses.set(sendHashOf(ports), done(BRIDGED, homeUsdc));
    confirmReceipt(ports);
    ports.chains.get(homeChain)!.setErc20Balance(homeUsdc.address as Address, FAKE_SIGNER, BRIDGED);
    ports.clock.advance(30_000);
    expect(await transfers.run(intent)).toMatchObject({ step: "requote" });
    expect(await holding(ports, homeChain, homeUsdc.address, "in-transit")).toBe(BRIDGED);
    return { ...env, intent };
  }

  /** The continuation quote the current policy rejects ([L50]: the intermediate is not in `allowedAssets`). */
  function rejectContinuation(routes: FakeRouteProvider) {
    routes.quotes.unshift({
      match: (r) => r.fromChainId === homeChain,
      result: () => ({
        kind: "rejected",
        violations: [`asset: ${homeUsdc.address} on chain ${homeChain} is not in allowedAssets`],
      }),
    });
  }

  async function expectReleased(ports: FakePorts, t: LifiTransfers, intent: TransferIntent, ticks: number) {
    const [child] = await ports.journal.listOperations({ kind: "transfer" });
    expect(child!.status).toBe("attention");
    expect(child!.lastError).toMatch(new RegExp(`continuation blocked by the policy after ${ticks} ticks`));
    // Nothing stays booked in transit: the intermediate is in the operation's own `eoa` holding on that chain.
    expect(await holding(ports, homeChain, homeUsdc.address, "in-transit")).toBe(0n);
    expect(await holding(ports, homeChain, homeUsdc.address, "eoa")).toBe(BRIDGED);
    expect(await holding(ports, usdc.chainId, usdc.address, "in-transit")).toBe(0n);
    const critical = ports.notifier.bySeverity("critical");
    expect(critical).toHaveLength(1);
    expect(critical[0]).toMatchObject({ operationId: child!.id, chainId: homeChain });
    expect(critical[0]!.body).toContain(child!.id);
    expect(critical[0]!.body).toContain(homeUsdc.address);
    expect(critical[0]!.body).toContain(`chain ${homeChain}`);
    expect(critical[0]!.action).toMatch(/by hand, or add the token to lifi\.allowedAssets and resume/);
    // The outcome stays `attention`; nothing more is quoted, sent or notified.
    const sent = ports.notifier.sent.length;
    expect(await t.run(intent)).toMatchObject({ status: "attention" });
    expect(ports.notifier.sent).toHaveLength(sent);
    return child!;
  }

  it("(a) first leg: blocked after its bracket it is moved back to eoa and never bounded to attention", async () => {
    const { ports, routes, transfers: t } = setup({ lifi: { continuationBlockedMaxTicks: 2 } });
    const intent = await parentWithHolding(ports);
    await t.run(intent); // quote
    await t.run(intent); // approve
    const spy = vi.spyOn(ports.executor, "submit").mockImplementationOnce(async () => {
      throw new Error("simulated crash");
    });
    await t.run(intent);
    spy.mockRestore();
    expect(await holding(ports, usdc.chainId, usdc.address, "in-transit")).toBe(AMOUNT);
    routes.verdict.violations = ["tool: fake-bridge is not allowlisted"];
    for (let i = 0; i < 6; i++) {
      expect(await t.run(intent)).toMatchObject({ status: "in-progress" });
      expect(await holding(ports, usdc.chainId, usdc.address, "in-transit")).toBe(0n);
      expect(await holding(ports, usdc.chainId, usdc.address, "eoa")).toBe(AMOUNT);
    }
    const [child] = await ports.journal.listOperations({ kind: "transfer" });
    expect(child!.status).toBe("open");
    expect(ports.notifier.bySeverity("critical")).toHaveLength(0);
    expect(bridgeSubmissions(ports)).toHaveLength(0);
  });

  it("(b) continuation: a blocked one warns per tick, then goes to eoa and attention, one critical", async () => {
    const { ports, routes, transfers: t, intent } = await atContinuation({ continuationBlockedMaxTicks: 3 });
    rejectContinuation(routes);
    for (let tick = 1; tick <= 2; tick++) {
      expect(await t.run(intent)).toMatchObject({
        status: "in-progress",
        step: expect.stringMatching(/^policy-rejected: asset: .* is not in allowedAssets/),
      });
      expect(await holding(ports, homeChain, homeUsdc.address, "in-transit")).toBe(BRIDGED);
      const warnings = ports.notifier.sent.filter((n) => n.title === "LI.FI continuation swap blocked by the policy");
      expect(warnings).toHaveLength(tick); // one per tick, all under the operation's dedup key
      expect(new Set(warnings.map((w) => w.dedupKey)).size).toBe(1);
      ports.clock.advance(30_000);
    }
    expect(await t.run(intent)).toMatchObject({ status: "attention" });
    await expectReleased(ports, t, intent, 3);
    expect(bridgeSubmissions(ports)).toHaveLength(1);
  });

  it("(c) resume: a continuation blocked at a send:submit resume with nothing sent is bounded alike", async () => {
    const { ports, routes, transfers: t, intent } = await atContinuation({ continuationBlockedMaxTicks: 2 });
    const submit = ports.executor.submit.bind(ports.executor);
    let crashes = 1;
    const spy = vi.spyOn(ports.executor, "submit").mockImplementation(async (request, options) => {
      if (request.to === FAKE_LIFI_DIAMOND && crashes-- > 0) throw new Error("simulated crash");
      return submit(request, options);
    });
    // The continuation is quoted, approved if needed, and crashes between its bracket and the submit.
    let child = (await ports.journal.listOperations({ kind: "transfer" }))[0]!;
    for (let i = 0; i < 4 && child.step !== "send:submit"; i++) {
      await t.run(intent);
      child = (await ports.journal.listOperations({ kind: "transfer" }))[0]!;
    }
    spy.mockRestore();
    expect(child.step).toBe("send:submit");
    expect(bridgeSubmissions(ports)).toHaveLength(1);
    routes.verdict.violations = ["target: revoked since the quote"];
    expect(await t.run(intent)).toMatchObject({ step: "policy-rejected: target: revoked since the quote" });
    expect(await holding(ports, homeChain, homeUsdc.address, "in-transit")).toBe(BRIDGED);
    let outcome = await t.run(intent);
    for (let i = 0; i < 4 && outcome.status === "in-progress"; i++) outcome = await t.run(intent);
    expect(outcome).toMatchObject({ status: "attention" });
    await expectReleased(ports, t, intent, 2);
    expect(bridgeSubmissions(ports)).toHaveLength(1);
  });

  it("(d) requote: a continuation whose requotes keep being rejected goes to attention at the age limit", async () => {
    const { ports, routes, transfers: t, intent } = await atContinuation({ continuationBlockedMaxTicks: 100 });
    rejectContinuation(routes);
    expect(await t.run(intent)).toMatchObject({ step: expect.stringMatching(/^policy-rejected:/) });
    ports.clock.advance(1_800_000);
    expect(await t.run(intent)).toMatchObject({ step: expect.stringMatching(/^policy-rejected:/) });
    ports.clock.advance(1_800_001); // past statusTimeoutSeconds (3600) from the first blocked tick
    expect(await t.run(intent)).toMatchObject({ status: "attention" });
    await expectReleased(ports, t, intent, 3);
  });

  it("rechecks a re-approval against the current policy before its new key is signed", async () => {
    const { ports, routes, transfers: t } = setup();
    const first = await parentWithHolding(ports);
    const second = { ...(await parentWithHolding(ports)), toChainId: foreignEth.chainId, toAsset: foreignEth };
    await t.run(first); // approve
    await t.run(first); // approved: send
    await t.run(second);
    await t.run(second); // its send spent the allowance
    expect(await t.run(first)).toMatchObject({ step: "approve" });
    routes.verdict.violations = [`spender: ${FAKE_LIFI_DIAMOND} on chain ${usdc.chainId} is not allowlisted`];
    expect(await t.run(first)).toMatchObject({ step: expect.stringMatching(/^policy-rejected: spender:/) });
    expect(approvals(ports)).toHaveLength(1);
    expect(routes.rechecks.at(-1)!.request.amount).toBe(AMOUNT);
    routes.verdict.violations = [];
    expect(await drive(t, ports, first, 4)).toMatchObject({ step: "bridging" });
    expect(approvals(ports)).toHaveLength(2);
    expect(approvals(ports)[1]!.options.idempotencyKey).toMatch(/:step:approve-0-quote-[0-9a-f]+:1$/);
  });

  it("keeps a DONE leg in progress on a failing receipt read; attention past the bound from doneSeenAt", async () => {
    const { ports, routes, transfers: t } = setup();
    const home = ports.chains.get(homeChain)!;
    const intent = await parentWithHolding(ports);
    for (let i = 0; i < 3; i++) await t.run(intent);
    routes.statuses.set(sendHashOf(ports), done(ETH));
    const read = vi.spyOn(home, "getTransactionReceipt").mockRejectedValue(new Error("rpc unavailable"));
    ports.clock.advance(30_000);
    expect(await t.run(intent)).toMatchObject({
      status: "in-progress",
      step: "bridging: receipt read failed: rpc unavailable",
    });
    let [child] = await ports.journal.listOperations({ kind: "transfer" });
    const seen = (child!.stepPayload as { doneSeenAt: string }).doneSeenAt;
    expect(seen).toBe(ports.clock.now().toISOString());
    // The receipt is found, but the head read fails: the same bound.
    read.mockRestore();
    confirmReceipt(ports);
    const head = vi.spyOn(home, "getBlockNumber").mockRejectedValue(new Error("rpc unavailable"));
    ports.clock.advance(1_800_000);
    expect(await t.run(intent)).toMatchObject({ step: "bridging: receipt read failed: rpc unavailable" });
    [child] = await ports.journal.listOperations({ kind: "transfer" });
    expect((child!.stepPayload as { doneSeenAt: string }).doneSeenAt).toBe(seen);
    ports.clock.advance(1_800_001);
    expect(await t.run(intent)).toMatchObject({
      status: "attention",
      reason: expect.stringMatching(/cannot be read .* after LI\.FI reported it done: rpc unavailable/),
    });
    head.mockRestore();
    expect(await holding(ports, homeChain, "native", "eoa")).toBe(0n);
    // `attention` releases the inbound slot: the next transfer to the same destination is sent.
    const next = await parentWithHolding(ports);
    expect(await drive(t, ports, next, 4)).toMatchObject({ step: "bridging" });
  });

  it("credits a leg that finished after the timeout once a failing receipt read recovers", async () => {
    const { ports, routes, transfers: t } = setup();
    const home = ports.chains.get(homeChain)!;
    const intent = await parentWithHolding(ports);
    for (let i = 0; i < 3; i++) await t.run(intent);
    routes.statuses.set(sendHashOf(ports), { state: "pending" });
    ports.clock.advance(3_700_000); // past statusTimeoutSeconds (3600) from the send, still pending
    expect(await t.run(intent)).toMatchObject({ status: "in-progress", step: "bridging" });
    routes.statuses.set(sendHashOf(ports), done(ETH));
    confirmReceipt(ports);
    vi.spyOn(home, "getTransactionReceipt").mockRejectedValueOnce(new Error("rpc unavailable"));
    ports.clock.advance(30_000);
    expect(await t.run(intent)).toMatchObject({ status: "in-progress", step: expect.stringMatching(/read failed/) });
    ports.clock.advance(30_000);
    expect(await t.run(intent)).toMatchObject({ status: "completed", received: ETH });
    expect(await holding(ports, homeChain, "native", "eoa")).toBe(ETH);
  });
});

describe("run 011: late DONE waits, fees paid on top, continuations without a route ([L26], [L64], [L67])", () => {
  const FEE = 10n ** 15n;
  const homeChain = EXAMPLE_CHAINS.home;
  const homeUsdc: Asset = {
    chainId: EXAMPLE_CHAINS.home,
    address: "0x00000000000000000000000000000000000000c9",
    symbol: "USDC",
    decimals: 6,
  };
  const BRIDGED = 2_990_000_000n;

  const childOf = async (ports: FakePorts) => (await ports.journal.listOperations({ kind: "transfer" }))[0]!;
  const payloadOf = async (ports: FakePorts) =>
    (await childOf(ports)).stepPayload as unknown as {
      doneSeenAt?: string | null;
      legs: { feesOnTop?: { scope: string; amount: bigint }[] }[];
    };

  /** The quote with `fee` added to the value of each non-approval step: a LI.FI fee paid on top in native. */
  function withFeeOnTop(quote: RouteQuote, fee: bigint): RouteQuote {
    return {
      ...quote,
      steps: quote.steps.map((s) => (s.kind === "approve" ? s : { ...s, tx: { ...s.tx, value: s.tx.value + fee } })),
    };
  }

  function feeQuotes(routes: FakeRouteProvider, fee: bigint) {
    routes.quotes.unshift({
      match: () => true,
      result: (r) => ({
        kind: "quote",
        quote: withFeeOnTop(quoteFor(r, { estimatedOutput: ETH, minimumOutput: (98n * ETH) / 100n }), fee),
      }),
    });
  }

  async function creditNative(ports: FakePorts, chainId: number, amount: bigint, operationId = "funding") {
    await ports.journal.ledger.credit({
      scope,
      chainId,
      asset: "native",
      location: "eoa",
      amount,
      operationId,
      reason: "test",
    });
  }

  /** A native transfer of 1 ETH from the foreign chain to the home chain; the scope holds `held` native there. */
  async function nativeParent(ports: FakePorts, held: bigint): Promise<TransferIntent> {
    const parent = await ports.journal.createOperation({
      kind: "refill",
      description: "test parent",
      scopes: [scope],
      pairId: "eth-home",
      payload: null,
    });
    await creditNative(ports, foreignEth.chainId, held, parent.id);
    return {
      parentOperationId: parent.id,
      tag: "withdraw-0",
      fromChainId: foreignEth.chainId,
      fromAsset: foreignEth,
      amount: ETH,
      toChainId: homeEth.chainId,
      toAsset: homeEth,
      allocations: [{ scope, amount: ETH }],
      purpose: "refill",
    };
  }

  /** Runs to `send:submit` with nothing recorded under the send key (a crash between the bracket and the submit). */
  async function crashAtSubmit(ports: FakePorts, t: LifiTransfers, intent: TransferIntent) {
    const spy = vi.spyOn(ports.executor, "submit").mockImplementationOnce(async () => {
      throw new Error("simulated crash");
    });
    expect(await t.run(intent)).toMatchObject({ step: expect.stringMatching(/^error: simulated crash/) });
    spy.mockRestore();
    expect((await childOf(ports)).step).toBe("send:submit");
  }

  /** A bridge that delivered the intermediate `homeUsdc` (LI.FI PARTIAL): the continuation is at `requote`. */
  async function atContinuation(lifi: Record<string, unknown> = {}) {
    const raw = { bridgeOutput: { address: homeUsdc.address, estimate: BRIDGED.toString() } };
    const env = setup({ quote: { raw }, lifi });
    const { ports, routes, transfers } = env;
    const intent = await parentWithHolding(ports);
    for (let i = 0; i < 3; i++) await transfers.run(intent);
    routes.statuses.set(sendHashOf(ports), done(BRIDGED, homeUsdc));
    confirmReceipt(ports);
    ports.chains.get(homeChain)!.setErc20Balance(homeUsdc.address as Address, FAKE_SIGNER, BRIDGED);
    ports.clock.advance(30_000);
    expect(await transfers.run(intent)).toMatchObject({ step: "requote" });
    expect(await holding(ports, homeChain, homeUsdc.address, "in-transit")).toBe(BRIDGED);
    return { ...env, intent };
  }

  // Row 1: every wait after the first DONE is bounded from doneSeenAt, never from the send ([L67]).

  it("keeps a late DONE without a receiving hash in progress, bounded from doneSeenAt, and credits it", async () => {
    const { ports, routes, transfers: t } = setup();
    const intent = await parentWithHolding(ports);
    for (let i = 0; i < 3; i++) await t.run(intent);
    const hash = sendHashOf(ports);
    routes.statuses.set(hash, { state: "pending" });
    ports.clock.advance(3_700_000); // past statusTimeoutSeconds (3600) from the send
    expect(await t.run(intent)).toMatchObject({ status: "in-progress", step: "bridging" });
    routes.statuses.set(hash, { state: "done", received: ETH, receivedAsset: homeEth, receivingTxHash: null });
    ports.clock.advance(30_000);
    expect(await t.run(intent)).toMatchObject({ status: "in-progress", step: "bridging" });
    expect((await payloadOf(ports)).doneSeenAt).toBe(ports.clock.now().toISOString());
    routes.statuses.set(hash, done(ETH)); // a hash, but no receipt yet (null, not a throw)
    ports.clock.advance(30_000);
    expect(await t.run(intent)).toMatchObject({ status: "in-progress", step: "bridging" });
    confirmReceipt(ports);
    ports.clock.advance(30_000);
    expect(await t.run(intent)).toMatchObject({ status: "completed", received: ETH });
    expect(await holding(ports, homeChain, "native", "eoa")).toBe(ETH);
  });

  it.each([
    ["done without a receiving transaction", { receivingTxHash: null }],
    ["receiving transaction not found yet", {}],
  ])("ends a DONE %s in attention only past statusTimeoutSeconds from doneSeenAt", async (detail, override) => {
    const { ports, routes, transfers: t } = setup();
    const intent = await parentWithHolding(ports);
    for (let i = 0; i < 3; i++) await t.run(intent);
    routes.statuses.set(sendHashOf(ports), { ...done(ETH), ...override });
    ports.clock.advance(30_000);
    expect(await t.run(intent)).toMatchObject({ status: "in-progress", step: "bridging" });
    const seen = (await payloadOf(ports)).doneSeenAt;
    expect(seen).toBe(ports.clock.now().toISOString());
    ports.clock.advance(1_800_000);
    expect(await t.run(intent)).toMatchObject({ status: "in-progress", step: "bridging" });
    expect((await payloadOf(ports)).doneSeenAt).toBe(seen);
    ports.clock.advance(1_800_001);
    const outcome = await t.run(intent);
    expect(outcome).toMatchObject({ status: "attention" });
    if (outcome.status === "attention") {
      expect(outcome.reason).toContain(detail);
      expect(outcome.reason).toMatch(/after LI\.FI reported it done/);
    }
    // `attention` releases the inbound slot: the next transfer to the same destination is sent.
    const next = await parentWithHolding(ports);
    expect(await drive(t, ports, next, 4)).toMatchObject({ step: "bridging" });
  });

  it("measures an unknown status after a late DONE from doneSeenAt, not from the send", async () => {
    const { ports, routes, transfers: t } = setup();
    const intent = await parentWithHolding(ports);
    for (let i = 0; i < 3; i++) await t.run(intent);
    const hash = sendHashOf(ports);
    routes.statuses.set(hash, { state: "pending" });
    ports.clock.advance(3_700_000);
    expect(await t.run(intent)).toMatchObject({ status: "in-progress", step: "bridging" });
    routes.statuses.set(hash, done(ETH)); // no receipt yet
    ports.clock.advance(30_000);
    expect(await t.run(intent)).toMatchObject({ status: "in-progress", step: "bridging" });
    routes.statuses.delete(hash); // one transient LI.FI failure: the fake answers `unknown`
    ports.clock.advance(30_000);
    expect(await t.run(intent)).toMatchObject({ status: "in-progress", step: "bridging" });
    routes.statuses.set(hash, done(ETH));
    confirmReceipt(ports);
    ports.clock.advance(30_000);
    expect(await t.run(intent)).toMatchObject({ status: "completed", received: ETH });
  });

  // Row 2: a native fee paid on top is debited from the operation's holdings, never from operator gas ([L26]).

  it("debits a native fee paid on top from the scope's native holding with the input; gas pays nothing", async () => {
    const { ports, routes, transfers: t } = setup();
    feeQuotes(routes, FEE);
    const intent = await nativeParent(ports, ETH + FEE);
    expect(await t.run(intent)).toMatchObject({ status: "in-progress", step: "send" });
    expect(await t.run(intent)).toMatchObject({ status: "in-progress", step: "bridging" });
    expect(bridgeSubmissions(ports)).toHaveLength(1);
    expect(bridgeSubmissions(ports)[0]!.request.value).toBe(ETH + FEE);
    // The holding dropped by exactly the transaction's value: the fee is the operation's, not the gas float's.
    expect(await holding(ports, foreignEth.chainId, "native", "eoa")).toBe(0n);
    expect(await holding(ports, foreignEth.chainId, "native", "in-transit")).toBe(ETH);
    expect((await payloadOf(ports)).legs[0]!.feesOnTop).toEqual([{ scope: scopeKey(scope), amount: FEE }]);
    // The fee is not part of the daily limit ([L58]).
    expect(await ports.journal.ledger.spentSince({ since: new Date(0), category: "transfer" })).toBe(ETH);
    routes.statuses.set(sendHashOf(ports), done(ETH));
    confirmReceipt(ports);
    ports.clock.advance(30_000);
    expect(await t.run(intent)).toMatchObject({ status: "completed", received: ETH });
    expect(await holding(ports, foreignEth.chainId, "native", "eoa")).toBe(0n);
    expect(await holding(ports, foreignEth.chainId, "native", "in-transit")).toBe(0n);
    expect(await holding(ports, homeChain, "native", "eoa")).toBe(ETH);
  });

  it("debits an ERC20 input's native fee paid on top from the scope's native holding on the source chain", async () => {
    const { ports, routes, transfers: t } = setup();
    feeQuotes(routes, FEE);
    const intent = await parentWithHolding(ports);
    await creditNative(ports, foreignEth.chainId, FEE);
    expect(await t.run(intent)).toMatchObject({ step: "approve" });
    expect(await t.run(intent)).toMatchObject({ step: "send" });
    expect(await t.run(intent)).toMatchObject({ step: "bridging" });
    expect(bridgeSubmissions(ports)[0]!.request.value).toBe(FEE);
    expect(await holding(ports, foreignEth.chainId, "native", "eoa")).toBe(0n);
    expect(await holding(ports, usdc.chainId, usdc.address, "eoa")).toBe(0n);
    expect(await holding(ports, usdc.chainId, usdc.address, "in-transit")).toBe(AMOUNT);
  });

  it("refuses a fee paid on top the scope's native holding cannot cover: nothing is created or signed", async () => {
    const { ports, routes, transfers: t } = setup();
    feeQuotes(routes, FEE);
    const native = await nativeParent(ports, ETH); // the input only
    expect(await t.run(native)).toMatchObject({
      status: "deferred",
      reason: expect.stringMatching(/^policy-rejected: value: .*paid on top/),
    });
    expect(await ports.journal.listOperations({ kind: "transfer" })).toHaveLength(0);
    expect(ports.executor.submissions).toHaveLength(0);

    const second = setup();
    feeQuotes(second.routes, FEE);
    const token = await parentWithHolding(second.ports); // no native holding at all on the source chain
    expect(await second.transfers.run(token)).toMatchObject({
      status: "deferred",
      reason: expect.stringMatching(/^policy-rejected: value: .*paid on top/),
    });
    expect(await second.ports.journal.listOperations({ kind: "transfer" })).toHaveLength(0);
    expect(second.ports.executor.submissions).toHaveLength(0);
  });

  it("re-checks the fee cover before the bracket: short, the leg goes back to requote, nothing debited", async () => {
    const { ports, routes, transfers: t } = setup();
    feeQuotes(routes, FEE);
    const intent = await nativeParent(ports, ETH + FEE);
    expect(await t.run(intent)).toMatchObject({ step: "send" });
    const entry = {
      scope,
      chainId: foreignEth.chainId,
      asset: "native" as const,
      location: "eoa" as const,
      amount: 1n,
      operationId: "other-op",
      reason: "test",
    };
    await ports.journal.ledger.debit(entry);
    expect(await t.run(intent)).toMatchObject({
      status: "in-progress",
      step: expect.stringMatching(/^policy-rejected: value: /),
    });
    expect((await childOf(ports)).step).toBe("requote");
    expect(bridgeSubmissions(ports)).toHaveLength(0);
    expect(await holding(ports, foreignEth.chainId, "native", "eoa")).toBe(ETH + FEE - 1n);
    expect(await holding(ports, foreignEth.chainId, "native", "in-transit")).toBe(0n);
    expect(await ports.journal.ledger.spentSince({ since: new Date(0), category: "transfer" })).toBe(0n);
    await ports.journal.ledger.credit(entry);
    expect(await drive(t, ports, intent, 3)).toMatchObject({ step: "bridging" });
    expect(await holding(ports, foreignEth.chainId, "native", "eoa")).toBe(0n);
  });

  it("credits the fee back with the input when the send fails unsigned, and debits it once on retry", async () => {
    const { ports, routes, transfers: t } = setup();
    let failures = 1;
    ports.executor.script((request) => request.to === FAKE_LIFI_DIAMOND && failures-- > 0, {
      status: "failed",
      error: "simulation reverted revertData=none",
    });
    feeQuotes(routes, FEE);
    const intent = await nativeParent(ports, ETH + FEE);
    await t.run(intent);
    expect(await t.run(intent)).toMatchObject({ step: expect.stringMatching(/send failed/) });
    expect(await holding(ports, foreignEth.chainId, "native", "eoa")).toBe(ETH + FEE);
    expect(await holding(ports, foreignEth.chainId, "native", "in-transit")).toBe(0n);
    expect((await payloadOf(ports)).legs[0]!.feesOnTop).toEqual([]);
    expect(await t.run(intent)).toMatchObject({ step: "bridging" });
    expect(await holding(ports, foreignEth.chainId, "native", "eoa")).toBe(0n);
    expect(await holding(ports, foreignEth.chainId, "native", "in-transit")).toBe(ETH);
    expect(bridgeSubmissions(ports).map((s) => s.options.idempotencyKey)).toEqual([
      expect.stringMatching(/:step:send-0$/),
      expect.stringMatching(/:step:send-0:1$/),
    ]);
    expect(bridgeSubmissions(ports)[1]!.request.value).toBe(ETH + FEE);
  });

  it("moves the fee back with the input when a send:submit resume is blocked by the policy", async () => {
    const { ports, routes, transfers: t } = setup();
    feeQuotes(routes, FEE);
    const intent = await nativeParent(ports, ETH + FEE);
    expect(await t.run(intent)).toMatchObject({ step: "send" });
    await crashAtSubmit(ports, t, intent);
    expect(await holding(ports, foreignEth.chainId, "native", "eoa")).toBe(0n);
    expect(await holding(ports, foreignEth.chainId, "native", "in-transit")).toBe(ETH);
    routes.verdict.violations = ["target: revoked since the quote"];
    expect(await t.run(intent)).toMatchObject({ step: expect.stringMatching(/^policy-rejected: target:/) });
    expect(await holding(ports, foreignEth.chainId, "native", "eoa")).toBe(ETH + FEE);
    expect(await holding(ports, foreignEth.chainId, "native", "in-transit")).toBe(0n);
    expect(bridgeSubmissions(ports)).toHaveLength(0);
  });

  it("moves back and re-sends a send:submit leg whose bracket an older version wrote without the fee", async () => {
    const { ports, routes, transfers: t } = setup();
    feeQuotes(routes, FEE);
    const intent = await nativeParent(ports, ETH + FEE);
    expect(await t.run(intent)).toMatchObject({ step: "send" });
    await crashAtSubmit(ports, t, intent);
    // The record an older version wrote: no `feesOnTop`, and the fee never debited.
    const child = await childOf(ports);
    const state = child.stepPayload as unknown as { legs: Record<string, unknown>[] };
    const legacy = { ...state.legs[0]! };
    delete legacy.feesOnTop;
    await ports.journal.updateOperation(child.id, {
      stepPayload: { ...state, legs: [legacy] } as unknown as typeof child.stepPayload,
    });
    await creditNative(ports, foreignEth.chainId, FEE);
    expect(await t.run(intent)).toMatchObject({ step: "send" });
    expect(await holding(ports, foreignEth.chainId, "native", "eoa")).toBe(ETH + FEE);
    expect(await holding(ports, foreignEth.chainId, "native", "in-transit")).toBe(0n);
    expect(await t.run(intent)).toMatchObject({ step: "bridging" });
    expect(await holding(ports, foreignEth.chainId, "native", "eoa")).toBe(0n);
    expect(bridgeSubmissions(ports)).toHaveLength(1);
    expect(bridgeSubmissions(ports)[0]!.options.idempotencyKey).toMatch(/:step:send-0:1$/);
    expect(bridgeSubmissions(ports)[0]!.request.value).toBe(ETH + FEE);
  });

  it("debits a continuation swap's fee paid on top from the native holding on the destination chain", async () => {
    const { ports, routes, transfers: t, intent } = await atContinuation();
    routes.quotes.unshift({
      match: (r) => r.fromChainId === homeChain,
      result: (r) => ({
        kind: "quote",
        quote: withFeeOnTop(quoteFor(r, { estimatedOutput: ETH, minimumOutput: (98n * ETH) / 100n }), FEE),
      }),
    });
    await creditNative(ports, homeChain, FEE);
    let outcome = await t.run(intent);
    for (let i = 0; i < 4 && outcome.status === "in-progress" && outcome.step !== "bridging"; i++) {
      outcome = await t.run(intent);
    }
    expect(outcome).toMatchObject({ status: "in-progress", step: "bridging" });
    const continuation = bridgeSubmissions(ports).at(-1)!;
    expect(continuation.request).toMatchObject({ chainId: homeChain, value: FEE });
    expect(await holding(ports, homeChain, "native", "eoa")).toBe(0n);
    expect((await payloadOf(ports)).legs[1]!.feesOnTop).toEqual([{ scope: scopeKey(scope), amount: FEE }]);
  });

  it("resumes a crash at the fee debit inside the bracket to attention, with nothing submitted", async () => {
    const { ports, routes, transfers: t } = setup();
    feeQuotes(routes, FEE);
    const intent = await parentWithHolding(ports);
    await creditNative(ports, foreignEth.chainId, FEE);
    expect(await t.run(intent)).toMatchObject({ step: "approve" });
    expect(await t.run(intent)).toMatchObject({ step: "send" });
    const debit = ports.journal.ledger.debit.bind(ports.journal.ledger);
    let crashes = 1;
    const spy = vi.spyOn(ports.journal.ledger, "debit").mockImplementation(async (entry) => {
      if (entry.asset === "native" && crashes-- > 0) throw new Error("simulated crash");
      return debit(entry);
    });
    expect(await t.run(intent)).toMatchObject({ step: expect.stringMatching(/^error: simulated crash/) });
    spy.mockRestore();
    expect(await t.run(intent)).toMatchObject({
      status: "attention",
      reason: expect.stringMatching(/ledger bracket "send:debiting"/),
    });
    expect(bridgeSubmissions(ports)).toHaveLength(0);
  });

  // Row 3: a continuation leg without a route is bounded like a policy-blocked one ([L64]).

  it("(e) no route: a continuation warns per tick, then goes to eoa and attention, freeing its slot", async () => {
    const { ports, routes, transfers: t, intent } = await atContinuation({ continuationBlockedMaxTicks: 3 });
    routes.quotes.unshift({
      match: (r) => r.fromChainId === homeChain,
      result: { kind: "no-route", reason: "LI.FI 404 code 1002" },
    });
    const continuationId = (await childOf(ports)).id;
    const other = await parentWithHolding(ports);
    for (let tick = 1; tick <= 2; tick++) {
      expect(await t.run(intent)).toMatchObject({
        status: "in-progress",
        step: "awaiting-route: LI.FI 404 code 1002",
      });
      expect(await holding(ports, homeChain, homeUsdc.address, "in-transit")).toBe(BRIDGED);
      const warnings = ports.notifier.sent.filter((n) => n.title === "LI.FI continuation swap has no route");
      expect(warnings).toHaveLength(tick);
      expect(new Set(warnings.map((w) => w.dedupKey)).size).toBe(1);
      ports.clock.advance(30_000);
    }
    // The continuation holds its inbound slot while it waits for a route.
    expect(await drive(t, ports, other, 3)).toMatchObject({ step: `awaiting-inbound-slot: ${continuationId}` });
    expect(await t.run(intent)).toMatchObject({ status: "attention" });
    const child = (await ports.journal.listOperations({ kind: "transfer", parentId: intent.parentOperationId }))[0]!;
    expect(child.lastError).toMatch(/continuation blocked for lack of a LI\.FI route after 3 ticks/);
    expect(await holding(ports, homeChain, homeUsdc.address, "in-transit")).toBe(0n);
    expect(await holding(ports, homeChain, homeUsdc.address, "eoa")).toBe(BRIDGED);
    const critical = ports.notifier.bySeverity("critical");
    expect(critical).toHaveLength(1);
    expect(critical[0]!.action).toMatch(/by hand/);
    expect(critical[0]!.action).not.toMatch(/allowedAssets/);
    expect(await drive(t, ports, other, 6)).toMatchObject({ step: "bridging" });
  });

  it("(e) a continuation whose quote requests keep failing is bounded by age", async () => {
    const { ports, routes, transfers: t, intent } = await atContinuation({ continuationBlockedMaxTicks: 100 });
    routes.quotes.unshift({
      match: (r) => r.fromChainId === homeChain,
      result: () => {
        throw new Error("LI.FI quote failed: HTTP 500");
      },
    });
    expect(await t.run(intent)).toMatchObject({
      status: "in-progress",
      step: "awaiting-route: quote failed: LI.FI quote failed: HTTP 500",
    });
    ports.clock.advance(1_800_000);
    expect(await t.run(intent)).toMatchObject({ status: "in-progress" });
    ports.clock.advance(1_800_001); // past statusTimeoutSeconds (3600) from the first blocked tick
    expect(await t.run(intent)).toMatchObject({ status: "attention" });
    expect(await holding(ports, homeChain, homeUsdc.address, "in-transit")).toBe(0n);
    expect(await holding(ports, homeChain, homeUsdc.address, "eoa")).toBe(BRIDGED);
    expect(ports.notifier.bySeverity("critical")).toHaveLength(1);
  });

  it("(a) a first leg without a route at requote stays open and unbounded", async () => {
    const { ports, routes, transfers: t } = setup({ lifi: { continuationBlockedMaxTicks: 2 } });
    const intent = await parentWithHolding(ports);
    expect(await t.run(intent)).toMatchObject({ step: "approve" });
    routes.verdict.violations = ["spender: revoked since the quote"];
    expect(await t.run(intent)).toMatchObject({ step: expect.stringMatching(/^policy-rejected: spender:/) });
    routes.verdict.violations = [];
    expect((await childOf(ports)).step).toBe("requote");
    routes.quotes.unshift({ match: () => true, result: { kind: "no-route", reason: "1002" } });
    for (let i = 0; i < 4; i++) {
      expect(await t.run(intent)).toMatchObject({ status: "in-progress", step: "awaiting-route: 1002" });
      ports.clock.advance(3_600_000);
    }
    expect((await childOf(ports)).status).toBe("open");
    expect(ports.notifier.bySeverity("critical")).toHaveLength(0);
    expect(await holding(ports, usdc.chainId, usdc.address, "eoa")).toBe(AMOUNT);
  });
});
