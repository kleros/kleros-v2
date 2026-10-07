import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseEther } from "viem";
import { describe, expect, it } from "vitest";
import type { Asset } from "../domain";
import type { ForeignGatewayBalance } from "../ports";
import { EXAMPLE_ADDRESSES, EXAMPLE_CHAINS, exampleConfig } from "../testing";
import { pairRefillSettings, refillConfigSchema } from "./config";
import { arbitrationClaimKey, capacityOf, planRefill, shouldTrigger, type PlanInput } from "./planner";

const ETH = 10n ** 18n;
const baseEth: Asset = { chainId: EXAMPLE_CHAINS.foreignEth, address: "native", symbol: "ETH", decimals: 18 };
const baseUsdc: Asset = {
  chainId: EXAMPLE_CHAINS.foreignEth,
  address: EXAMPLE_ADDRESSES.usdcOnForeignEth,
  symbol: "USDC",
  decimals: 6,
};

function settings(refill: object = { referenceCaseCostEth: "0.01" }, pairId = "eth-home") {
  return pairRefillSettings(exampleConfig({ refill }).refill, pairId);
}

function balance(asset: Asset, arbitration: bigint, bridging: bigint): ForeignGatewayBalance {
  return { asset, arbitration, bridging, total: arbitration + bridging, atBlock: 1n };
}

function input(overrides: Partial<PlanInput> = {}): PlanInput {
  return {
    pairId: "eth-home",
    settings: settings(),
    availableNative: 0n,
    balances: [balance(baseEth, ETH / 2n, ETH / 10n), balance(baseUsdc, 600_000_000n, 50_000_000n)],
    openClaims: new Map(),
    // 3000 USD per ETH
    ethValue: (asset, amount) => (asset.symbol === "ETH" ? amount : (amount * 10n ** 12n) / 3000n),
    ...overrides,
  };
}

describe("refill planner", () => {
  it("parses the documented example section", () => {
    const example = JSON.parse(
      readFileSync(join(dirname(fileURLToPath(import.meta.url)), "example-config.json"), "utf8")
    );
    const parsed = refillConfigSchema.parse(example);
    expect(pairRefillSettings(parsed, "arc-arbitrum")).toMatchObject({ referenceCaseCostWei: parseEther("0.0025") });
    expect(pairRefillSettings(parsed, "arc-arbitrum").economicMinimums.USDC).toBe("25");
  });

  it("parses an empty section with the defaults", () => {
    const parsed = refillConfigSchema.parse({});
    expect(parsed).toMatchObject({ lowWaterCases: 20, targetCases: 100, depositMethod: "function" });
    expect(parsed.referenceCaseCostEth).toBeUndefined();
  });

  it("triggers strictly below 20 reference cases and not at or above", () => {
    const s = settings();
    const lowWater = 20n * parseEther("0.01");
    expect(capacityOf(lowWater, s)!.lowWater).toBe(lowWater);
    expect(shouldTrigger(capacityOf(lowWater - 1n, s)!)).toBe(true);
    expect(shouldTrigger(capacityOf(lowWater, s)!)).toBe(false);
    expect(shouldTrigger(capacityOf(lowWater + 1n, s)!)).toBe(false);
    expect(planRefill(input({ availableNative: lowWater })).kind).toBe("above-trigger");
    expect(planRefill(input({ availableNative: lowWater - 1n })).kind).toBe("sweep");
    expect(capacityOf(lowWater, s)!.cases).toBe(20);
  });

  it("takes the reference cost, the case counts and per-pair overrides from configuration", () => {
    const custom = settings({
      referenceCaseCostEth: "0.002",
      lowWaterCases: 10,
      pairs: { "eth-home": { referenceCaseCostEth: "0.004", targetCases: 50 } },
    });
    expect(custom.referenceCaseCostWei).toBe(parseEther("0.004"));
    expect(capacityOf(0n, custom)).toMatchObject({ lowWater: parseEther("0.04"), target: parseEther("0.2") });
    const other = settings({ referenceCaseCostEth: "0.002", lowWaterCases: 10 }, "usdc-home");
    expect(capacityOf(0n, other)).toMatchObject({ lowWater: parseEther("0.02"), target: parseEther("0.2") });
    expect(planRefill(input({ availableNative: parseEther("0.039"), settings: custom })).kind).toBe("sweep");
    expect(planRefill(input({ availableNative: parseEther("0.04"), settings: custom })).kind).toBe("above-trigger");
    expect(planRefill(input({ settings: settings({}) }))).toEqual({
      kind: "not-configured",
      reason: "referenceCaseCostEth is not configured",
    });
  });

  it("sweeps every collected asset's arbitration balance (Base: ETH and USDC) and never the bridging category", () => {
    const plan = planRefill(input());
    if (plan.kind !== "sweep") throw new Error(plan.kind);
    expect(plan.sweep).toEqual([
      { asset: baseEth, amount: ETH / 2n, claimKey: `fg:eth-home:arbitration:${EXAMPLE_CHAINS.foreignEth}:native` },
      {
        asset: baseUsdc,
        amount: 600_000_000n,
        claimKey: `fg:eth-home:arbitration:${EXAMPLE_CHAINS.foreignEth}:${EXAMPLE_ADDRESSES.usdcOnForeignEth}`,
      },
    ]);
    expect(plan.sweep.every((s) => !s.claimKey.includes(":bridging:"))).toBe(true);
  });

  it("subtracts open claims on the arbitration key", () => {
    const openClaims = new Map([[arbitrationClaimKey("eth-home", baseEth), ETH / 5n]]);
    const plan = planRefill(input({ openClaims }));
    if (plan.kind !== "sweep") throw new Error(plan.kind);
    expect(plan.sweep[0]!.amount).toBe((3n * ETH) / 10n);
  });

  it("notes a partial refill when the sweep cannot reach the target, and a full one when it can", () => {
    const partial = planRefill(input());
    expect(partial).toMatchObject({ kind: "sweep", partial: true, expectedEth: ETH / 2n + ETH / 5n });
    const full = planRefill(input({ balances: [balance(baseEth, 2n * ETH, 0n)] }));
    expect(full).toMatchObject({ kind: "sweep", partial: false });
    const unpriced = planRefill(input({ ethValue: (a, amount) => (a.symbol === "ETH" ? amount : null) }));
    expect(unpriced).toMatchObject({ kind: "sweep", partial: null, expectedEth: null });
  });

  it("defers amounts under the economic minimum", () => {
    const plan = planRefill(
      input({ balances: [balance(baseEth, parseEther("0.001"), 0n), balance(baseUsdc, 600_000_000n, 0n)] })
    );
    if (plan.kind !== "sweep") throw new Error(plan.kind);
    expect(plan.sweep.map((s) => s.asset.symbol)).toEqual(["USDC"]);
    expect(plan.deferred).toEqual([
      { asset: baseEth, amount: parseEther("0.001"), reason: `under the economic minimum ${parseEther("0.002")}` },
    ]);
    const nothing = planRefill(input({ balances: [balance(baseUsdc, 4_000_000n, ETH)] }));
    expect(nothing).toMatchObject({ kind: "nothing-to-sweep", deferred: [{ amount: 4_000_000n }] });
  });

  it("never claims another pair's balances: claim keys carry the planned pair only", () => {
    const plan = planRefill(input({ pairId: "usdc-home", settings: settings(undefined, "usdc-home") }));
    if (plan.kind !== "sweep") throw new Error(plan.kind);
    expect(plan.sweep.every((s) => s.claimKey.startsWith("fg:usdc-home:arbitration:"))).toBe(true);
  });
});
