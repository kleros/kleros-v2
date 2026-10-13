import {
  createWalletClient,
  encodeFunctionData,
  http,
  type Abi,
  type Account,
  type Chain,
  type PublicClient,
  type Transport,
  type WalletClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import bytecode from "../contracts/bytecode.json";
import { foreignGatewayAbi, testErc20Abi, uupsProxyAbi } from "../contracts/abi";
import type { Address, Asset, Hex, TxRequest } from "../domain";
import type { Clock, SubmitOptions, SubmitOutcome, TxExecutor } from "../ports";
import { chainDefinition, makePublicClient, ViemChainClient } from "../platform/chains/chainClient";
import { systemClock } from "../platform/clock";
import { PlatformExecutor } from "../platform/executor/executor";
import { ViemExecutorRpc } from "../platform/executor/rpc";
import { Redactor } from "../platform/redact";
import { ANVIL_ACCOUNTS, startAnvil, type AnvilInstance } from "../platform/testkit/anvil";
import { FakeJournal, FakeLogger, FakeNotifier, FakePriceOracle } from "../testing";
import type { PairConfig } from "../config/schema";
import { ratesConfigSchema } from "./config";
import { ForeignGatewayRatesAdapter } from "./gatewayRates";
import { RateLoop } from "./loop";

const CHAIN_ID = 31337;
const E18 = 10n ** 18n;
const COOLDOWN_SECONDS = 3600;
const governor = privateKeyToAccount(ANVIL_ACCOUNTS[0]!.privateKey);
const keeper = privateKeyToAccount(ANVIL_ACCOUNTS[1]!.privateKey);

/** Total `evm_increaseTime` applied to the chain so far: a new clock starts in lockstep with it. */
let chainOffsetMs = 0;

/** Wall clock shifted in lockstep with the chain: `evm_increaseTime` moves the chain, this moves the bot's view. */
class OffsetClock implements Clock {
  offsetMs = chainOffsetMs;
  now(): Date {
    return new Date(Date.now() + this.offsetMs);
  }
  sleep(ms: number, signal?: AbortSignal): Promise<void> {
    return systemClock.sleep(ms, signal);
  }
}

/** Counts what reaches the executor, so "nothing was submitted" is observed rather than inferred from state. */
class CountingExecutor implements TxExecutor {
  readonly requests: TxRequest[] = [];
  constructor(private readonly inner: PlatformExecutor) {}
  get signer(): Address {
    return this.inner.signer;
  }
  submit(request: TxRequest, options: SubmitOptions): Promise<SubmitOutcome> {
    this.requests.push(request);
    return this.inner.submit(request, options);
  }
  resolve(key: string) {
    return this.inner.resolve(key);
  }
  recover() {
    return this.inner.recover();
  }
}

let anvil: AnvilInstance;
let wallet: WalletClient<Transport, Chain, Account>;
let publicClient: PublicClient<Transport, Chain>;
let gateway: Address;
let token: Address;

async function deploy(abi: Abi, code: Hex, args: unknown[] = []): Promise<Address> {
  const hash = await wallet.deployContract({ abi, bytecode: code, args } as never);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return receipt.contractAddress!;
}

async function asGovernor(functionName: string, args: unknown[]): Promise<void> {
  const hash = await wallet.writeContract({ address: gateway, abi: foreignGatewayAbi, functionName, args } as never);
  await publicClient.waitForTransactionReceipt({ hash });
}

beforeAll(async () => {
  anvil = await startAnvil(CHAIN_ID);
  wallet = createWalletClient({ account: governor, chain: chainDefinition(CHAIN_ID), transport: http(anvil.url) });
  publicClient = makePublicClient(CHAIN_ID, http(anvil.url));
  const implementation = await deploy(foreignGatewayAbi, bytecode.foreignGateway as Hex);
  const adapterA: Address = "0x00000000000000000000000000000000000000a1";
  const adapterB: Address = "0x00000000000000000000000000000000000000a2";
  const init = encodeFunctionData({
    abi: foreignGatewayAbi,
    functionName: "initialize",
    args: [
      governor.address,
      keeper.address,
      42161n,
      "0x00000000000000000000000000000000000000d1",
      "0x00000000000000000000000000000000000000e1",
      "0x00000000000000000000000000000000000000e2",
      2_500n * E18,
      [
        {
          outboundReporter: "0x0000000000000000000000000000000000000000",
          outboundAdapter: adapterA,
          inboundAdapter: adapterB,
          enabled: true,
        },
      ],
      [0n],
      1n,
    ],
  });
  gateway = await deploy(uupsProxyAbi, bytecode.uupsProxy as Hex, [implementation, init]);
  token = await deploy(testErc20Abi, bytecode.testErc20 as Hex, ["USD Coin", "USDC"]);
  // The governor sets the initial token rate and its decimals; the keeper cannot change them.
  await asGovernor("changeCurrencyRates", [token, 400_000_000n, 0]);
}, 120_000);

afterAll(async () => {
  await anvil.stop();
});

/** Moves anvil's time only; `advanceChain` also moves the bot's clock with it. */
async function advanceChainOnly(seconds: number): Promise<void> {
  await anvil.rpc("evm_increaseTime", [seconds]);
  await anvil.rpc("evm_mine");
  chainOffsetMs += seconds * 1000;
}

async function advanceChain(clock: OffsetClock, seconds: number): Promise<void> {
  await advanceChainOnly(seconds);
  clock.offsetMs += seconds * 1000;
}

/** The two loops (homeNative, the TestERC20's currencyRates) run as the keeper through the real executor. */
function harness() {
  const clock = new OffsetClock();
  const journal = new FakeJournal(() => clock.now());
  const notifier = new FakeNotifier();
  const redact = new Redactor([anvil.url]).text;
  const transport = http(anvil.url, { retryCount: 0 });
  const inner = new PlatformExecutor({
    account: keeper,
    chains: new Map([
      [
        CHAIN_ID,
        { chainId: CHAIN_ID, name: "anvil", confirmations: 1, rpc: new ViemExecutorRpc(transport, redact, CHAIN_ID) },
      ],
    ]),
    journal,
    clock,
    logger: new FakeLogger(),
    notifier,
    redact,
    signal: new AbortController().signal,
    options: {
      waitMs: 5_000,
      pollIntervalMs: 50,
      stuckAfterMs: 3_600_000,
      baseFeeMultiplier: 2,
      gasLimitBufferPercent: 20,
      replayMaxAttempts: 5,
      replayMaxAgeMs: 600_000,
    },
  });
  const executor = new CountingExecutor(inner);
  const chain = new ViemChainClient(CHAIN_ID, transport, redact);
  const rates = new ForeignGatewayRatesAdapter("anvil-pair", CHAIN_ID, gateway, chain);

  const usdc: Asset = { chainId: CHAIN_ID, address: token, symbol: "USDC", decimals: 6 };
  const pair: PairConfig = {
    id: "anvil-pair",
    foreignChainId: CHAIN_ID,
    foreignGateway: gateway,
    homeChainId: 42161,
    homeGateway: "0x00000000000000000000000000000000000000d1",
    collectedAssets: [{ chainId: CHAIN_ID, address: "native", symbol: "ETH", decimals: 18 }, usdc],
    rateCurrency: "USD",
  };
  const config = ratesConfigSchema.parse({});
  const oracle = new FakePriceOracle().set("ETH", 3_000n * E18).set("USDC", E18);
  const ports = { journal, executor, notifier, logger: new FakeLogger(), clock };
  const loops = [
    new RateLoop(ports, { pair, rates, target: { kind: "homeNative" }, priceOracle: oracle, config }),
    new RateLoop(ports, { pair, rates, target: { kind: "token", asset: usdc }, priceOracle: oracle, config }),
  ];
  const cycle = async () =>
    (await Promise.all(loops.map((loop) => loop.tick({ now: clock.now(), signal: new AbortController().signal })))).map(
      (r) => r.status
    );
  return { clock, journal, notifier, executor, rates, cycle };
}

async function read(): Promise<{ home: bigint; token: bigint }> {
  return {
    home: await publicClient.readContract({ address: gateway, abi: foreignGatewayAbi, functionName: "homeNativeRate" }),
    token: (
      await publicClient.readContract({
        address: gateway,
        abi: foreignGatewayAbi,
        functionName: "currencyRates",
        args: [token],
      })
    )[1],
  };
}

/** The keeper's nonce (pending included) and balance: what a broadcast transaction would change. */
async function keeperAccount(): Promise<{ nonce: number; balance: bigint }> {
  return {
    nonce: await publicClient.getTransactionCount({ address: keeper.address, blockTag: "pending" }),
    balance: await publicClient.getBalance({ address: keeper.address }),
  };
}

describe("rate loops against a ForeignGateway on anvil", () => {
  it("moves each rate by one allowed step per cooldown, as the keeper", async () => {
    const { clock, notifier, executor, rates, cycle } = harness();

    // The guardrails are the contract's, read by the adapter.
    expect(await rates.guardrails()).toEqual({ maxChangeBps: 500n, cooldownSeconds: BigInt(COOLDOWN_SECONDS) });
    expect(await read()).toEqual({ home: 2_500n * E18, token: 400_000_000n });
    // Set by the governor (init, changeCurrencyRates): the keeper never updated either value.
    expect((await rates.current({ kind: "homeNative" })).lastKeeperUpdate).toBeNull();

    // Cycle 1: one step each. Home 2500 -> 2625 (+5 %, market 3000); token 400M -> 380M (-5 %, market 333M).
    expect(await cycle()).toEqual(["acted", "acted"]);
    expect(executor.requests).toHaveLength(2);
    expect(await read()).toEqual({ home: 2_625n * E18, token: 380_000_000n });
    const afterFirst = await rates.current({ kind: "homeNative" });
    expect(afterFirst.lastKeeperUpdate).not.toBeNull(); // the keeper, not the governor, wrote it

    // An immediate second cycle is held by the cooldown: nothing reaches the executor.
    expect(await cycle()).toEqual(["deferred", "deferred"]);
    expect(executor.requests).toHaveLength(2);
    expect(await read()).toEqual({ home: 2_625n * E18, token: 380_000_000n });

    // Past the cooldown on both clocks, the next step lands.
    await advanceChain(clock, COOLDOWN_SECONDS + 1);
    expect(await cycle()).toEqual(["acted", "acted"]);
    expect(executor.requests).toHaveLength(4);
    expect(await read()).toEqual({ home: 2_756_250_000_000_000_000_000n, token: 361_000_000n });
    expect(notifier.sent).toEqual([]);
  }, 120_000);

  it("rejects for cooldown at no cost with the bot's clock ahead of anvil's, lands once anvil passes it", async () => {
    // Runs after the test above: both values were last updated by the keeper at about anvil's current time.
    const { clock, journal, notifier, executor, rates, cycle } = harness();
    const before = await read();
    const last = (await rates.current({ kind: "homeNative" })).lastKeeperUpdate!;
    // The bot's clock runs past lastKeeperUpdate + cooldown; anvil's latest block does not.
    clock.offsetMs += (COOLDOWN_SECONDS + 5) * 1000;
    const latest = await publicClient.getBlock({ blockTag: "latest" });
    expect(clock.now().getTime()).toBeGreaterThanOrEqual(last.getTime() + COOLDOWN_SECONDS * 1000);
    expect(Number(latest.timestamp) * 1000).toBeLessThan(last.getTime() + COOLDOWN_SECONDS * 1000);
    const account = await keeperAccount();

    // The executor simulates before signing: the rejection reaches the loop as `failed`, nothing is broadcast.
    expect(await cycle()).toEqual(["deferred", "deferred"]);
    expect(executor.requests).toHaveLength(2);
    const ops = await journal.listOperations({ kind: "rate-update", status: "open" });
    expect(ops.map((op) => op.stepPayload)).toMatchObject([
      { lastRejection: "cooldown", deferUntil: null },
      { lastRejection: "cooldown", deferUntil: null },
    ]);
    expect(await keeperAccount()).toEqual(account);
    expect(await read()).toEqual(before);

    // Not held: the next cycle re-reads and submits again, rejected again while anvil's time has not passed.
    expect(await cycle()).toEqual(["deferred", "deferred"]);
    expect(executor.requests).toHaveLength(4);
    expect(await keeperAccount()).toEqual(account);

    // Anvil's time passes the cooldown (the bot's clock stays where it is): the next cycle lands one step each.
    await advanceChainOnly(COOLDOWN_SECONDS + 5);
    expect(await cycle()).toEqual(["acted", "acted"]);
    expect(executor.requests).toHaveLength(6);
    expect(await read()).toEqual({ home: 2_894_062_500_000_000_000_000n, token: 342_950_000n });
    expect((await keeperAccount()).nonce).toBe(account.nonce + 2);
    expect(notifier.sent.map((n) => [n.severity, n.dedupKey])).toEqual([
      ["warning", "rate:anvil-pair:homeNative:cooldown"],
      ["warning", "rate:anvil-pair:USDC:cooldown"],
    ]);
  }, 120_000);
});
