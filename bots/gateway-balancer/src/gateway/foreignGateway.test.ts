import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { decodeFunctionData, type Abi } from "viem";
import { describe, expect, it } from "vitest";
import { EXAMPLE_ADDRESSES, EXAMPLE_CHAINS, FAKE_SIGNER, makeFakePorts, type ReadCall } from "../testing";
import { FEE_CATEGORY, FOREIGN_GATEWAY_TREASURY_ABI } from "./abi/foreignGateway";
import { createGatewayAdapters } from ".";

const here = dirname(fileURLToPath(import.meta.url));
const ZERO = "0x0000000000000000000000000000000000000000";

function setup() {
  const ports = makeFakePorts();
  const chain = ports.chains.get(EXAMPLE_CHAINS.foreignEth)!;
  chain.blockNumber = 4242n;
  const balances: Record<string, readonly [bigint, bigint, bigint]> = {
    [ZERO]: [10n ** 18n, 7n * 10n ** 17n, 3n * 10n ** 17n],
    [EXAMPLE_ADDRESSES.usdcOnForeignEth.toLowerCase()]: [500_000_000n, 450_000_000n, 50_000_000n],
  };
  chain.onRead(
    (call) =>
      call.functionName === "feeBalances" &&
      call.address.toLowerCase() === EXAMPLE_ADDRESSES.foreignGatewayEth.toLowerCase(),
    (call: ReadCall) => balances[String(call.args?.[0]).toLowerCase()]
  );
  const treasury = createGatewayAdapters(ports).treasuries.get("eth-home")!;
  return { ports, treasury };
}

describe("ForeignGateway treasury adapter", () => {
  it("reads one balance per collected asset from the fragment's view through the chain client", async () => {
    const { treasury } = setup();
    const balances = await treasury.balances();
    expect(balances.map((b) => b.asset.symbol)).toEqual(["ETH", "USDC"]);
    expect(balances[0]).toMatchObject({
      total: 10n ** 18n,
      arbitration: 7n * 10n ** 17n,
      bridging: 3n * 10n ** 17n,
      atBlock: 4242n,
    });
    expect(balances[1]).toMatchObject({ total: 500_000_000n, arbitration: 450_000_000n, bridging: 50_000_000n });
  });

  it("encodes the withdrawal with the category, asset, amount and the signer as recipient", async () => {
    const { treasury, ports } = setup();
    const usdc = ports.config.topology.pairs[1]!.collectedAssets[1]!;
    const tx = await treasury.withdrawTx({
      category: "arbitration",
      asset: usdc,
      amount: 123n,
      recipient: FAKE_SIGNER,
    });
    expect(tx).toMatchObject({
      chainId: EXAMPLE_CHAINS.foreignEth,
      to: EXAMPLE_ADDRESSES.foreignGatewayEth,
      value: 0n,
    });
    const decoded = decodeFunctionData({ abi: FOREIGN_GATEWAY_TREASURY_ABI, data: tx.data! });
    expect(decoded.functionName).toBe("withdrawFees");
    expect(decoded.args).toEqual([FEE_CATEGORY.arbitration, EXAMPLE_ADDRESSES.usdcOnForeignEth, 123n, FAKE_SIGNER]);

    const eth = ports.config.topology.pairs[1]!.collectedAssets[0]!;
    const native = await treasury.withdrawTx({ category: "bridging", asset: eth, amount: 5n, recipient: FAKE_SIGNER });
    expect(decodeFunctionData({ abi: FOREIGN_GATEWAY_TREASURY_ABI, data: native.data! }).args).toEqual([
      FEE_CATEGORY.bridging,
      ZERO,
      5n,
      FAKE_SIGNER,
    ]);
  });

  it("refuses a recipient other than the signer and an asset the pair does not collect", async () => {
    const { treasury, ports } = setup();
    const usdc = ports.config.topology.pairs[1]!.collectedAssets[1]!;
    await expect(
      treasury.withdrawTx({
        category: "arbitration",
        asset: usdc,
        amount: 1n,
        recipient: EXAMPLE_ADDRESSES.homeGatewayEth,
      })
    ).rejects.toThrow(/not the balancer EOA/);
    await expect(
      treasury.withdrawTx({
        category: "arbitration",
        asset: { ...usdc, address: EXAMPLE_ADDRESSES.wethOnHome },
        amount: 1n,
        recipient: FAKE_SIGNER,
      })
    ).rejects.toThrow(/not collected/);
  });

  it("keeps the assumed signatures in one fragment file per contract, marked pending", () => {
    const abiDir = join(here, "abi");
    const fragments = readdirSync(abiDir).filter((f) => f.endsWith(".ts"));
    const holders = (name: string) =>
      readdirSync(here)
        .filter((f) => f.endsWith(".ts"))
        .map((f) => join(here, f))
        .concat(fragments.map((f) => join(abiDir, f)))
        .filter((path) => readFileSync(path, "utf8").includes(`name: "${name}"`));
    for (const name of ["feeBalances", "withdrawFees"]) {
      expect(holders(name).map((p) => p.slice(here.length + 1))).toEqual(["abi/foreignGateway.ts"]);
    }
    expect(holders("depositNative").map((p) => p.slice(here.length + 1))).toEqual(["abi/homeGateway.ts"]);
    expect(readFileSync(join(abiDir, "foreignGateway.ts"), "utf8")).toMatch(/PENDING/);
    expect(readFileSync(join(abiDir, "homeGateway.ts"), "utf8")).toMatch(/PENDING/);
    expect((FOREIGN_GATEWAY_TREASURY_ABI as Abi).length).toBe(2);
  });
});
