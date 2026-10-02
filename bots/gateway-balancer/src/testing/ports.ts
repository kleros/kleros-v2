import type { z } from "zod";
import { appConfigSchema, topologySchema, type AppConfig, type AppConfigInput } from "../config/schema";
import type { Address, ChainId } from "../domain";
import type { CorePorts } from "../ports";
import { FakeChainClient } from "./fakeChain";
import { FakeClock } from "./fakeClock";
import { FAKE_SIGNER, FakeExecutor } from "./fakeExecutor";
import { FakeJournal } from "./fakeJournal";
import { FakeLogger } from "./fakeLogger";
import { FakeNotifier } from "./fakeNotifier";

export const EXAMPLE_CHAINS = {
  /** A foreign chain whose gas token is a stablecoin (the Arc shape). */
  foreignUsdc: 1001 as ChainId,
  /** A foreign chain collecting ETH and an ERC20 USDC (the Base shape). */
  foreignEth: 1002 as ChainId,
  /** The home chain (the Arbitrum shape). */
  home: 1003 as ChainId,
};

export const EXAMPLE_ADDRESSES = {
  foreignGatewayUsdc: "0x00000000000000000000000000000000000000a1" as Address,
  foreignGatewayEth: "0x00000000000000000000000000000000000000a2" as Address,
  homeGatewayUsdc: "0x00000000000000000000000000000000000000b1" as Address,
  homeGatewayEth: "0x00000000000000000000000000000000000000b2" as Address,
  usdcOnForeignEth: "0x00000000000000000000000000000000000000c2" as Address,
  wethOnHome: "0x00000000000000000000000000000000000000c3" as Address,
  reporterUsdcToHome: "0x00000000000000000000000000000000000000d1" as Address,
  reporterHomeToUsdc: "0x00000000000000000000000000000000000000d2" as Address,
  reporterEthToHome: "0x00000000000000000000000000000000000000d3" as Address,
  reporterHomeToEth: "0x00000000000000000000000000000000000000d4" as Address,
};

/** Two pairs and four reporter routes in the shapes of the initial deployment, with fixture chain ids. */
export function exampleTopology(): z.input<typeof topologySchema> {
  return {
    chains: [
      {
        id: EXAMPLE_CHAINS.foreignUsdc,
        name: "foreign-usdc",
        rpcUrlEnv: "FOREIGN_USDC_RPC_URL",
        nativeSymbol: "USDC",
        nativeDecimals: 18,
      },
      { id: EXAMPLE_CHAINS.foreignEth, name: "foreign-eth", rpcUrlEnv: "FOREIGN_ETH_RPC_URL", nativeSymbol: "ETH" },
      {
        id: EXAMPLE_CHAINS.home,
        name: "home",
        rpcUrlEnv: "HOME_RPC_URL",
        nativeSymbol: "ETH",
        wrappedNative: EXAMPLE_ADDRESSES.wethOnHome,
      },
    ],
    pairs: [
      {
        id: "usdc-home",
        foreignChainId: EXAMPLE_CHAINS.foreignUsdc,
        foreignGateway: EXAMPLE_ADDRESSES.foreignGatewayUsdc,
        homeChainId: EXAMPLE_CHAINS.home,
        homeGateway: EXAMPLE_ADDRESSES.homeGatewayUsdc,
        collectedAssets: [{ chainId: EXAMPLE_CHAINS.foreignUsdc, address: "native", symbol: "USDC", decimals: 18 }],
        rateCurrency: "USD",
      },
      {
        id: "eth-home",
        foreignChainId: EXAMPLE_CHAINS.foreignEth,
        foreignGateway: EXAMPLE_ADDRESSES.foreignGatewayEth,
        homeChainId: EXAMPLE_CHAINS.home,
        homeGateway: EXAMPLE_ADDRESSES.homeGatewayEth,
        collectedAssets: [
          { chainId: EXAMPLE_CHAINS.foreignEth, address: "native", symbol: "ETH", decimals: 18 },
          {
            chainId: EXAMPLE_CHAINS.foreignEth,
            address: EXAMPLE_ADDRESSES.usdcOnForeignEth,
            symbol: "USDC",
            decimals: 6,
          },
        ],
      },
    ],
    routes: [
      {
        id: "usdc-home->home",
        pairId: "usdc-home",
        chainId: EXAMPLE_CHAINS.foreignUsdc,
        reporter: EXAMPLE_ADDRESSES.reporterUsdcToHome,
        fundingMethod: "nativeTransfer",
      },
      {
        id: "home->usdc-home",
        pairId: "usdc-home",
        chainId: EXAMPLE_CHAINS.home,
        reporter: EXAMPLE_ADDRESSES.reporterHomeToUsdc,
        fundingMethod: "nativeTransfer",
      },
      {
        id: "eth-home->home",
        pairId: "eth-home",
        chainId: EXAMPLE_CHAINS.foreignEth,
        reporter: EXAMPLE_ADDRESSES.reporterEthToHome,
        fundingMethod: "nativeTransfer",
      },
      {
        id: "home->eth-home",
        pairId: "eth-home",
        chainId: EXAMPLE_CHAINS.home,
        reporter: EXAMPLE_ADDRESSES.reporterHomeToEth,
        fundingMethod: "nativeTransfer",
      },
    ],
  };
}

/** A parsed config over the example topology; lanes pass their own section through `overrides`. */
export function exampleConfig(overrides: Partial<AppConfigInput> = {}): AppConfig {
  return appConfigSchema.parse({ topology: exampleTopology(), ...overrides });
}

export interface FakePorts extends CorePorts {
  logger: FakeLogger;
  clock: FakeClock;
  journal: FakeJournal;
  chains: Map<ChainId, FakeChainClient>;
  executor: FakeExecutor;
  notifier: FakeNotifier;
}

export function makeFakePorts(config: AppConfig = exampleConfig()): FakePorts {
  const clock = new FakeClock();
  const journal = new FakeJournal(() => clock.now());
  const chains = new Map<ChainId, FakeChainClient>();
  for (const chain of config.topology.chains) chains.set(chain.id, new FakeChainClient(chain.id));
  return {
    config,
    logger: new FakeLogger(),
    clock,
    journal,
    chains,
    executor: new FakeExecutor(FAKE_SIGNER, journal),
    notifier: new FakeNotifier(),
    signer: FAKE_SIGNER,
  };
}
