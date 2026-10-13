import { decodeFunctionData, encodeErrorResult } from "viem";
import { describe, expect, it } from "vitest";
import { foreignGatewayAbi } from "../contracts/abi";
import type { Address, Asset } from "../domain";
import { FakeChainClient } from "../testing";
import { currencyRateKey, ForeignGatewayRatesAdapter, HOME_NATIVE_RATE_KEY } from "./gatewayRates";

const GATEWAY: Address = "0x00000000000000000000000000000000000000a1";
const TOKEN: Address = "0x00000000000000000000000000000000000000c1";
const USDC: Asset = { chainId: 8453, address: TOKEN, symbol: "USDC", decimals: 6 };
const NATIVE: Asset = { chainId: 8453, address: "native", symbol: "ETH", decimals: 18 };
const HOME_NATIVE = { kind: "homeNative" } as const;
const USDC_TARGET = { kind: "token", asset: USDC } as const;

// keccak256(abi.encode("homeNativeRate")) and keccak256(abi.encode("currencyRate", TOKEN)), from `cast keccak`.
const HOME_KEY = "0xf283b590c5d46285c551bc6fe768721e0c2231b3a29f4a98e6f8cecb9bfcbfd2";
const TOKEN_KEY = "0x62d9f2d3f12b0826c41377471f5eb50e4f51242a7851ec9d00c043852746b003";

function setup(last = 1_767_225_000n) {
  const chain = new FakeChainClient(8453);
  const state = { homeNativeRate: 1_000_000_000_000_000_000n, rateInEth: 333_333_333n, rateDecimals: 0, last };
  const lastReads: string[] = [];
  chain.onRead(
    (c) => c.address === GATEWAY && c.functionName === "homeNativeRate",
    () => state.homeNativeRate
  );
  chain.onRead(
    (c) => c.address === GATEWAY && c.functionName === "currencyRates",
    () => [true, state.rateInEth, state.rateDecimals]
  );
  chain.onRead(
    (c) => c.address === GATEWAY && c.functionName === "lastKeeperUpdate",
    (c: { args?: readonly unknown[] }) => {
      lastReads.push(String(c.args?.[0]));
      return state.last;
    }
  );
  chain.onRead(
    (c) => c.functionName === "keeperMaxChangeBps",
    () => 500n
  );
  chain.onRead(
    (c) => c.functionName === "keeperCooldown",
    () => 3600n
  );
  const adapter = new ForeignGatewayRatesAdapter("base-arbitrum", 8453, GATEWAY, chain);
  return { adapter, state, lastReads };
}

describe("lastKeeperUpdate keys", () => {
  it("are keccak256 of the ABI encoding with a dynamic string, not a packed one", () => {
    expect(HOME_NATIVE_RATE_KEY).toBe(HOME_KEY);
    expect(currencyRateKey(TOKEN)).toBe(TOKEN_KEY);
  });
});

describe("ForeignGatewayRatesAdapter", () => {
  it("reads homeNativeRate with 18 decimals and its last keeper update", async () => {
    const { adapter, lastReads } = setup();
    expect(await adapter.current(HOME_NATIVE)).toEqual({
      value: 1_000_000_000_000_000_000n,
      decimals: 18,
      lastKeeperUpdate: new Date(1_767_225_000_000),
    });
    expect(lastReads).toEqual([HOME_KEY]);
  });

  it("reads a token's rateInEth, stored rateDecimals and its last keeper update", async () => {
    const { adapter, state, lastReads } = setup();
    state.rateDecimals = 11;
    state.rateInEth = 60_327_783n;
    expect(await adapter.current(USDC_TARGET)).toEqual({
      value: 60_327_783n,
      decimals: 11,
      lastKeeperUpdate: new Date(1_767_225_000_000),
    });
    expect(lastReads).toEqual([TOKEN_KEY]);
  });

  it("reports a never-updated value as null", async () => {
    const { adapter } = setup(0n);
    expect((await adapter.current(HOME_NATIVE)).lastKeeperUpdate).toBeNull();
    expect((await adapter.current(USDC_TARGET)).lastKeeperUpdate).toBeNull();
  });

  it("rejects the native currency as a token target", async () => {
    const { adapter } = setup();
    await expect(adapter.current({ kind: "token", asset: NATIVE })).rejects.toThrow(/native/);
  });

  it("reads the guardrails", async () => {
    const { adapter } = setup();
    expect(await adapter.guardrails()).toEqual({ maxChangeBps: 500n, cooldownSeconds: 3600n });
  });

  it("encodes changeHomeNativeRate(value) and refuses zero", async () => {
    const { adapter } = setup();
    const tx = await adapter.updateTx(HOME_NATIVE, 3_000n * 10n ** 18n);
    expect(tx).toMatchObject({ chainId: 8453, to: GATEWAY, value: 0n });
    const decoded = decodeFunctionData({ abi: foreignGatewayAbi, data: tx.data! });
    expect(decoded.functionName).toBe("changeHomeNativeRate");
    expect(decoded.args).toEqual([3_000n * 10n ** 18n]);
    await expect(adapter.updateTx(HOME_NATIVE, 0n)).rejects.toThrow(/positive/);
  });

  it("encodes changeCurrencyRates(token, value, storedDecimals)", async () => {
    const { adapter, state } = setup();
    state.rateDecimals = 11;
    const tx = await adapter.updateTx(USDC_TARGET, 61_000_000n);
    const decoded = decodeFunctionData({ abi: foreignGatewayAbi, data: tx.data! });
    expect(decoded.functionName).toBe("changeCurrencyRates");
    expect(decoded.args!.map((a) => (typeof a === "string" ? a.toLowerCase() : a))).toEqual([TOKEN, 61_000_000n, 11]);
  });

  it("refuses a token value above 2^64 - 1 before submission, and accepts the maximum", async () => {
    const { adapter } = setup();
    await expect(adapter.updateTx(USDC_TARGET, 2n ** 64n)).rejects.toThrow(/uint64/);
    await expect(adapter.updateTx(USDC_TARGET, 2n ** 64n - 1n)).resolves.toBeDefined();
  });

  it("maps the contract's keeper errors to rejections", () => {
    const { adapter } = setup();
    const revert = (errorName: string) =>
      `execution reverted revertData=${encodeErrorResult({ abi: foreignGatewayAbi, errorName, args: [] } as never)}`;
    expect(adapter.classifyRejection(revert("KeeperCooldownActive"))).toBe("cooldown");
    expect(adapter.classifyRejection(revert("KeeperChangeTooLarge"))).toBe("max-change");
    expect(adapter.classifyRejection(revert("KeeperCannotChangeDecimals"))).toBe("decimals");
    expect(adapter.classifyRejection(revert("InvalidRate"))).toBe("invalid-rate");
    expect(adapter.classifyRejection(revert("GovernorOrKeeperOnly"))).toBe("unauthorized");
    expect(adapter.classifyRejection(revert("InsufficientFees"))).toBe("unknown");
    expect(adapter.classifyRejection("reverted revertData=none")).toBe("unknown");
    expect(adapter.classifyRejection("KeeperCooldownActive")).toBe("unknown");
    expect(adapter.classifyRejection(new Error("boom"))).toBe("unknown");
  });
});
