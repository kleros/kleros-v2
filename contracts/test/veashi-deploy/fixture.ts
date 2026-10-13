import fs from "fs";
import path from "path";
import { deployments, ethers, network } from "hardhat";
import { HardhatRuntimeEnvironment, Network } from "hardhat/types";
import { DeploymentsExtension } from "hardhat-deploy/types";
import {
  HardhatStandIn,
  KEEPER_ENV,
  OracleAddresses,
  setHardhatStandIn,
  VEASHI_TAGS,
  VeashiDefaults,
} from "../../deploy/utils/veashi";

/**
 * The in-process hardhat stand-in of the Veashi contracts (decisions [G7], [L5]): Yaho and AxelarReporters deployed
 * from the frozen SDK fixture (bots/gateway-balancer/fixtures/veashi-sdk-0.1.0.json, compiled from the SDK's own
 * sources), the Axelar gateway and gas service as accounts whose code is a single STOP (they accept any call), and
 * adapters and Yaru as plain addresses (nothing calls them before a ruling). Never the mainnet SDK addresses, never
 * new Solidity.
 */

export const REPO_ROOT = path.join(__dirname, "..", "..", "..");
const SDK_FIXTURE = path.join(REPO_ROOT, "bots", "gateway-balancer", "fixtures", "veashi-sdk-0.1.0.json");

type FixtureContract = { abi: any[]; bytecode: string };
const sdkFixture = (): Record<string, FixtureContract> => JSON.parse(fs.readFileSync(SDK_FIXTURE, "utf8")).contracts;

/** Chain ids no public network uses, so a stand-in can never be mistaken for Base or Arbitrum. */
export const STAND_IN_CHAINS = {
  foreign: 84_530_001,
  home: 421_610_001,
} as const;
/** What each stand-in AxelarReporter pays its (STOP) gas service per message, from its own prefunded balance. */
export const STAND_IN_AXELAR_FEE = ethers.parseEther("0.00001");
export const STAND_IN_REPORTER_FUNDING = ethers.parseEther("0.01");

export const ALL_TAGS = [VEASHI_TAGS.foreign, VEASHI_TAGS.home, VEASHI_TAGS.foreignConfigure];

const plainAddress = (label: string) => ethers.getAddress(ethers.id(`veashi stand-in ${label}`).slice(0, 42));

export interface StandIn extends HardhatStandIn {
  reporters: { foreign: string[]; home: string[] };
}

async function deployReporters(yaho: string, targetChainId: number, side: string, count: number): Promise<string[]> {
  const [deployer] = await ethers.getSigners();
  const { AxelarReporter } = sdkFixture();
  const axelarGateway = plainAddress(`${side} axelar gateway`);
  const axelarGasService = plainAddress(`${side} axelar gas service`);
  await network.provider.send("hardhat_setCode", [axelarGateway, "0x00"]);
  await network.provider.send("hardhat_setCode", [axelarGasService, "0x00"]);
  const factory = new ethers.ContractFactory(AxelarReporter.abi, AxelarReporter.bytecode, deployer);
  const reporters: string[] = [];
  for (let i = 0; i < count; i++) {
    const reporter: any = await factory.deploy(
      plainAddress(`${side} header storage`),
      yaho,
      axelarGateway,
      axelarGasService
    );
    await reporter.waitForDeployment();
    // [L5]: without a chain name for the target chain id, `_dispatch` reverts ChainIdNotSupported.
    await (await reporter.setChainNameByChainId(targetChainId, `stand-in-${targetChainId}`)).wait();
    await (await reporter.setFee(STAND_IN_AXELAR_FEE)).wait();
    await (
      await deployer.sendTransaction({
        to: await reporter.getAddress(),
        value: STAND_IN_REPORTER_FUNDING,
      })
    ).wait();
    reporters.push(await reporter.getAddress());
  }
  return reporters;
}

/** Deploys the stand-in contracts and installs the stand-in parameter set (mainnet defaults plus `overrides`). */
export async function installStandIn(overrides?: Partial<VeashiDefaults>, oracleCount = 3): Promise<StandIn> {
  const [deployer, , , , , keeper] = await ethers.getSigners();
  const { Yaho } = sdkFixture();
  const yahoFactory = new ethers.ContractFactory(Yaho.abi, Yaho.bytecode, deployer);
  const deployYaho = async () => {
    const yaho = await yahoFactory.deploy();
    await yaho.waitForDeployment();
    return yaho.getAddress();
  };
  const foreignYaho = await deployYaho();
  const homeYaho = await deployYaho();
  const foreignReporters = await deployReporters(foreignYaho, STAND_IN_CHAINS.home, "foreign", oracleCount);
  const homeReporters = await deployReporters(homeYaho, STAND_IN_CHAINS.foreign, "home", oracleCount);
  const toHome = foreignReporters.map((_, i) => plainAddress(`adapter foreign->home ${i}`)); // on the home chain
  const toForeign = foreignReporters.map((_, i) => plainAddress(`adapter home->foreign ${i}`)); // on the foreign chain
  const foreignOracles: OracleAddresses[] = foreignReporters.map((reporter, i) => ({
    outboundReporter: reporter,
    outboundAdapter: toHome[i],
    inboundAdapter: toForeign[i],
  }));
  const homeOracles: OracleAddresses[] = homeReporters.map((reporter, i) => ({
    outboundReporter: reporter,
    outboundAdapter: toForeign[i],
    inboundAdapter: toHome[i],
  }));
  const standIn: StandIn = {
    addresses: {
      foreign: {
        yaho: foreignYaho,
        yaru: plainAddress("yaru on foreign"),
        oracles: foreignOracles,
      },
      home: {
        yaho: homeYaho,
        yaru: plainAddress("yaru on home"),
        oracles: homeOracles,
      },
    },
    keeper: keeper.address,
    foreignChainId: STAND_IN_CHAINS.foreign,
    homeChainId: STAND_IN_CHAINS.home,
    overrides,
    reporters: { foreign: foreignReporters, home: homeReporters },
  };
  setHardhatStandIn(standIn);
  return standIn;
}

let freshTest = true;

/**
 * Runs deploy scripts by tag on the in-process network, never writing deployments to disk. The first run of a test
 * clears hardhat-deploy's memory (the EVM was reverted under it); later runs of the same test keep it.
 */
export async function runTags(tags: string[]): Promise<void> {
  if (tags.length === 0) throw new Error("runTags: an untagged run would execute every deploy script");
  const resetMemory = freshTest;
  freshTest = false;
  await deployments.run(tags, {
    resetMemory,
    writeDeploymentsToFiles: false,
    deletePreviousDeployments: false,
  });
}

/** Per-test isolation: an EVM snapshot, a clean hardhat-deploy memory, no stand-in and no keeper variable. */
export function isolate(): void {
  let snapshot: string;
  let keeperEnv: string | undefined;
  beforeEach(async () => {
    snapshot = await network.provider.send("evm_snapshot", []);
    keeperEnv = process.env[KEEPER_ENV];
    delete process.env[KEEPER_ENV];
    freshTest = true;
  });
  afterEach(async () => {
    setHardhatStandIn(undefined);
    if (keeperEnv === undefined) delete process.env[KEEPER_ENV];
    else process.env[KEEPER_ENV] = keeperEnv;
    await network.provider.send("evm_revert", [snapshot]);
  });
}

export interface Spies {
  calls: string[];
}

const TX_METHODS = ["deploy", "execute", "rawTx", "save", "deterministic", "catchUnknownSigner", "fixture", "run"];

/**
 * A runtime environment whose network metadata says `name` (a live Base or Arbitrum), over the in-process provider,
 * with spies on every hardhat-deploy method that can send or record a deployment and on every ethers signer lookup.
 */
export function syntheticHre(
  hre: HardhatRuntimeEnvironment,
  name: string,
  chainId: number,
  live = true
): { hre: HardhatRuntimeEnvironment; spies: Spies } {
  const spies: Spies = { calls: [] };
  const syntheticNetwork = {
    ...hre.network,
    name,
    live,
    tags: { production: live },
    config: { ...hre.network.config, chainId },
  } as unknown as Network;
  const spied = <T extends object>(target: T, label: string, methods: string[]) =>
    new Proxy(target, {
      get(object, property, receiver) {
        const value = Reflect.get(object, property, receiver);
        if (typeof value === "function" && methods.includes(String(property))) {
          return (...args: unknown[]) => {
            spies.calls.push(`${label}.${String(property)}`);
            return value.apply(object, args);
          };
        }
        return value;
      },
    });
  const synthetic = Object.create(hre) as HardhatRuntimeEnvironment;
  Object.defineProperty(synthetic, "network", { value: syntheticNetwork });
  Object.defineProperty(synthetic, "deployments", {
    value: spied(hre.deployments as DeploymentsExtension, "deployments", TX_METHODS),
  });
  Object.defineProperty(synthetic, "ethers", {
    value: spied(hre.ethers, "ethers", [
      "getSigner",
      "getSigners",
      "getContractAt",
      "deployContract",
      "getContractFactory",
    ]),
  });
  return { hre: synthetic, spies };
}
