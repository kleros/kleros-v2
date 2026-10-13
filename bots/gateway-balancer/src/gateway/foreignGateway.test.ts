import { decodeFunctionData } from "viem";
import { describe, expect, it } from "vitest";
import { foreignGatewayAbi } from "../contracts/abi";
import { EXAMPLE_ADDRESSES, EXAMPLE_CHAINS, FAKE_SIGNER, makeFakePorts, type ReadCall } from "../testing";
import { createGatewayAdapters } from ".";

const ZERO = "0x0000000000000000000000000000000000000000";

function setup(keeper: string = FAKE_SIGNER) {
  const ports = makeFakePorts();
  const chain = ports.chains.get(EXAMPLE_CHAINS.foreignEth)!;
  chain.blockNumber = 4242n;
  // availableFees returns (total, jurorFees, bridgingFees).
  const balances: Record<string, readonly [bigint, bigint, bigint]> = {
    [ZERO]: [10n ** 18n, 7n * 10n ** 17n, 3n * 10n ** 17n],
    [EXAMPLE_ADDRESSES.usdcOnForeignEth.toLowerCase()]: [500_000_000n, 450_000_000n, 50_000_000n],
  };
  const gateway = (call: ReadCall) => call.address.toLowerCase() === EXAMPLE_ADDRESSES.foreignGatewayEth.toLowerCase();
  chain.onRead(
    (call) => call.functionName === "availableFees" && gateway(call),
    (call: ReadCall) => balances[String(call.args?.[0]).toLowerCase()]
  );
  chain.onRead((call) => call.functionName === "keeper" && gateway(call), keeper);
  const treasury = createGatewayAdapters(ports).treasuries.get("eth-home")!;
  return { ports, chain, treasury };
}

describe("ForeignGateway treasury adapter", () => {
  it("reads availableFees once per collected asset and tags every entry with one block read", async () => {
    const { chain, treasury } = setup();
    const reads: ReadCall[] = [];
    const original = chain.readContract.bind(chain);
    chain.readContract = (async (call: ReadCall) => {
      reads.push(call);
      return original(call);
    }) as typeof chain.readContract;
    let blockReads = 0;
    const originalBlock = chain.getBlockNumber.bind(chain);
    chain.getBlockNumber = async () => {
      blockReads += 1;
      return originalBlock();
    };

    const balances = await treasury.balances();
    expect(blockReads).toBe(1);
    expect(reads.map((r) => [r.functionName, r.args])).toEqual([
      ["availableFees", [ZERO]],
      ["availableFees", [EXAMPLE_ADDRESSES.usdcOnForeignEth]],
    ]);
    expect(reads.every((r) => r.abi === foreignGatewayAbi)).toBe(true);
    expect(balances.map((b) => b.asset.symbol)).toEqual(["ETH", "USDC"]);
    expect(balances[0]).toMatchObject({
      total: 10n ** 18n,
      arbitration: 7n * 10n ** 17n,
      bridging: 3n * 10n ** 17n,
      atBlock: 4242n,
    });
    expect(balances[1]).toMatchObject({
      total: 500_000_000n,
      arbitration: 450_000_000n,
      bridging: 50_000_000n,
      atBlock: 4242n,
    });
  });

  it("encodes withdrawFees(token, jurorFees, bridgingFees) per category", async () => {
    const { treasury, ports } = setup();
    const [eth, usdc] = ports.config.topology.pairs[1]!.collectedAssets as [never, never];
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
    expect(decodeFunctionData({ abi: foreignGatewayAbi, data: tx.data! })).toEqual({
      functionName: "withdrawFees",
      args: [EXAMPLE_ADDRESSES.usdcOnForeignEth, 123n, 0n],
    });

    const native = await treasury.withdrawTx({ category: "bridging", asset: eth, amount: 5n, recipient: FAKE_SIGNER });
    expect(decodeFunctionData({ abi: foreignGatewayAbi, data: native.data! })).toEqual({
      functionName: "withdrawFees",
      args: [ZERO, 0n, 5n],
    });
  });

  it("refuses a recipient other than the signer, a non-positive amount and an asset the pair does not collect", async () => {
    const { treasury, ports } = setup();
    const usdc = ports.config.topology.pairs[1]!.collectedAssets[1]!;
    const base = { category: "arbitration", asset: usdc, amount: 1n, recipient: FAKE_SIGNER } as const;
    await expect(treasury.withdrawTx({ ...base, recipient: EXAMPLE_ADDRESSES.homeGatewayEth })).rejects.toThrow(
      /not the balancer EOA/
    );
    await expect(treasury.withdrawTx({ ...base, amount: 0n })).rejects.toThrow(/positive/);
    await expect(treasury.withdrawTx({ ...base, amount: -1n })).rejects.toThrow(/positive/);
    await expect(
      treasury.withdrawTx({ ...base, asset: { ...usdc, address: EXAMPLE_ADDRESSES.wethOnHome } })
    ).rejects.toThrow(/not collected/);
  });

  it("refuses a gateway whose keeper is not the signer", async () => {
    const { treasury, ports } = setup(EXAMPLE_ADDRESSES.homeGatewayEth);
    const eth = ports.config.topology.pairs[1]!.collectedAssets[0]!;
    await expect(
      treasury.withdrawTx({ category: "bridging", asset: eth, amount: 1n, recipient: FAKE_SIGNER })
    ).rejects.toThrow(/not the keeper/);
  });
});
