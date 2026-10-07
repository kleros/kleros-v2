import {
  decodeFunctionData,
  encodeFunctionData,
  getAddress,
  pad,
  parseAbi,
  toFunctionSelector,
  zeroAddress,
  zeroHash,
} from "viem";
import type { Address, ChainId, Hex } from "../domain";

/**
 * Decodes the LI.FI Diamond calldata the bot is about to sign (decisions [L1], [L16]). The selectors are the ones
 * found in the recorded quotes under `fixtures/` (see `README.md`); any other selector, and any payload that does
 * not decode against its entry point, is a rejection. Violations start with `calldata:` and name the field.
 *
 * Two families:
 * - bridge entry points take `ILiFi.BridgeData` first (receiver, destination chain, sending asset, amount, source
 *   swaps, destination call), then for the `swapAndStart…` variants `LibSwap.SwapData[]`, then facet data that may
 *   carry its own receiver;
 * - same-chain swap entry points (GenericSwapFacet) carry `(transactionId, integrator, referrer, receiver,
 *   minAmountOut, SwapData[])` and no destination chain.
 */

export const LIFI_CALLDATA_ABI = parseAbi([
  "struct BridgeData { bytes32 transactionId; string bridge; string integrator; address referrer; address sendingAssetId; address receiver; uint256 minAmount; uint256 destinationChainId; bool hasSourceSwaps; bool hasDestinationCall; }",
  "struct SwapData { address callTo; address approveTo; address sendingAssetId; address receivingAssetId; uint256 fromAmount; bytes callData; bool requiresDeposit; }",
  "struct LayerSwapData { bytes32 requestId; address depositoryReceiver; address receiver; bytes32 nonEVMReceiver; bytes signature; uint256 deadline; }",
  "struct GasZipData { bytes32 receiverAddress; uint256 destinationChains; }",
  // 0x4c279d6b: quote-base-eth-to-arbitrum-eth.json, quote-base-usdc-to-arbitrum-eth.json (tool layerswap).
  "function swapAndStartBridgeTokensViaLayerSwap(BridgeData _bridgeData, SwapData[] _swapData, LayerSwapData _layerSwapData) payable",
  // 0x606326ff: quote-arc-usdc-to-arbitrum-eth.json (tool gasZipBridge).
  "function swapAndStartBridgeTokensViaGasZip(BridgeData _bridgeData, SwapData[] _swapData, GasZipData _gasZipData) payable",
  // 0x2c57e884: quote-base-usdc-to-base-eth.json (same-chain swap, tool okx).
  "function swapTokensMultipleV3ERC20ToNative(bytes32 _transactionId, string _integrator, string _referrer, address _receiver, uint256 _minAmountOut, SwapData[] _swapData)",
]);

/**
 * The entry points a `SwapData.callData` may call (decisions [L34]), from the recorded quotes: LI.FI's fee forwarder
 * (`callTo` the fee collector of Base and Arc) and the OKX DEX router's `dagSwapTo` (Base). Any other selector, a
 * payload that does not decode or that carries bytes beyond its ABI encoding (an appended commission) is rejected.
 */
export const SWAP_CALL_ABI = parseAbi([
  "struct FeeShare { address recipient; uint256 amount; }",
  "struct OkxBaseRequest { uint256 fromToken; address toToken; uint256 fromTokenAmount; uint256 minReturnAmount; uint256 deadLine; }",
  "struct OkxRouterPath { address[] mixAdapters; address[] assetTo; uint256[] rawData; bytes[] extraData; uint256 fromToken; }",
  // 0x0e8ae67f: the fee step of quote-base-eth-to-arbitrum-eth.json and quote-arc-usdc-to-arbitrum-eth.json.
  "function forwardNativeFees(FeeShare[] fees) payable",
  // 0x332d746b: the fee step of quote-base-usdc-to-arbitrum-eth.json and quote-base-usdc-to-base-eth.json.
  "function forwardERC20Fees(address token, FeeShare[] fees)",
  // 0x0c307f76: the okx step of quote-base-usdc-to-base-eth.json.
  "function dagSwapTo(uint256 orderId, address receiver, OkxBaseRequest baseRequest, OkxRouterPath[] paths) payable",
]);

export const ALLOWED_SWAP_SELECTORS: Readonly<Record<Hex, string>> = Object.fromEntries(
  SWAP_CALL_ABI.filter((item) => item.type === "function").map((item) => [toFunctionSelector(item), item.name])
);

/** OKX's placeholder for the native token. */
const OKX_NATIVE = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

type Family = "bridge" | "swap";

/**
 * The LI.FI tool key each bridge facet belongs to (decisions [L44]): a LayerSwap entry point is accepted only on a
 * quote whose `tool` is `layerswap`, a GasZip one only with `gasZipBridge` (the keys of the recorded quotes).
 */
const FACET_TOOLS: Readonly<Record<string, string>> = {
  swapAndStartBridgeTokensViaLayerSwap: "layerswap",
  swapAndStartBridgeTokensViaGasZip: "gasZipBridge",
};

/** The selectors the policy accepts, each with its decoder family and, for a bridge facet, its tool. */
export const ALLOWED_SELECTORS: Readonly<Record<Hex, { name: string; family: Family; tool: string | null }>> =
  Object.fromEntries(
    LIFI_CALLDATA_ABI.filter((item) => item.type === "function").map((item) => [
      toFunctionSelector(item),
      {
        name: item.name,
        family: item.name.startsWith("swapTokens") ? "swap" : "bridge",
        tool: FACET_TOOLS[item.name] ?? null,
      },
    ])
  );

/** gas.zip's own destination ids (`GasZipData.destinationChains`, one byte per chain). */
const GASZIP_CHAIN_IDS: Readonly<Record<number, bigint>> = { 42161: 57n };

export interface CalldataExpectation {
  signer: Address;
  /** The quote's `tool`: a bridge facet must belong to it, and `BridgeData.bridge` must name it. */
  tool: string;
  fromChainId: ChainId;
  toChainId: ChainId;
  /** Token addresses as the Diamond sees them: the zero address for a native asset. */
  fromToken: Address;
  toToken: Address;
  /** The quote's input in the source chain's units. */
  inputAmount: bigint;
  /** The quote's minimum output in the destination chain's units. */
  minimumOutput: bigint;
  /** What the bridge receives after source swaps (LI.FI's fee collection), from the quote's bridge step. */
  bridgeInput?: { token: Address; amount: bigint };
  /**
   * The quote's own source-chain steps, in order; when given, `SwapData[]` must match it item by item (count,
   * assets, amounts, the step's approval address).
   */
  sourceSwaps?: readonly {
    tool: string;
    fromToken: Address;
    toToken: Address;
    fromAmount: bigint;
    approvalAddress: Address | null;
    /** The step's own estimated and minimum output, when reported (a fee step's output is its input less the fee). */
    toAmount?: bigint | null;
    toAmountMin?: bigint | null;
  }[];
  /** `allowedSwapContracts` of the source chain: every `SwapData.callTo` and `approveTo` must be one of them. */
  swapContracts: readonly Address[];
  /** `layerSwapDepositories` of the source chain. */
  layerSwapDepositories: readonly Address[];
  /** The contract the transaction calls (the LI.FI Diamond): a swap may pay its output back to it. */
  diamond: Address;
  /** `feeRecipients` of the source chain: who LI.FI's fee forwarder may pay, besides the signer and the Diamond. */
  feeRecipients: readonly Address[];
  /** `lifi.maxFeeBps`: the most a fee forward may pay, as a share of its item's input (decisions [L41]). */
  maxFeeBps: number;
}

interface SwapData {
  callTo: Address;
  approveTo: Address;
  sendingAssetId: Address;
  receivingAssetId: Address;
  fromAmount: bigint;
  callData: Hex;
  requiresDeposit: boolean;
}

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

/**
 * Every `SwapData` item, not only the ends: each `callTo` and `approveTo` is an allowlisted swap contract, only the
 * first item pulls the input (`requiresDeposit`), the assets form one chain (each item receives what the next one
 * sends), the first item spends exactly the input and the last delivers `finalToken`; when the quote reports its
 * source steps, the items match them one to one.
 */
function checkSwaps(
  violations: string[],
  label: string,
  swaps: readonly SwapData[],
  expected: CalldataExpectation,
  finalToken: Address | null
) {
  const first = swaps[0];
  const last = swaps[swaps.length - 1];
  if (!first || !last) {
    violations.push(`calldata: ${label} SwapData[] is empty`);
    return;
  }
  const allowed = (address: Address) => expected.swapContracts.some((a) => same(a, address));
  swaps.forEach((swap, i) => {
    const at = `SwapData[${i}]`;
    if (!allowed(swap.callTo)) violations.push(`calldata: ${at}.callTo ${swap.callTo} is not an allowed swap contract`);
    if (!allowed(swap.approveTo)) {
      violations.push(`calldata: ${at}.approveTo ${swap.approveTo} is not an allowed swap contract`);
    }
    violations.push(...checkSwapCall(swap, i, expected, expected.sourceSwaps?.[i]));
    if (swap.requiresDeposit !== (i === 0)) {
      violations.push(`calldata: ${at}.requiresDeposit is ${swap.requiresDeposit} (only the first item deposits)`);
    }
    const next = swaps[i + 1];
    if (next && !same(swap.receivingAssetId, next.sendingAssetId)) {
      violations.push(
        `calldata: ${at}.receivingAssetId ${swap.receivingAssetId} is not SwapData[${i + 1}].sendingAssetId ` +
          `${next.sendingAssetId}`
      );
    }
  });
  if (!same(first.sendingAssetId, expected.fromToken)) {
    violations.push(
      `calldata: SwapData[0].sendingAssetId ${first.sendingAssetId} is not the input ${expected.fromToken}`
    );
  }
  if (first.fromAmount !== expected.inputAmount) {
    violations.push(
      `calldata: SwapData[0].fromAmount ${first.fromAmount} differs from the input ${expected.inputAmount}`
    );
  }
  if (finalToken !== null && !same(last.receivingAssetId, finalToken)) {
    violations.push(
      `calldata: SwapData[${swaps.length - 1}].receivingAssetId ${last.receivingAssetId} is not ${finalToken}`
    );
  }
  const steps = expected.sourceSwaps;
  if (steps === undefined) return;
  if (steps.length !== swaps.length) {
    violations.push(`calldata: ${swaps.length} SwapData items, the quote reports ${steps.length} source steps`);
    return;
  }
  steps.forEach((step, i) => {
    const swap = swaps[i]!;
    const at = `SwapData[${i}]`;
    if (!same(swap.sendingAssetId, step.fromToken) || !same(swap.receivingAssetId, step.toToken)) {
      violations.push(
        `calldata: ${at} swaps ${swap.sendingAssetId}->${swap.receivingAssetId}, the quote's ${step.tool} step ` +
          `${step.fromToken}->${step.toToken}`
      );
    }
    if (swap.fromAmount !== step.fromAmount) {
      violations.push(
        `calldata: ${at}.fromAmount ${swap.fromAmount} differs from the quote's ${step.tool} step ${step.fromAmount}`
      );
    }
    if (step.approvalAddress !== null && !same(swap.approveTo, step.approvalAddress)) {
      violations.push(
        `calldata: ${at}.approveTo ${swap.approveTo} is not the quote's ${step.tool} approval address ` +
          `${step.approvalAddress}`
      );
    }
  });
}

/**
 * One `SwapData` item's own `callData` (decisions [L34]): the entry point must be one the recorded quotes use, decode
 * exactly (no trailing bytes), and agree with the item and the quote. A fee forward pays only the configured fee
 * recipients (or the signer or the Diamond) and exactly the fee the quote reports for that step; a DEX swap pays its
 * output to the Diamond or the signer, spends exactly the item's input and keeps at least the step's minimum output.
 */
function checkSwapCall(
  swap: SwapData,
  index: number,
  expected: CalldataExpectation,
  step: NonNullable<CalldataExpectation["sourceSwaps"]>[number] | undefined
): string[] {
  const at = `SwapData[${index}].callData`;
  const selector = swap.callData.slice(0, 10).toLowerCase() as Hex;
  const name = ALLOWED_SWAP_SELECTORS[selector];
  if (swap.callData.length < 10 || !name) return [`calldata: ${at} selector ${selector} is not an allowed swap call`];
  let decoded;
  try {
    decoded = decodeFunctionData({ abi: SWAP_CALL_ABI, data: swap.callData });
  } catch (error) {
    const detail = error instanceof Error ? error.message.split("\n")[0] : String(error);
    return [`calldata: ${at} ${name} cannot be decoded (${detail})`];
  }
  const canonical = encodeFunctionData({ abi: SWAP_CALL_ABI, ...decoded } as Parameters<typeof encodeFunctionData>[0]);
  if (canonical.toLowerCase() !== swap.callData.toLowerCase()) {
    return [`calldata: ${at} ${name} carries bytes beyond its encoding`];
  }
  const violations: string[] = [];
  const payee = (address: Address) =>
    same(address, expected.signer) ||
    same(address, expected.diamond) ||
    expected.feeRecipients.some((a) => same(a, address));
  if (decoded.functionName === "forwardNativeFees" || decoded.functionName === "forwardERC20Fees") {
    const fees = decoded.functionName === "forwardNativeFees" ? decoded.args[0] : decoded.args[1];
    const token = decoded.functionName === "forwardNativeFees" ? zeroAddress : decoded.args[0];
    if (!same(token, swap.sendingAssetId) || !same(swap.sendingAssetId, swap.receivingAssetId)) {
      violations.push(`calldata: ${at} ${name} forwards ${token} on an item swapping ${swap.sendingAssetId}`);
    }
    let total = 0n;
    fees.forEach((fee, i) => {
      total += fee.amount;
      if (fee.amount > 0n && !payee(fee.recipient)) {
        violations.push(
          `calldata: ${at} fee ${i} pays ${fee.amount} to ${fee.recipient}, not an allowed fee recipient`
        );
      }
    });
    // The forwarded total must be exactly the quote's own fee step (decisions [L41]); unknown is a rejection.
    const quoted = step?.toAmount != null ? step.fromAmount - step.toAmount : null;
    if (quoted === null) {
      violations.push(`calldata: ${at} forwards ${total} in fees, the quote reports no fee step to compare`);
    } else if (total !== quoted) {
      violations.push(`calldata: ${at} forwards ${total} in fees, the quote's ${step!.tool} step charges ${quoted}`);
    }
    if (total * 10_000n > BigInt(expected.maxFeeBps) * swap.fromAmount) {
      violations.push(
        `calldata: ${at} forwards ${total} in fees, over maxFeeBps ${expected.maxFeeBps} of the item's ${swap.fromAmount}`
      );
    }
    return violations;
  }
  const [, receiver, base] = decoded.args;
  if (!same(receiver, expected.signer) && !same(receiver, expected.diamond)) {
    violations.push(`calldata: ${at} dagSwapTo receiver ${receiver} is neither the Diamond nor the signer`);
  }
  if (base.fromToken !== BigInt(swap.sendingAssetId)) {
    violations.push(
      `calldata: ${at} dagSwapTo fromToken 0x${base.fromToken.toString(16)} is not ${swap.sendingAssetId}`
    );
  }
  const toToken = same(base.toToken, OKX_NATIVE) ? zeroAddress : base.toToken;
  if (!same(toToken, swap.receivingAssetId)) {
    violations.push(`calldata: ${at} dagSwapTo toToken ${base.toToken} is not ${swap.receivingAssetId}`);
  }
  if (base.fromTokenAmount !== swap.fromAmount) {
    violations.push(
      `calldata: ${at} dagSwapTo amount ${base.fromTokenAmount} differs from the item's ${swap.fromAmount}`
    );
  }
  const floor = step?.toAmountMin ?? 1n;
  if (base.minReturnAmount < floor) {
    violations.push(`calldata: ${at} dagSwapTo minReturnAmount ${base.minReturnAmount} is under ${floor}`);
  }
  return violations;
}

/** Every violation of one transaction's calldata against the quote it belongs to; empty when it may be signed. */
export function checkCalldata(data: Hex | undefined, expected: CalldataExpectation): string[] {
  if (!data || data.length < 10) return ["calldata: no selector"];
  const selector = data.slice(0, 10).toLowerCase() as Hex;
  const entry = ALLOWED_SELECTORS[selector];
  if (!entry) return [`calldata: selector ${selector} is not an allowed LI.FI entry point`];
  let decoded;
  try {
    decoded = decodeFunctionData({ abi: LIFI_CALLDATA_ABI, data });
  } catch (error) {
    const detail = error instanceof Error ? error.message.split("\n")[0] : String(error);
    return [`calldata: ${entry.name} payload cannot be decoded (${detail})`];
  }
  const sameChain = expected.fromChainId === expected.toChainId;
  const violations: string[] = [];
  if (entry.family === "swap") {
    if (!sameChain) return [`calldata: same-chain swap ${entry.name} on a cross-chain route`];
    if (decoded.functionName !== "swapTokensMultipleV3ERC20ToNative") return [`calldata: unexpected ${entry.name}`];
    const [, , , receiver, minAmountOut, swaps] = decoded.args;
    if (!same(receiver, expected.signer)) violations.push(`calldata: receiver ${receiver} is not the signer`);
    if (minAmountOut < expected.minimumOutput) {
      violations.push(`calldata: minAmountOut ${minAmountOut} is under the quoted minimum ${expected.minimumOutput}`);
    }
    checkSwaps(violations, entry.name, swaps, expected, expected.toToken);
    return violations;
  }

  if (sameChain) return [`calldata: bridge ${entry.name} on a same-chain route`];
  if (decoded.functionName === "swapTokensMultipleV3ERC20ToNative") return [`calldata: unexpected ${entry.name}`];
  const [bridge, swaps] = decoded.args;
  if (entry.tool !== expected.tool) {
    violations.push(`calldata: ${entry.name} is a ${entry.tool} facet, the quote's tool is ${expected.tool}`);
  }
  if (bridge.bridge !== expected.tool) {
    violations.push(`calldata: BridgeData.bridge ${bridge.bridge} is not the quote's tool ${expected.tool}`);
  }
  if (!same(bridge.receiver, expected.signer)) {
    violations.push(`calldata: BridgeData.receiver ${bridge.receiver} is not the signer`);
  }
  if (bridge.destinationChainId !== BigInt(expected.toChainId)) {
    violations.push(
      `calldata: BridgeData.destinationChainId ${bridge.destinationChainId} is not the route's ${expected.toChainId}`
    );
  }
  if (bridge.hasDestinationCall) violations.push("calldata: BridgeData.hasDestinationCall is set");
  if (bridge.hasSourceSwaps) {
    checkSwaps(violations, entry.name, swaps, expected, bridge.sendingAssetId);
    if (!expected.bridgeInput) {
      violations.push("calldata: BridgeData.minAmount cannot be checked (the quote reports no post-swap amount)");
    } else {
      if (!same(bridge.sendingAssetId, expected.bridgeInput.token)) {
        violations.push(
          `calldata: BridgeData.sendingAssetId ${bridge.sendingAssetId} is not the bridged ` +
            `${expected.bridgeInput.token}`
        );
      }
      if (bridge.minAmount !== expected.bridgeInput.amount) {
        violations.push(
          `calldata: BridgeData.minAmount ${bridge.minAmount} differs from the post-swap amount ` +
            `${expected.bridgeInput.amount}`
        );
      }
    }
  } else {
    if (swaps.length > 0) violations.push("calldata: SwapData[] present while BridgeData.hasSourceSwaps is false");
    if (!same(bridge.sendingAssetId, expected.fromToken)) {
      violations.push(
        `calldata: BridgeData.sendingAssetId ${bridge.sendingAssetId} is not the input ${expected.fromToken}`
      );
    }
    if (bridge.minAmount !== expected.inputAmount) {
      violations.push(
        `calldata: BridgeData.minAmount ${bridge.minAmount} differs from the input ${expected.inputAmount}`
      );
    }
  }

  // Facet data that carries its own receiver or destination.
  if (decoded.functionName === "swapAndStartBridgeTokensViaLayerSwap") {
    const facet = decoded.args[2];
    if (!same(facet.receiver, expected.signer)) {
      violations.push(`calldata: LayerSwapData.receiver ${facet.receiver} is not the signer`);
    }
    if (facet.nonEVMReceiver !== zeroHash) {
      violations.push(`calldata: LayerSwapData.nonEVMReceiver ${facet.nonEVMReceiver} is set`);
    }
    // The facet verifies LayerSwap's signature over the request; the depository is pinned by the operator on top.
    if (!expected.layerSwapDepositories.some((a) => same(a, facet.depositoryReceiver))) {
      violations.push(
        `calldata: LayerSwapData.depositoryReceiver ${facet.depositoryReceiver} is not an allowed LayerSwap depository`
      );
    }
  } else if (decoded.functionName === "swapAndStartBridgeTokensViaGasZip") {
    const facet = decoded.args[2];
    // gas.zip left-aligns the EVM address in the bytes32 (as recorded).
    const expectedReceiver = pad(expected.signer, { dir: "right", size: 32 });
    if (!same(facet.receiverAddress, expectedReceiver)) {
      violations.push(`calldata: GasZipData.receiverAddress ${facet.receiverAddress} is not the signer`);
    }
    const gasZipId = GASZIP_CHAIN_IDS[expected.toChainId];
    if (gasZipId === undefined) {
      violations.push(`calldata: GasZipData.destinationChains has no known gas.zip id for ${expected.toChainId}`);
    } else if (facet.destinationChains !== gasZipId) {
      violations.push(
        `calldata: GasZipData.destinationChains ${facet.destinationChains} is not ${gasZipId} ` +
          `(chain ${expected.toChainId})`
      );
    }
  }
  return violations;
}

/** The Diamond's token address for an asset address of the bot (`native` is the zero address). */
export function diamondToken(address: string): Address {
  return address === "native" ? zeroAddress : getAddress(address);
}
