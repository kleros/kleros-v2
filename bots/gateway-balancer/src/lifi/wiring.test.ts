import { describe, expect, it } from "vitest";
import type { AccountingScope } from "../domain";
import type { TransferIntent } from "../ports";
import { FAKE_LIFI_DIAMOND, FakePriceOracle, FakeRouteProvider, makeFakePorts, type FakePorts } from "../testing";
import type { LifiConfig } from "./config";
import { createRouteProvider, createTransfers } from "./index";
import { LifiTransfers } from "./transfers";
import {
  ASSETS,
  BASE_USDC,
  QUOTE_ROUTES,
  SIGNER,
  approvingLifiConfig,
  fixtureFetch,
  mainnetConfig,
  simulateAllowances,
  withRecheck,
} from "./testSupport";

/**
 * The production pair, `createRouteProvider` + `createTransfers`, over the recorded quotes (decisions [L55]): the
 * operator revoking a target, spender, tool or limit after a quote blocks its approval and its send.
 */

const ETH = 10n ** 18n;
const scope: AccountingScope = { kind: "arbitration", pairId: "base-arbitrum" };
const AMOUNT = 100_000_000n; // the recorded Base USDC -> Arbitrum ETH quote's input

function productionPair(ports: FakePorts) {
  const priceOracle = new FakePriceOracle().set("ETH", 2700n * ETH).set("USDC", ETH);
  const routeProvider = createRouteProvider(ports, { priceOracle });
  return createTransfers(ports, { routeProvider, priceOracle });
}

/** The same journal, chains and executor under another `lifi` section: the operator's edit and restart. */
function restartedWith(ports: FakePorts, lifi: Partial<LifiConfig>): FakePorts {
  return { ...ports, config: { ...ports.config, lifi: { ...ports.config.lifi, ...lifi } } };
}

async function setup() {
  const base = makeFakePorts(mainnetConfig());
  // The recorded quotes deliver to and are sent from the recorded address: it stands for the bot EOA here.
  const ports: FakePorts = { ...base, signer: SIGNER, fetch: fixtureFetch(QUOTE_ROUTES) };
  simulateAllowances(ports);
  const parent = await ports.journal.createOperation({
    kind: "refill",
    description: "test parent",
    scopes: [scope],
    pairId: "base-arbitrum",
    payload: null,
  });
  await ports.journal.ledger.credit({
    scope,
    chainId: 8453,
    asset: BASE_USDC,
    location: "eoa",
    amount: AMOUNT,
    operationId: parent.id,
    reason: "withdrawn",
  });
  const intent: TransferIntent = {
    parentOperationId: parent.id,
    tag: "withdraw-0",
    fromChainId: 8453,
    fromAsset: ASSETS.baseUsdc,
    amount: AMOUNT,
    toChainId: 42161,
    toAsset: ASSETS.arbEth,
    allocations: [{ scope, amount: AMOUNT }],
    purpose: "refill",
  };
  return { ports, intent, transfers: productionPair(ports) };
}

const approvals = (ports: FakePorts) => ports.executor.submissions.filter((s) => s.request.to === BASE_USDC);
const sends = (ports: FakePorts) =>
  ports.executor.submissions.filter((s) => s.request.to.toLowerCase() === FAKE_LIFI_DIAMOND.toLowerCase());

describe("production pair: createRouteProvider + createTransfers (decisions [L55])", () => {
  const approving = approvingLifiConfig();
  const revocations: [string, Partial<LifiConfig>][] = [
    ["target", { allowedTargets: approving.allowedTargets.filter((t) => t.chainId !== 8453) }],
    ["spender", { allowedSpenders: approving.allowedSpenders.filter((t) => t.chainId !== 8453) }],
    ["tool", { allowedTools: approving.allowedTools.filter((t) => t !== "layerswap") }],
    [
      "limit",
      { limits: approving.limits.map((l) => (l.asset === BASE_USDC ? { ...l, perTransfer: "50", daily: "50" } : l)) },
    ],
  ];

  it.each(revocations)("a revoked %s blocks the already-quoted approval and then the send", async (kind, lifi) => {
    const { ports, intent, transfers } = await setup();
    expect(await transfers.run(intent)).toMatchObject({ status: "in-progress", step: "approve" });
    const revoked = productionPair(restartedWith(ports, lifi));
    const blockedApproval = await revoked.run(intent);
    expect(blockedApproval).toMatchObject({ status: "in-progress", step: expect.stringMatching(/^policy-rejected: /) });
    expect(blockedApproval.status === "in-progress" && blockedApproval.step).toContain(`${kind}:`);
    expect(approvals(ports)).toHaveLength(0);

    // Restored: requote, approve; revoked again before the send: nothing is debited, sent or counted.
    expect(await transfers.run(intent)).toMatchObject({ step: "approve" });
    expect(await transfers.run(intent)).toMatchObject({ step: "send" });
    expect(approvals(ports)).toHaveLength(1);
    const blockedSend = await revoked.run(intent);
    expect(blockedSend.status === "in-progress" && blockedSend.step).toMatch(
      new RegExp(`^policy-rejected: .*${kind}:`)
    );
    expect(sends(ports)).toHaveLength(0);
    const [eoa] = await ports.journal.ledger.holdings({ scope, chainId: 8453, asset: BASE_USDC, location: "eoa" });
    expect(eoa?.amount).toBe(AMOUNT);
    expect(await ports.journal.ledger.spentSince({ since: new Date(0), category: "transfer" })).toBe(0n);

    // Under the approving policy the same operation goes on to the bridge.
    expect(await transfers.run(intent)).toMatchObject({ step: "send" });
    expect(await transfers.run(intent)).toMatchObject({ step: "bridging" });
    expect(sends(ports)).toHaveLength(1);
  });
});

describe("LifiTransfers refuses a route provider without recheck (decisions [L59])", () => {
  it("throws at construction, through createTransfers too", () => {
    const ports = makeFakePorts(mainnetConfig());
    const priceOracle = new FakePriceOracle();
    const bare = new FakeRouteProvider();
    expect(() => new LifiTransfers({ ports, config: ports.config.lifi, routeProvider: bare, priceOracle })).toThrow(
      /needs a route provider with recheck/
    );
    expect(() => createTransfers(ports, { routeProvider: bare, priceOracle })).toThrow(
      /needs a route provider with recheck/
    );
    // The lane's shared test factory wraps the fake, which is then accepted.
    expect(() => createTransfers(ports, { routeProvider: withRecheck(bare), priceOracle })).not.toThrow();
  });
});
