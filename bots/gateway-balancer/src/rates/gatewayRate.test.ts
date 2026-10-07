import { decodeFunctionData, encodeErrorResult, toFunctionSelector } from "viem";
import { describe, expect, it } from "vitest";
import { EXAMPLE_ADDRESSES, EXAMPLE_CHAINS, FakeChainClient } from "../testing";
import { RATE_ERROR_REJECTIONS, foreignGatewayRateAbi } from "./abi/foreignGatewayRate";
import { ForeignGatewayRateAdapter, classifyRateRejection } from "./gatewayRate";

const E18 = 10n ** 18n;
const GATEWAY = EXAMPLE_ADDRESSES.foreignGatewayUsdc;

function adapter(rate: bigint, updatedAt: bigint, decimals?: number) {
  const chain = new FakeChainClient(EXAMPLE_CHAINS.foreignUsdc);
  chain.onRead((c) => c.address === GATEWAY && c.functionName === "currencyRate", [rate, updatedAt]);
  return new ForeignGatewayRateAdapter("usdc-home", EXAMPLE_CHAINS.foreignUsdc, GATEWAY, chain, decimals);
}

const errorArgs: Record<string, readonly unknown[]> = {
  RateUpdateCooldown: [1767229200n],
  RateChangeTooLarge: [3000n * E18, 4000n * E18],
  RateOutOfBounds: [6000n * E18, 1500n * E18, 5000n * E18],
  RateUpdaterUnauthorized: ["0x1000000000000000000000000000000000000001"],
};

function executorForm(errorName: string): string {
  const data = encodeErrorResult({ abi: foreignGatewayRateAbi, errorName, args: errorArgs[errorName] } as never);
  return `simulation failed: The contract function "updateCurrencyRate" reverted. revertData=${data}`;
}

describe("ForeignGatewayRateAdapter", () => {
  it("converts the contract's scale to 1e18", async () => {
    expect(await adapter(245_632_000_000n, 1767225000n, 8).currentRate()).toEqual({
      rateE18: 2456_320_000_000_000_000_000n,
      updatedAt: new Date(1767225000 * 1000),
    });
    expect(await adapter(3000n * E18, 0n).currentRate()).toEqual({ rateE18: 3000n * E18, updatedAt: null });
  });

  it("encodes updateCurrencyRate from the fragment at the contract's scale", async () => {
    const tx = await adapter(0n, 0n, 8).updateRateTx(2456_329_999_999_999_999_999n);
    expect(tx).toMatchObject({ chainId: EXAMPLE_CHAINS.foreignUsdc, to: GATEWAY, value: 0n });
    expect(tx.data!.slice(0, 10)).toBe(toFunctionSelector("updateCurrencyRate(uint256)"));
    expect(decodeFunctionData({ abi: foreignGatewayRateAbi, data: tx.data! })).toEqual({
      functionName: "updateCurrencyRate",
      args: [245_632_999_999n],
    });
    const full = await adapter(0n, 0n).updateRateTx(3000n * E18);
    expect(decodeFunctionData({ abi: foreignGatewayRateAbi, data: full.data! }).args).toEqual([3000n * E18]);
    await expect(adapter(0n, 0n).updateRateTx(0n)).rejects.toThrow();
  });

  it.each(Object.entries(RATE_ERROR_REJECTIONS))("classifies %s as %s", (errorName, rejection) => {
    const rate = adapter(0n, 0n);
    expect(rate.classifyRejection(executorForm(errorName))).toBe(rejection);
    expect(rate.classifyRejection(new Error(executorForm(errorName)))).toBe(rejection);
  });

  it("covers every custom error of the fragment", () => {
    const errors = foreignGatewayRateAbi.filter((item) => item.type === "error").map((item) => item.name);
    expect(Object.keys(RATE_ERROR_REJECTIONS).sort()).toEqual([...errors].sort());
    expect(new Set(Object.values(RATE_ERROR_REJECTIONS))).toEqual(
      new Set(["cooldown", "max-change", "out-of-bounds", "unauthorized"])
    );
  });

  it.each([
    ["revertData=none", "execution reverted: RateUpdateCooldown revertData=none"],
    [
      "a foreign selector",
      `reverted revertData=${encodeErrorResult({
        abi: [{ type: "error", name: "Error", inputs: [{ name: "message", type: "string" }] }],
        errorName: "Error",
        args: ["RateUpdateCooldown"],
      })}`,
    ],
    ["an unknown selector", "reverted revertData=0xdeadbeef"],
    ["non-hex data", "reverted revertData=0xzzzz"],
    ["odd-length data", "reverted revertData=0x123"],
    ["a selector shorter than 4 bytes", "reverted revertData=0x12"],
    ["free text naming the error", "execution reverted: RateUpdateCooldown(1767229200)"],
    ["revertData not at the end", `${executorForm("RateUpdateCooldown")} (retrying)`],
    ["an empty string", ""],
  ])("classifies %s as unknown", (_, text) => {
    expect(classifyRateRejection(text)).toBe("unknown");
  });

  it("classifies non-string inputs as unknown", () => {
    expect(classifyRateRejection(undefined)).toBe("unknown");
    expect(classifyRateRejection({ rejection: "cooldown" })).toBe("unknown");
  });
});
