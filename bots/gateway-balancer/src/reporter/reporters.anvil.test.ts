/**
 * The reporter lane against the reporters of `@kleros/veashi-sdk@0.1.0` on a local anvil: the CCIP, LayerZero and
 * Axelar reporters (and Yaho, a contract without `receive()`) deployed from the frozen SDK fixture's bytecode with
 * stand-in constructor arguments, read through the platform `ChainClient` and funded through the platform executor.
 */
import {
  createPublicClient,
  createWalletClient,
  getAddress,
  http,
  parseEther,
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
import { testErc20Abi } from "../contracts/abi";
import { appConfigSchema } from "../config/schema";
import { NATIVE, type Address, type ChainId, type Hex, type Operation, type TxRequest } from "../domain";
import type { CorePorts, SubmitOptions, SubmitOutcome, TxExecutor } from "../ports";
import { chainDefinition, ViemChainClient } from "../platform/chains/chainClient";
import { systemClock } from "../platform/clock";
import { PlatformExecutor } from "../platform/executor/executor";
import { ViemExecutorRpc } from "../platform/executor/rpc";
import { Redactor } from "../platform/redact";
import { ANVIL_ACCOUNTS, startAnvil, type AnvilInstance } from "../platform/testkit/anvil";
import {
  FakeForeignGatewayTreasury,
  FakeJournal,
  FakeLogger,
  FakeNotifier,
  FakeRouteProvider,
  FakeTransfers,
  noNetwork,
} from "../testing";
import { NativeTransferReporterFunding, feeTokenDispatch } from "./adapter";
import { ReporterFundingLoop, type FundingPayload } from "./loop";
import { sdkContract, type SdkContractName } from "./sdkFixture";

const CHAIN_ID = 31337 as ChainId;
const HOME_CHAIN_ID = 42161 as ChainId;
const PAIR_ID = "anvil-pair";
const ROUTE_ID = "anvil-pair->home";
const FOREIGN_GATEWAY: Address = "0x00000000000000000000000000000000000000a1";
/** Stand-in constructor arguments: plain addresses the constructors only store. */
const STAND_IN = {
  headerStorage: "0x00000000000000000000000000000000000000e1",
  ccipRouter: "0x00000000000000000000000000000000000000e2",
  axelarGateway: "0x00000000000000000000000000000000000000e3",
  axelarGasService: "0x00000000000000000000000000000000000000e4",
} as const satisfies Record<string, Address>;
/** LayerZero's `OAppCore` constructor calls `endpoint.setDelegate`: the stand-in endpoint's runtime is one `STOP`. */
const LZ_ENDPOINT: Address = "0x00000000000000000000000000000000000000e5";
/** 0.0002 ETH per message; 20 messages low water, 100 target: a top-up of an empty reporter is 0.02 ETH. */
const COST_PER_MESSAGE = parseEther("0.0002");
const TARGET = 100n * COST_PER_MESSAGE;

const signer = privateKeyToAccount(ANVIL_ACCOUNTS[0]!.privateKey);

let anvil: AnvilInstance;
let wallet: WalletClient<Transport, Chain, Account>;
let publicClient: PublicClient<Transport, Chain>;
let yaho: Address;

async function deploy(abi: Abi, code: Hex, args: unknown[] = []): Promise<Address> {
  const hash = await wallet.deployContract({ abi, bytecode: code, args } as never);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  expect(receipt.status).toBe("success");
  return receipt.contractAddress!;
}

async function deploySdk(name: SdkContractName, args: unknown[]): Promise<Address> {
  const contract = sdkContract(name);
  expect(contract.constructor).toHaveLength(args.length);
  return deploy(contract.abi, contract.bytecode, args);
}

async function write(address: Address, abi: Abi, functionName: string, args: unknown[]): Promise<void> {
  const hash = await wallet.writeContract({ address, abi, functionName, args } as never);
  expect((await publicClient.waitForTransactionReceipt({ hash })).status).toBe("success");
}

const deployCcip = () => deploySdk("CCIPReporter", [STAND_IN.headerStorage, yaho, STAND_IN.ccipRouter]);
const deployLayerZero = () =>
  deploySdk("LayerZeroReporter", [STAND_IN.headerStorage, yaho, LZ_ENDPOINT, signer.address, signer.address, 0n]);
const deployAxelar = () =>
  deploySdk("AxelarReporter", [STAND_IN.headerStorage, yaho, STAND_IN.axelarGateway, STAND_IN.axelarGasService]);

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

/** One pair on the anvil chain with one reporter route at `reporter`, the real adapter and the platform executor. */
function setup(reporter: Address) {
  const config = appConfigSchema.parse({
    topology: {
      chains: [
        { id: CHAIN_ID, name: "anvil", rpcUrlEnv: "ANVIL_RPC_URL", nativeSymbol: "ETH" },
        { id: HOME_CHAIN_ID, name: "home", rpcUrlEnv: "HOME_RPC_URL", nativeSymbol: "ETH" },
      ],
      pairs: [
        {
          id: PAIR_ID,
          foreignChainId: CHAIN_ID,
          foreignGateway: FOREIGN_GATEWAY,
          homeChainId: HOME_CHAIN_ID,
          homeGateway: "0x00000000000000000000000000000000000000b1",
          collectedAssets: [{ chainId: CHAIN_ID, address: "native", symbol: "ETH", decimals: 18 }],
        },
      ],
      routes: [{ id: ROUTE_ID, pairId: PAIR_ID, chainId: CHAIN_ID, reporter, fundingMethod: "nativeTransfer" }],
    },
    reporter: { routes: { [ROUTE_ID]: { costPerMessage: "0.0002" } } },
  });
  const journal = new FakeJournal(() => systemClock.now());
  const notifier = new FakeNotifier();
  const logger = new FakeLogger();
  const redact = new Redactor([anvil.url]).text;
  const transport = http(anvil.url, { retryCount: 0 });
  const executor = new CountingExecutor(
    new PlatformExecutor({
      account: signer,
      chains: new Map([
        [
          CHAIN_ID,
          { chainId: CHAIN_ID, name: "anvil", confirmations: 1, rpc: new ViemExecutorRpc(transport, redact, CHAIN_ID) },
        ],
      ]),
      journal,
      clock: systemClock,
      logger,
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
    })
  );
  const chains = new Map([[CHAIN_ID, new ViemChainClient(CHAIN_ID, transport, redact)]]);
  const ports: CorePorts = {
    config,
    logger,
    clock: systemClock,
    journal,
    chains,
    executor,
    notifier,
    signer: signer.address,
    fetch: noNetwork,
  };
  const route = config.topology.routes[0]!;
  const funding = new NativeTransferReporterFunding(config.topology, chains, signer.address);
  const loop = new ReporterFundingLoop(route, {
    ports,
    funding,
    treasury: new FakeForeignGatewayTreasury(PAIR_ID, CHAIN_ID, FOREIGN_GATEWAY),
    transfers: new FakeTransfers(journal),
    routeProvider: new FakeRouteProvider(),
  });
  const tick = () => loop.tick({ now: systemClock.now(), signal: new AbortController().signal });
  /** The route's own native holding (bridging fees already on the EOA) covers the whole top-up. */
  const creditHolding = (amount: bigint) =>
    journal.ledger.credit({
      scope: { kind: "bridging", routeId: ROUTE_ID },
      chainId: CHAIN_ID,
      asset: NATIVE,
      location: "eoa",
      amount,
      operationId: "earlier-transfer",
      reason: "transfer received",
    });
  return { route, funding, loop, tick, creditHolding, executor, notifier, journal };
}

type Setup = ReturnType<typeof setup>;

const balanceOf = (address: Address) => publicClient.getBalance({ address });

async function operations(s: Setup): Promise<Operation[]> {
  return s.journal.listOperations({ kind: "reporter-funding", routeId: ROUTE_ID });
}

/** One tick funds an empty reporter to its target from the holding: the balance rises by exactly the amount sent. */
async function expectFunded(s: Setup, reporter: Address): Promise<void> {
  await s.creditHolding(parseEther("0.05"));
  const before = await balanceOf(reporter);
  expect(before).toBe(0n);
  expect((await s.tick()).status).toBe("acted");
  const [op] = await operations(s);
  expect(op!.status).toBe("completed");
  expect((op!.payload as unknown as FundingPayload).legs).toEqual([]);
  expect(s.executor.requests).toEqual([{ chainId: CHAIN_ID, to: reporter, value: TARGET }]);
  expect(await balanceOf(reporter)).toBe(before + TARGET);
  expect(s.notifier.bySeverity("critical")).toEqual([]);
}

/** The route is refused: suspended with one critical notification, nothing submitted, the balance untouched. */
async function expectRefused(s: Setup, reporter: Address, reason: RegExp): Promise<void> {
  await s.creditHolding(parseEther("0.05"));
  const result = await s.tick();
  expect(result.status).toBe("suspended");
  expect(result.summary).toMatch(reason);
  const critical = s.notifier.bySeverity("critical");
  expect(critical).toHaveLength(1);
  expect(critical[0]).toEqual(expect.objectContaining({ routeId: ROUTE_ID }));
  expect(critical[0]!.body).toMatch(reason);
  expect(s.executor.requests).toEqual([]);
  expect(await operations(s)).toEqual([]);
  expect(await balanceOf(reporter)).toBe(0n);
}

beforeAll(async () => {
  anvil = await startAnvil(CHAIN_ID);
  // Anvil mines on every transaction: poll receipts every 50 ms, not viem's default 4 s.
  const chain = chainDefinition(CHAIN_ID);
  wallet = createWalletClient({ account: signer, chain, transport: http(anvil.url), pollingInterval: 50 });
  publicClient = createPublicClient({ chain, transport: http(anvil.url), pollingInterval: 50 });
  yaho = await deploySdk("Yaho", []);
  await anvil.rpc("anvil_setCode", [LZ_ENDPOINT, "0x00"]);
}, 120_000);

afterAll(async () => {
  await anvil?.stop();
});

describe("reporter funding against the @kleros/veashi-sdk 0.1.0 reporters on anvil", () => {
  it("native-fee CCIP (feeToken 0) passes the preflight; funding adds exactly the amount to its balance", async () => {
    const reporter = await deployCcip();
    const s = setup(reporter);
    expect(
      await publicClient.readContract({
        address: reporter,
        abi: sdkContract("CCIPReporter").abi,
        functionName: "feeToken",
      })
    ).toBe("0x0000000000000000000000000000000000000000");
    expect(feeTokenDispatch((await publicClient.getCode({ address: reporter })) as Hex)).toBe("selector");
    expect(await s.funding.preflight(s.route)).toEqual({ ok: true, reasons: [] });
    await expectFunded(s, reporter);
  });

  it("CCIP paying its fees in an ERC20 feeToken is refused and the route suspended with a critical", async () => {
    const reporter = await deployCcip();
    const token = await deploy(testErc20Abi, bytecode.testErc20 as Hex, ["LINK", "LINK"]);
    await write(reporter, sdkContract("CCIPReporter").abi, "setFeeToken", [token]);
    const s = setup(reporter);
    const preflight = await s.funding.preflight(s.route);
    expect(preflight.ok).toBe(false);
    expect(preflight.reasons).toEqual([
      `reporter ${reporter} pays its fees in the ERC20 feeToken ${getAddress(token)}; ` +
        `only reporters paying native fees are supported`,
    ]);
    await expectRefused(s, reporter, /ERC20 feeToken/);
  });

  it.each([
    ["LayerZero", deployLayerZero],
    ["Axelar", deployAxelar],
  ])(
    "%s (no feeToken() selector, no DELEGATECALL) passes the preflight and a transfer lands",
    async (_, deployReporter) => {
      const reporter = await deployReporter();
      const code = (await publicClient.getCode({ address: reporter })) as Hex;
      expect(feeTokenDispatch(code)).toBe("absent");
      const s = setup(reporter);
      expect(await s.funding.preflight(s.route)).toEqual({ ok: true, reasons: [] });
      await expectFunded(s, reporter);
    }
  );

  it("a contract without receive() (Yaho) fails the transfer simulation and the route is refused", async () => {
    expect(sdkContract("Yaho").abi.some((entry) => entry.type === "receive" || entry.type === "fallback")).toBe(false);
    const s = setup(yaho);
    const preflight = await s.funding.preflight(s.route);
    expect(preflight.ok).toBe(false);
    expect(preflight.reasons).toHaveLength(1);
    expect(preflight.reasons[0]).toMatch(/^native transfer to the reporter does not simulate: .*revertData=/);
    await expectRefused(s, yaho, /does not simulate/);
  });
});
