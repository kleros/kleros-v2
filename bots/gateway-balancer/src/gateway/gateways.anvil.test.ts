import {
  createPublicClient,
  createWalletClient,
  encodeDeployData,
  encodeErrorResult,
  encodeFunctionData,
  http,
  parseEther,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import bytecode from "../contracts/bytecode.json";
import { foreignGatewayAbi, homeGatewayAbi, testErc20Abi, uupsProxyAbi } from "../contracts/abi";
import type { Address, Asset, TxRequest } from "../domain";
import { ViemChainClient } from "../platform/chains/chainClient";
import { ANVIL_ACCOUNTS, startAnvil, type AnvilInstance } from "../platform/testkit/anvil";
import { ForeignGatewayTreasuryAdapter } from "./foreignGateway";
import { HomeGatewayFundingAdapter } from "./homeGateway";

const CHAIN_ID = 31337;
const ZERO: Address = "0x0000000000000000000000000000000000000000";
const COURT_ID = 1n;
const MIN_JURORS = 3n;
const FEE_FOR_JUROR = parseEther("0.01");
const HOME_NATIVE_RATE = 2n * 10n ** 18n;
const BRIDGING_COST = parseEther("0.003");

const governor = privateKeyToAccount(ANVIL_ACCOUNTS[0]!.privateKey);
const keeper = privateKeyToAccount(ANVIL_ACCOUNTS[1]!.privateKey);
const extraData: Hex = `0x${COURT_ID.toString(16).padStart(64, "0")}${MIN_JURORS.toString(16).padStart(64, "0")}`;

let anvil: AnvilInstance;
let publicClient: ReturnType<typeof createPublicClient>;
let wallets: Map<Address, ReturnType<typeof createWalletClient>>;

/** Signs and sends with the named account and waits for the receipt. */
async function sendTx(from: typeof governor, request: TxRequest) {
  const hash = await wallets.get(from.address)!.sendTransaction({
    account: from,
    chain: null,
    to: request.to,
    value: request.value,
    data: request.data,
  });
  return publicClient.waitForTransactionReceipt({ hash });
}

async function send(from: typeof governor, request: TxRequest): Promise<"success" | "reverted"> {
  return (await sendTx(from, request)).status;
}

async function deploy(from: typeof governor, abi: readonly unknown[], code: string, args: readonly unknown[]) {
  const data = encodeDeployData({ abi, bytecode: code as Hex, args } as never);
  const hash = await wallets.get(from.address)!.sendTransaction({ account: from, chain: null, data, to: null });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  expect(receipt.status).toBe("success");
  return receipt.contractAddress as Address;
}

function deployProxy(implementation: Address, initData: Hex): Promise<Address> {
  return deploy(governor, uupsProxyAbi, bytecode.uupsProxy, [implementation, initData]);
}

beforeAll(async () => {
  anvil = await startAnvil(CHAIN_ID);
  publicClient = createPublicClient({ transport: http(anvil.url) });
  wallets = new Map(
    [governor, keeper].map((account) => [account.address, createWalletClient({ account, transport: http(anvil.url) })])
  );
});

afterAll(async () => {
  await anvil.stop();
});

describe("treasury and funding adapters against the compiled gateways", () => {
  const plain = (n: number): Address => `0x${n.toString(16).padStart(40, "0")}` as Address;
  let foreignAddress: Address;
  let tokenAddress: Address;
  let treasury: ForeignGatewayTreasuryAdapter;
  let native: Asset;
  let token: Asset;
  const available = async (asset: Address) =>
    publicClient.readContract({
      address: foreignAddress,
      abi: foreignGatewayAbi,
      functionName: "availableFees",
      args: [asset],
    });

  beforeAll(async () => {
    const oracle = (n: number) => ({
      outboundReporter: plain(0x100 + n),
      outboundAdapter: plain(0x200 + n),
      inboundAdapter: plain(0x300 + n),
      enabled: true,
    });
    const implementation = await deploy(governor, foreignGatewayAbi, bytecode.foreignGateway, []);
    const initData = encodeFunctionData({
      abi: foreignGatewayAbi,
      functionName: "initialize",
      args: [
        governor.address,
        keeper.address,
        42161n,
        plain(0x400),
        plain(0x401),
        plain(0x402),
        HOME_NATIVE_RATE,
        [oracle(0), oracle(1)],
        [0n],
        1n,
      ],
    });
    foreignAddress = await deployProxy(implementation, initData);
    tokenAddress = await deploy(governor, testErc20Abi, bytecode.testErc20, ["Test", "TST"]);

    // Governor-side setup of the fixture (the bot never does this).
    const call = (functionName: string, args: readonly unknown[]) =>
      send(governor, {
        chainId: CHAIN_ID,
        to: foreignAddress,
        value: 0n,
        data: encodeFunctionData({ abi: foreignGatewayAbi, functionName, args } as never),
      });
    expect(await call("changeCourtJurorFee", [COURT_ID, FEE_FOR_JUROR])).toBe("success");
    expect(await call("setOracleBridgingCost", [0n, BRIDGING_COST])).toBe("success");
    expect(await call("changeAcceptedFeeTokens", [tokenAddress, true])).toBe("success");
    expect(await call("changeCurrencyRates", [tokenAddress, 3n, 0])).toBe("success");

    // One native and one TestERC20 dispute, created by the governor account as the arbitrable.
    const nativeCost = await publicClient.readContract({
      address: foreignAddress,
      abi: foreignGatewayAbi,
      functionName: "arbitrationCost",
      args: [extraData],
    });
    expect(
      await send(governor, {
        chainId: CHAIN_ID,
        to: foreignAddress,
        value: nativeCost,
        data: encodeFunctionData({
          abi: foreignGatewayAbi,
          functionName: "createDispute",
          args: [2n, extraData],
        }),
      })
    ).toBe("success");
    const tokenCost = await publicClient.readContract({
      address: foreignAddress,
      abi: foreignGatewayAbi,
      functionName: "arbitrationCost",
      args: [extraData, tokenAddress],
    });
    expect(
      await send(governor, {
        chainId: CHAIN_ID,
        to: tokenAddress,
        value: 0n,
        data: encodeFunctionData({
          abi: testErc20Abi,
          functionName: "approve",
          args: [foreignAddress, tokenCost],
        }),
      })
    ).toBe("success");
    expect(
      await send(governor, {
        chainId: CHAIN_ID,
        to: foreignAddress,
        value: 0n,
        data: encodeFunctionData({
          abi: foreignGatewayAbi,
          functionName: "createDispute",
          args: [2n, extraData, tokenAddress, tokenCost],
        }),
      })
    ).toBe("success");

    native = { chainId: CHAIN_ID, address: "native", symbol: "ETH", decimals: 18 };
    token = { chainId: CHAIN_ID, address: tokenAddress, symbol: "TST", decimals: 18 };
    const chain = new ViemChainClient(CHAIN_ID, http(anvil.url), (text) => text);
    treasury = new ForeignGatewayTreasuryAdapter("anvil", chain, foreignAddress, [native, token], keeper.address);
  });

  const balanceOf = async (asset: Address, holder: Address) =>
    asset === ZERO
      ? publicClient.getBalance({ address: holder })
      : publicClient.readContract({
          address: asset,
          abi: testErc20Abi,
          functionName: "balanceOf",
          args: [holder],
        });

  it("balances() equals the contract's availableFees split for both assets", async () => {
    const [nativeFees, tokenFees] = await Promise.all([available(ZERO), available(tokenAddress)]);
    expect(nativeFees[1]).toBeGreaterThan(0n);
    expect(nativeFees[2]).toBe(BRIDGING_COST);
    expect(tokenFees[1]).toBeGreaterThan(0n);
    expect(tokenFees[2]).toBeGreaterThan(0n);
    const balances = await treasury.balances();
    expect(balances.map((b) => [b.asset.symbol, b.total, b.arbitration, b.bridging])).toEqual([
      ["ETH", nativeFees[0], nativeFees[1], nativeFees[2]],
      ["TST", tokenFees[0], tokenFees[1], tokenFees[2]],
    ]);
  });

  for (const [label, category] of [
    ["juror fees", "arbitration"],
    ["bridging fees", "bridging"],
  ] as const) {
    for (const assetKey of ["native", "token"] as const) {
      it(`withdraws ${label} of the ${assetKey} asset to the keeper and lowers only that category`, async () => {
        const asset = assetKey === "native" ? native : token;
        const address = assetKey === "native" ? ZERO : tokenAddress;
        const before = await available(address);
        const index = category === "arbitration" ? 1 : 2;
        const amount = before[index]! / 2n;
        expect(amount).toBeGreaterThan(0n);
        const keeperBefore = await balanceOf(address, keeper.address);
        const tx = await treasury.withdrawTx({ category, asset, amount, recipient: keeper.address });
        const receipt = await sendTx(keeper, tx);
        expect(receipt.status).toBe("success");
        const gasCost = assetKey === "native" ? receipt.gasUsed * receipt.effectiveGasPrice : 0n;
        const after = await available(address);
        expect(after[index]).toBe(before[index]! - amount);
        expect(after[3 - index]).toBe(before[3 - index]);
        expect(after[0]).toBe(before[0] - amount);
        expect((await balanceOf(address, keeper.address)) - keeperBefore + gasCost).toBe(amount);
      });
    }
  }

  it("reverts a withdrawal above a category with InsufficientFees", async () => {
    const before = await available(ZERO);
    const tx = await treasury.withdrawTx({
      category: "bridging",
      asset: native,
      amount: before[2] + 1n,
      recipient: keeper.address,
    });
    const chain = new ViemChainClient(CHAIN_ID, http(anvil.url), (text) => text);
    const selector = encodeErrorResult({ abi: foreignGatewayAbi, errorName: "InsufficientFees" });
    await expect(chain.estimateGas(tx, keeper.address)).rejects.toThrow(new RegExp(`${selector}|InsufficientFees`));
    expect(await available(ZERO)).toEqual(before);
  });

  it("raises the HomeGateway's native balance by a depositTx", async () => {
    const implementation = await deploy(governor, homeGatewayAbi, bytecode.homeGateway, []);
    const initData = encodeFunctionData({
      abi: homeGatewayAbi,
      functionName: "initialize",
      args: [
        governor.address,
        plain(0x500),
        BigInt(CHAIN_ID),
        foreignAddress,
        plain(0x501),
        plain(0x502),
        [{ outboundReporter: plain(0x503), outboundAdapter: plain(0x504), inboundAdapter: plain(0x505) }],
      ],
    });
    const homeAddress = await deployProxy(implementation, initData);
    const chain = new ViemChainClient(CHAIN_ID, http(anvil.url), (text) => text);
    const home = new HomeGatewayFundingAdapter("anvil", chain, homeAddress);
    const before = await home.availableNative();
    const amount = parseEther("0.25");
    const tx = await home.depositTx(amount);
    expect(tx.data).toBeUndefined();
    expect(await send(keeper, tx)).toBe("success");
    expect(await home.availableNative()).toBe(before + amount);
  });
});
