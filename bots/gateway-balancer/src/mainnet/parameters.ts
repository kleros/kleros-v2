/**
 * Operator-reviewable values of the generated mainnet configuration (decisions [G6], [L3], [L9]). Review every value
 * here before generating `config/mainnet.json` (RUNBOOK, "Mainnet launch"). Addresses of Yaho, Yaru, reporters and
 * adapters are NOT here: they come from the `@kleros/veashi-sdk` getters ([G3]); the gateway addresses come from the
 * operator's deploy output.
 */

/** Base, the foreign chain: the ForeignGateway collects the fees there. */
export const FOREIGN_CHAIN_ID = 8453;
/** Arbitrum One, the home chain: the HomeGateway pays the arbitrator there. */
export const HOME_CHAIN_ID = 42161;

export const PAIR_ID = "base-arbitrum";

/**
 * hardhat-deploy names of the Veashi deployments, written by `contracts/deploy/1x-veashi-*.ts` under
 * `contracts/deployments/<network>/<name>.json`. Must equal `contracts/deploy/utils/veashi/deploymentNames.json`
 * (checked by a test).
 */
export const DEPLOYMENT_NAMES = {
  foreignGateway: "VeashiForeignGateway",
  homeGateway: "VeashiHomeGateway",
  ruler: "VeashiKlerosCoreRuler",
  lightbulb: "VeashiGatewayLightbulb",
} as const;

/** hardhat-deploy network names (`contracts/hardhat.config.ts`), i.e. the folders under `contracts/deployments`. */
export const DEPLOYMENT_NETWORKS = { foreign: "base", home: "arbitrum" } as const;

export const CHAINS = {
  home: {
    id: HOME_CHAIN_ID,
    name: "arbitrum",
    rpcUrlEnv: "ARBITRUM_RPC_URL",
    nativeSymbol: "ETH",
    wrappedNative: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    confirmations: 3,
    explorerTxUrl: "https://arbiscan.io/tx/{hash}",
  },
  foreign: {
    id: FOREIGN_CHAIN_ID,
    name: "base",
    rpcUrlEnv: "BASE_RPC_URL",
    nativeSymbol: "ETH",
    wrappedNative: "0x4200000000000000000000000000000000000006",
    confirmations: 3,
    explorerTxUrl: "https://basescan.org/tx/{hash}",
  },
} as const;

/** Native USDC on Base (Circle), the one ERC20 the ForeignGateway accepts. */
export const USDC_BASE = {
  address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  symbol: "USDC",
  decimals: 6,
} as const;

/**
 * The three Veashi bridges, in the order of the gateways' oracle IDs (CCIP 0, LayerZero 1, Axelar 2, decisions [O11]).
 * `key` is the SDK's `Bridges` value; `label` names the route.
 */
export const ORACLE_BRIDGES = [
  { oracleId: 0, key: "ccip", label: "ccip" },
  { oracleId: 1, key: "lz", label: "lz" },
  { oracleId: 2, key: "axelar", label: "axelar" },
] as const;

export type BridgeKey = (typeof ORACLE_BRIDGES)[number]["key"];

/**
 * Reporter funding per route (decisions [L3]): `costPerMessage` in ETH of the reporter's chain, and small explicit
 * thresholds (never the reporter defaults 20/100). A refill near low water costs about
 * `(targetMessages - lowWaterMessages) x costPerMessage`; a drained reporter `targetMessages x costPerMessage`.
 * CCIP and LayerZero quote per message; Axelar pays its fixed `fee()` per message: set its `costPerMessage` to the
 * reporter's `fee()` (RUNBOOK pre-deploy checklist).
 */
export const REPORTER_DEFAULTS = { lowWaterMessages: 3, targetMessages: 10, minTopUpMessages: 2 } as const;

export const COST_PER_MESSAGE: Record<"foreignToHome" | "homeToForeign", Record<BridgeKey, string>> = {
  foreignToHome: { ccip: "0.0002", lz: "0.0001", axelar: "0.0001" },
  homeToForeign: { ccip: "0.0002", lz: "0.0001", axelar: "0.0001" },
};

/**
 * ETH paid by the HomeGateway to the arbitrator for one Lightbulb case: the KlerosCoreRuler's
 * `arbitrationCost(extraData)` = `feeForJuror x minJurors` of the contracts' mainnet parameters
 * (`contracts/deploy/utils/veashi/parameters.ts`: 0.0001 ETH x 3 jurors). A contracts test compares the two ([L7]).
 */
export const REFERENCE_CASE_COST_ETH = "0.0003";

export const REFILL = {
  lowWaterCases: 5,
  targetCases: 20,
  economicMinimums: { ETH: "0.001", USDC: "2" },
} as const;

/** Operator gas floor per chain, in wei: a `gas-low` warning below it (RUNBOOK section 5). */
export const MINIMUM_GAS_RESERVE_WEI = { [HOME_CHAIN_ID]: "2000000000000000", [FOREIGN_CHAIN_ID]: "2000000000000000" };

/** LI.FI: chains and assets in scope and a small test budget. Tools, targets, spenders and fee wallets stay empty. */
export const LIFI_LIMITS = [
  { chainId: FOREIGN_CHAIN_ID, asset: "native", decimals: 18, perTransfer: "0.05", daily: "0.1" },
  {
    chainId: FOREIGN_CHAIN_ID,
    asset: USDC_BASE.address,
    decimals: USDC_BASE.decimals,
    perTransfer: "100",
    daily: "200",
  },
] as const;

/**
 * Chainlink USD feeds (decisions [L9]). Source: Chainlink data feeds, https://docs.chain.link/data-feeds/price-feeds/
 * addresses (Arbitrum One and Base mainnet), as recorded in `src/rates/example-config.json`. All answer with 8
 * decimals. `freshnessSeconds` is the feed's heartbeat plus a margin (heartbeats recorded from the same pages: ETH/USD
 * 86400 s on Arbitrum, 1200 s on Base; USDC/USD 86400 s on both). Verify each address, decimals and heartbeat before
 * launch (RUNBOOK, "Parameters to review").
 */
export const CHAINLINK_FEEDS = {
  [HOME_CHAIN_ID]: {
    ETH: { address: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612", freshnessSeconds: 90000 },
    USDC: { address: "0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3", freshnessSeconds: 90000 },
  },
  [FOREIGN_CHAIN_ID]: {
    ETH: { address: "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70", freshnessSeconds: 1800 },
    USDC: { address: "0x7e860098F58bBFC8648a4311b374B1D669a2bc6B", freshnessSeconds: 90000 },
  },
} as const;

/** CoinGecko, the second source family; its API key is read from this variable (the name only, never a value). */
export const COINGECKO = {
  apiKeyEnv: "COINGECKO_API_KEY",
  apiKeyHeader: "x-cg-demo-api-key",
  coinIds: { ETH: "ethereum", USDC: "usd-coin" },
  freshnessSeconds: 600,
} as const;

/**
 * Two families, Chainlink and CoinGecko, both required for a price (decisions [L9]): one provider outage stops rate
 * updates (`price-unavailable`) instead of publishing a single-source price.
 */
export const MIN_PRICE_SOURCES = 2;
