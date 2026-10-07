import { decodeFunctionData, encodeFunctionData, getAddress, pad } from "viem";
import { describe, expect, it } from "vitest";
import type { Address, Hex } from "../domain";
import type { RouteRequest } from "../ports";
import { FakeClock, FakeJournal, FakePriceOracle } from "../testing";
import { ALLOWED_SELECTORS, ALLOWED_SWAP_SELECTORS, LIFI_CALLDATA_ABI, SWAP_CALL_ABI, checkCalldata } from "./calldata";
import { LifiClient } from "./client";
import type { LifiConfig } from "./config";
import { LifiRouteProvider } from "./provider";
import {
  ASSETS,
  BASE_USDC,
  FEE_COLLECTOR_BASE,
  LIFI_FEE_WALLET,
  OKX_APPROVE_BASE,
  SIGNER,
  ZERO,
  fixture,
  mainnetConfig,
} from "./testSupport";

const OTHER: Address = getAddress("0x00000000000000000000000000000000000000ee");

interface Recorded {
  file: string;
  request: RouteRequest;
}

const base = { sender: SIGNER, recipient: SIGNER, purpose: "refill" as const };
const RECORDED: Record<string, Recorded> = {
  baseEth: {
    file: "quote-base-eth-to-arbitrum-eth.json",
    request: {
      ...base,
      fromChainId: 8453,
      fromAsset: ASSETS.baseEth,
      toChainId: 42161,
      toAsset: ASSETS.arbEth,
      amount: 5n * 10n ** 16n,
    },
  },
  baseUsdc: {
    file: "quote-base-usdc-to-arbitrum-eth.json",
    request: {
      ...base,
      fromChainId: 8453,
      fromAsset: ASSETS.baseUsdc,
      toChainId: 42161,
      toAsset: ASSETS.arbEth,
      amount: 100_000_000n,
    },
  },
  baseSwap: {
    file: "quote-base-usdc-to-base-eth.json",
    request: {
      ...base,
      fromChainId: 8453,
      fromAsset: ASSETS.baseUsdc,
      toChainId: 8453,
      toAsset: ASSETS.baseEth,
      amount: 100_000_000n,
    },
  },
  arc: {
    file: "quote-arc-usdc-to-arbitrum-eth.json",
    request: {
      ...base,
      fromChainId: 5042,
      fromAsset: ASSETS.arcUsdc,
      toChainId: 42161,
      toAsset: ASSETS.arbEth,
      amount: 100n * 10n ** 18n,
    },
  },
};

type QuoteBody = { tool: string; transactionRequest: { data: Hex } };

/**
 * Evaluates a recorded quote, optionally with its `transactionRequest.data` or other fields rewritten, through the
 * real provider. The configuration is the fixtures' own (`approvingLifiConfig`, which names the recorded fee wallet).
 */
async function evaluate(
  name: keyof typeof RECORDED,
  rewrite?: (data: Hex) => Hex,
  options: { lifi?: Partial<LifiConfig>; body?: (body: QuoteBody) => void } = {}
): Promise<string[]> {
  const { file, request } = RECORDED[name]!;
  const body = fixture<QuoteBody>(file);
  if (rewrite) body.transactionRequest.data = rewrite(body.transactionRequest.data);
  options.body?.(body);
  const config = mainnetConfig(options.lifi);
  const clock = new FakeClock(new Date("2026-10-06T12:00:00Z"));
  const journal = new FakeJournal(() => clock.now());
  const fetchStub = (async () => new Response(JSON.stringify(body), { status: 200 })) as unknown as typeof fetch;
  const provider = new LifiRouteProvider({
    client: new LifiClient({ fetch: fetchStub, config: config.lifi, chains: config.topology.chains }),
    config: config.lifi,
    priceOracle: new FakePriceOracle().set("ETH", 2700n * 10n ** 18n).set("USDC", 10n ** 18n),
    ledger: journal.ledger,
    clock,
    signer: SIGNER,
  });
  const result = await provider.evaluate(request);
  if (result.kind !== "evaluated") throw new Error(`no quote: ${result.reason}`);
  return result.violations;
}

/** Re-encodes the bridge call with a mutated `BridgeData` / facet data. */
function mutateBridge(
  data: Hex,
  change: (args: { bridge: Record<string, unknown>; facet: Record<string, unknown> }) => void
): Hex {
  const decoded = decodeFunctionData({ abi: LIFI_CALLDATA_ABI, data });
  if (decoded.functionName === "swapTokensMultipleV3ERC20ToNative") throw new Error("not a bridge call");
  const bridge = { ...decoded.args[0] } as Record<string, unknown>;
  const facet = { ...decoded.args[2] } as Record<string, unknown>;
  change({ bridge, facet });
  return encodeFunctionData({
    abi: LIFI_CALLDATA_ABI,
    functionName: decoded.functionName,
    args: [bridge, decoded.args[1], facet],
  } as Parameters<typeof encodeFunctionData>[0]);
}

function mutateSwap(data: Hex, change: (args: unknown[]) => void): Hex {
  const decoded = decodeFunctionData({ abi: LIFI_CALLDATA_ABI, data });
  if (decoded.functionName !== "swapTokensMultipleV3ERC20ToNative") throw new Error("not a swap call");
  const args = [...decoded.args] as unknown[];
  change(args);
  return encodeFunctionData({
    abi: LIFI_CALLDATA_ABI,
    functionName: decoded.functionName,
    args,
  } as Parameters<typeof encodeFunctionData>[0]);
}

type SwapItem = Record<string, unknown>;

/** Re-encodes either family with its `SwapData[]` rewritten (items are copies). */
function mutateSwapItems(data: Hex, change: (items: SwapItem[]) => void): Hex {
  const decoded = decodeFunctionData({ abi: LIFI_CALLDATA_ABI, data });
  const args = [...decoded.args] as unknown[];
  const at = decoded.functionName === "swapTokensMultipleV3ERC20ToNative" ? 5 : 1;
  const items = (args[at] as SwapItem[]).map((item) => ({ ...item }));
  change(items);
  args[at] = items;
  return encodeFunctionData({
    abi: LIFI_CALLDATA_ABI,
    functionName: decoded.functionName,
    args,
  } as Parameters<typeof encodeFunctionData>[0]);
}

/** Re-encodes one `SwapData` item's own `callData` with its decoded arguments rewritten. */
function mutateSwapCall(data: Hex, index: number, change: (args: unknown[]) => void): Hex {
  return mutateSwapItems(data, (items) => {
    const decoded = decodeFunctionData({ abi: SWAP_CALL_ABI, data: items[index]!.callData as Hex });
    const args = [...decoded.args] as unknown[];
    change(args);
    items[index]!.callData = encodeFunctionData({
      abi: SWAP_CALL_ABI,
      functionName: decoded.functionName,
      args,
    } as Parameters<typeof encodeFunctionData>[0]);
  });
}

type Fee = { recipient: Address; amount: bigint };

describe("LI.FI calldata decoding", () => {
  it("derives the allowed selectors from the recorded quotes", () => {
    expect(Object.keys(ALLOWED_SELECTORS).sort()).toEqual(["0x2c57e884", "0x4c279d6b", "0x606326ff"]);
    for (const { file } of Object.values(RECORDED)) {
      const selector = fixture<QuoteBody>(file).transactionRequest.data.slice(0, 10);
      expect(ALLOWED_SELECTORS[selector as Hex]).toBeDefined();
    }
  });

  it("passes every recorded quote, the same-chain swap included", async () => {
    for (const name of Object.keys(RECORDED)) expect(await evaluate(name)).toEqual([]);
  });

  it("rejects a bridge copy whose BridgeData.receiver is not the signer", async () => {
    const violations = await evaluate("baseUsdc", (d) => mutateBridge(d, ({ bridge }) => (bridge.receiver = OTHER)));
    expect(violations).toEqual([`calldata: BridgeData.receiver ${OTHER} is not the signer`]);
  });

  it("rejects a different destination chain", async () => {
    const violations = await evaluate("baseEth", (d) =>
      mutateBridge(d, ({ bridge }) => (bridge.destinationChainId = 10n))
    );
    expect(violations).toEqual(["calldata: BridgeData.destinationChainId 10 is not the route's 42161"]);
  });

  it("rejects hasDestinationCall", async () => {
    const violations = await evaluate("baseEth", (d) =>
      mutateBridge(d, ({ bridge }) => (bridge.hasDestinationCall = true))
    );
    expect(violations).toEqual(["calldata: BridgeData.hasDestinationCall is set"]);
  });

  it("rejects a minAmount or sending asset that contradicts the quote's post-swap amount", async () => {
    const amount = await evaluate("baseUsdc", (d) => mutateBridge(d, ({ bridge }) => (bridge.minAmount = 1n)));
    expect(amount).toEqual(["calldata: BridgeData.minAmount 1 differs from the post-swap amount 99750000"]);
    const asset = await evaluate("arc", (d) => mutateBridge(d, ({ bridge }) => (bridge.sendingAssetId = OTHER)));
    expect(asset.every((v) => v.startsWith("calldata:"))).toBe(true);
    expect(asset.join("; ")).toContain("BridgeData.sendingAssetId");
  });

  it("rejects a bridge copy whose facet data names another receiver", async () => {
    const layerSwap = await evaluate("baseEth", (d) => mutateBridge(d, ({ facet }) => (facet.receiver = OTHER)));
    expect(layerSwap).toEqual([`calldata: LayerSwapData.receiver ${OTHER} is not the signer`]);
    const gasZip = await evaluate("arc", (d) =>
      mutateBridge(d, ({ facet }) => (facet.receiverAddress = pad(OTHER, { dir: "right", size: 32 })))
    );
    expect(gasZip).toHaveLength(1);
    expect(gasZip[0]).toMatch(/^calldata: GasZipData.receiverAddress .* is not the signer$/);
    const gasZipChain = await evaluate("arc", (d) => mutateBridge(d, ({ facet }) => (facet.destinationChains = 54n)));
    expect(gasZipChain).toEqual(["calldata: GasZipData.destinationChains 54 is not 57 (chain 42161)"]);
  });

  it("rejects a swap copy with a different receiver or a lower minAmountOut", async () => {
    const receiver = await evaluate("baseSwap", (d) => mutateSwap(d, (args) => (args[3] = OTHER)));
    expect(receiver).toEqual([`calldata: receiver ${OTHER} is not the signer`]);
    const minimum = await evaluate("baseSwap", (d) => mutateSwap(d, (args) => (args[4] = 1n)));
    expect(minimum).toEqual(["calldata: minAmountOut 1 is under the quoted minimum 36729665493514414"]);
  });

  describe("every SwapData item (nested swaps)", () => {
    const rejects = async (name: keyof typeof RECORDED, change: (items: SwapItem[]) => void, message: string) => {
      const violations = await evaluate(name, (d) => mutateSwapItems(d, change));
      expect(violations.length).toBeGreaterThan(0);
      expect(violations.every((v) => v.startsWith("calldata:"))).toBe(true);
      expect(violations).toContain(message);
    };

    it("rejects SwapData[0] with another sending asset or amount on a bridge with hasSourceSwaps", async () => {
      await rejects(
        "baseUsdc",
        (items) => (items[0]!.sendingAssetId = OTHER),
        `calldata: SwapData[0].sendingAssetId ${OTHER} is not the input ${BASE_USDC}`
      );
      await rejects(
        "baseUsdc",
        (items) => (items[0]!.fromAmount = 1n),
        "calldata: SwapData[0].fromAmount 1 differs from the input 100000000"
      );
      await rejects(
        "baseEth",
        (items) => (items[0]!.fromAmount = 10n ** 18n),
        "calldata: SwapData[0].fromAmount 1000000000000000000 differs from the input 50000000000000000"
      );
    });

    it("rejects a callTo or approveTo outside the allowed swap contracts, on any item", async () => {
      await rejects(
        "baseUsdc",
        (items) => (items[0]!.callTo = OTHER),
        `calldata: SwapData[0].callTo ${OTHER} is not an allowed swap contract`
      );
      await rejects(
        "baseUsdc",
        (items) => (items[0]!.approveTo = OTHER),
        `calldata: SwapData[0].approveTo ${OTHER} is not an allowed swap contract`
      );
      await rejects(
        "baseSwap",
        (items) => (items[1]!.callTo = OTHER),
        `calldata: SwapData[1].callTo ${OTHER} is not an allowed swap contract`
      );
      await rejects(
        "baseSwap",
        (items) => (items[1]!.approveTo = OTHER),
        `calldata: SwapData[1].approveTo ${OTHER} is not an allowed swap contract`
      );
    });

    it("rejects an allowlisted approveTo that is not the quote's own approval address for that step", async () => {
      // The fee collector is allowlisted, but the OKX step's approval address is the OKX proxy.
      await rejects(
        "baseSwap",
        (items) => (items[1]!.approveTo = FEE_COLLECTOR_BASE),
        `calldata: SwapData[1].approveTo ${FEE_COLLECTOR_BASE} is not the quote's okx approval address ` +
          `${OKX_APPROVE_BASE}`
      );
    });

    it("rejects another final receiving asset", async () => {
      await rejects(
        "baseUsdc",
        (items) => (items[0]!.receivingAssetId = OTHER),
        `calldata: SwapData[0].receivingAssetId ${OTHER} is not ${BASE_USDC}`
      );
      await rejects(
        "baseSwap",
        (items) => (items[1]!.receivingAssetId = OTHER),
        `calldata: SwapData[1].receivingAssetId ${OTHER} is not ${ZERO}`
      );
    });

    it("rejects an extra deposit, a missing deposit and a broken asset chain", async () => {
      await rejects(
        "baseSwap",
        (items) => (items[1]!.requiresDeposit = true),
        "calldata: SwapData[1].requiresDeposit is true (only the first item deposits)"
      );
      await rejects(
        "baseUsdc",
        (items) => (items[0]!.requiresDeposit = false),
        "calldata: SwapData[0].requiresDeposit is false (only the first item deposits)"
      );
      await rejects(
        "baseSwap",
        (items) => (items[1]!.sendingAssetId = OTHER),
        `calldata: SwapData[0].receivingAssetId ${BASE_USDC} is not SwapData[1].sendingAssetId ${OTHER}`
      );
    });

    it("rejects an item the quote does not report", async () => {
      await rejects(
        "baseUsdc",
        (items) => items.push({ ...items[0]!, requiresDeposit: false }),
        "calldata: 2 SwapData items, the quote reports 1 source steps"
      );
    });
  });

  describe("every SwapData item's own callData (decisions [L34])", () => {
    it("derives the swap-call selectors from the recorded quotes", () => {
      expect(Object.entries(ALLOWED_SWAP_SELECTORS).sort()).toEqual([
        ["0x0c307f76", "dagSwapTo"],
        ["0x0e8ae67f", "forwardNativeFees"],
        ["0x332d746b", "forwardERC20Fees"],
      ]);
    });

    it("rejects a DEX swap that pays its output to another recipient or keeps less than the step minimum", async () => {
      const receiver = await evaluate("baseSwap", (d) => mutateSwapCall(d, 1, (args) => (args[1] = OTHER)));
      expect(receiver).toEqual([
        `calldata: SwapData[1].callData dagSwapTo receiver ${OTHER} is neither the Diamond nor the signer`,
      ]);
      const minimum = await evaluate("baseSwap", (d) =>
        mutateSwapCall(d, 1, (args) => (args[2] = { ...(args[2] as object), minReturnAmount: 1n }))
      );
      expect(minimum).toEqual([
        "calldata: SwapData[1].callData dagSwapTo minReturnAmount 1 is under 36729665493514414",
      ]);
      const amount = await evaluate("baseSwap", (d) =>
        mutateSwapCall(d, 1, (args) => (args[2] = { ...(args[2] as object), fromTokenAmount: 1n }))
      );
      expect(amount).toEqual(["calldata: SwapData[1].callData dagSwapTo amount 1 differs from the item's 99750000"]);
    });

    it("rejects a fee step that pays someone else or adds a payment", async () => {
      // forwardERC20Fees(token, fees) on Base USDC, forwardNativeFees(fees) on Base ETH and Arc.
      const recipient = await evaluate("baseUsdc", (d) =>
        mutateSwapCall(d, 0, (args) => (args[1] = (args[1] as Fee[]).map((f) => ({ ...f, recipient: OTHER }))))
      );
      expect(recipient).toEqual([
        `calldata: SwapData[0].callData fee 0 pays 250000 to ${OTHER}, not an allowed fee recipient`,
      ]);
      const added = await evaluate("baseSwap", (d) =>
        mutateSwapCall(d, 0, (args) => (args[1] = [...(args[1] as Fee[]), { recipient: LIFI_FEE_WALLET, amount: 1n }]))
      );
      expect(added).toEqual([
        "calldata: SwapData[0].callData forwards 250001 in fees, the quote's feeCollection step charges 250000",
      ]);
      const native = await evaluate("baseEth", (d) =>
        mutateSwapCall(d, 0, (args) => (args[0] = [...(args[0] as Fee[]), { recipient: OTHER, amount: 1n }]))
      );
      expect(native).toEqual([
        `calldata: SwapData[0].callData fee 1 pays 1 to ${OTHER}, not an allowed fee recipient`,
        "calldata: SwapData[0].callData forwards 125000000000001 in fees, the quote's feeCollection step charges " +
          "125000000000000",
      ]);
      const arc = await evaluate("arc", (d) =>
        mutateSwapCall(d, 0, (args) => (args[0] = (args[0] as Fee[]).map((f) => ({ ...f, recipient: OTHER }))))
      );
      expect(arc).toHaveLength(1);
      expect(arc[0]).toMatch(/^calldata: SwapData\[0\]\.callData fee 0 pays .* not an allowed fee recipient$/);
    });

    it("rejects an unknown swap selector, undecodable swap data and bytes appended to it", async () => {
      const unknown = await evaluate("baseSwap", (d) =>
        mutateSwapItems(d, (items) => (items[1]!.callData = `0x12345678${(items[1]!.callData as string).slice(10)}`))
      );
      expect(unknown).toEqual(["calldata: SwapData[1].callData selector 0x12345678 is not an allowed swap call"]);
      const truncated = await evaluate("baseSwap", (d) =>
        mutateSwapItems(d, (items) => (items[1]!.callData = (items[1]!.callData as string).slice(0, 200)))
      );
      expect(truncated).toHaveLength(1);
      expect(truncated[0]).toMatch(/^calldata: SwapData\[1\]\.callData dagSwapTo cannot be decoded/);
      const appended = await evaluate("baseUsdc", (d) =>
        mutateSwapItems(d, (items) => (items[0]!.callData = `${items[0]!.callData as string}${"ab".repeat(32)}`))
      );
      expect(appended).toEqual(["calldata: SwapData[0].callData forwardERC20Fees carries bytes beyond its encoding"]);
    });

    it("rejects a fee forward of another token than the item's", async () => {
      const violations = await evaluate("baseUsdc", (d) => mutateSwapCall(d, 0, (args) => (args[0] = OTHER)));
      expect(violations).toEqual([
        `calldata: SwapData[0].callData forwardERC20Fees forwards ${OTHER} on an item swapping ${BASE_USDC}`,
      ]);
    });
  });

  describe("fee recipients and the fee bound (decisions [L41])", () => {
    it("lets the fee forwarder pay LI.FI's wallet only when this configuration names it", async () => {
      for (const name of Object.keys(RECORDED)) {
        expect(await evaluate(name)).toEqual([]);
        const unconfigured = await evaluate(name, undefined, { lifi: { feeRecipients: [] } });
        expect(unconfigured).toHaveLength(1);
        expect(unconfigured[0]).toMatch(
          new RegExp(`^calldata: SwapData\\[0\\]\\.callData fee 0 pays \\d+ to ${LIFI_FEE_WALLET}, not an allowed`)
        );
      }
    });

    it("bounds the forwarded fee by maxFeeBps of the item's input (the recorded quotes forward 25 bps)", async () => {
      for (const name of Object.keys(RECORDED)) {
        expect(await evaluate(name, undefined, { lifi: { maxFeeBps: 25 } })).toEqual([]);
        const over = await evaluate(name, undefined, { lifi: { maxFeeBps: 24 } });
        expect(over).toHaveLength(1);
        expect(over[0]).toMatch(
          /^calldata: SwapData\[0\]\.callData forwards \d+ in fees, over maxFeeBps 24 of the item's/
        );
      }
    });

    it("defaults maxFeeBps to 100", () => {
      expect(mainnetConfig().lifi.maxFeeBps).toBe(100);
    });
  });

  describe("the bridge facet belongs to the quote's tool (decisions [L44])", () => {
    it("rejects a LayerSwap call on a quote whose tool is another allowlisted bridge, and the reverse", async () => {
      const layerSwap = await evaluate("baseEth", undefined, { body: (b) => (b.tool = "gasZipBridge") });
      expect(layerSwap).toContain(
        "calldata: swapAndStartBridgeTokensViaLayerSwap is a layerswap facet, the quote's tool is gasZipBridge"
      );
      expect(layerSwap).toContain("calldata: BridgeData.bridge layerswap is not the quote's tool gasZipBridge");
      const gasZip = await evaluate("arc", undefined, { body: (b) => (b.tool = "layerswap") });
      expect(gasZip).toContain(
        "calldata: swapAndStartBridgeTokensViaGasZip is a gasZipBridge facet, the quote's tool is layerswap"
      );
    });

    it("rejects BridgeData.bridge naming another bridge than the quote's tool", async () => {
      const violations = await evaluate("baseUsdc", (d) => mutateBridge(d, ({ bridge }) => (bridge.bridge = "across")));
      expect(violations).toEqual(["calldata: BridgeData.bridge across is not the quote's tool layerswap"]);
    });
  });

  it("rejects a LayerSwap depository outside the configured allowlist", async () => {
    const violations = await evaluate("baseEth", (d) =>
      mutateBridge(d, ({ facet }) => (facet.depositoryReceiver = OTHER))
    );
    expect(violations).toEqual([
      `calldata: LayerSwapData.depositoryReceiver ${OTHER} is not an allowed LayerSwap depository`,
    ]);
  });

  it("rejects a truncated payload and an unknown selector", async () => {
    const truncated = await evaluate("baseUsdc", (d) => d.slice(0, d.length / 2) as Hex);
    expect(truncated).toHaveLength(1);
    expect(truncated[0]).toMatch(/^calldata: swapAndStartBridgeTokensViaLayerSwap payload cannot be decoded/);
    const unknown = await evaluate("baseUsdc", (d) => `0x12345678${d.slice(10)}` as Hex);
    expect(unknown).toEqual(["calldata: selector 0x12345678 is not an allowed LI.FI entry point"]);
  });

  it("never passes missing calldata or a family on the wrong kind of route", () => {
    const expected = {
      signer: SIGNER,
      tool: "layerswap",
      maxFeeBps: 100,
      fromChainId: 8453,
      toChainId: 42161,
      fromToken: "0x0000000000000000000000000000000000000000" as Address,
      toToken: "0x0000000000000000000000000000000000000000" as Address,
      inputAmount: 1n,
      minimumOutput: 1n,
      swapContracts: [],
      layerSwapDepositories: [],
      diamond: "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE" as Address,
      feeRecipients: [],
    };
    expect(checkCalldata(undefined, expected)).toEqual(["calldata: no selector"]);
    const swap = fixture<QuoteBody>(RECORDED.baseSwap!.file).transactionRequest.data;
    expect(checkCalldata(swap, expected)).toEqual([
      "calldata: same-chain swap swapTokensMultipleV3ERC20ToNative on a cross-chain route",
    ]);
  });
});
