import { getAddress, isAddress, parseEther, ZeroAddress } from "ethers";
import { Bridges, getAdapter, getReporter, getYaho, getYaru } from "@kleros/veashi-sdk";

/**
 * Every value of the Veashi gateway deployment the operator may change, in one place (decisions [O10]-[O12], [G6]).
 * Review `MAINNET_DEFAULTS` before deploying (bots/gateway-balancer/RUNBOOK.md, "Mainnet launch"). Yaho, Yaru,
 * reporter and adapter addresses are never written here: on mainnet they come from the `@kleros/veashi-sdk` getters
 * ([G3]); on the in-process hardhat network from the stand-in contracts the test fixture deploys.
 */

/** Holds the bot's address, the ForeignGateway keeper (`withdrawFees` always pays it). */
export const KEEPER_ENV = "VEASHI_KEEPER_ADDRESS";

export const MAINNET_CHAINS = { foreign: 8453, home: 42161 } as const; // Base, Arbitrum One

export type BridgeId = Bridges.CCIP | Bridges.LZ | Bridges.AXELAR;

export interface OracleParameter {
  /** The oracle ID on both gateways; IDs are assigned in registration order, so entry i must have ID i. */
  id: number;
  bridge: BridgeId;
  /** `ForeignGateway.oracleBridgingCost`: the round trip (dispute and ruling leg) charged per dispute, in Base wei. */
  bridgingCost: bigint;
}

/** The mock arbitrator (decisions [O4], [O10]): a dedicated KlerosCoreRuler proxy, or an existing ruler reused. */
export type RulerChoice =
  | {
      kind: "deploy";
      minStake: bigint;
      alpha: bigint;
      jurorsForCourtJump: bigint;
    }
  | { kind: "existing"; address: string };

export interface VeashiDefaults {
  oracles: OracleParameter[];
  defaultOracleIds: number[];
  defaultThreshold: number;
  /** The court the Lightbulb's extraData names; its juror fee is set on the ForeignGateway and, deployed, on the ruler. */
  court: { id: bigint; minJurors: bigint; feeForJuror: bigint };
  /** Base ETH per Arbitrum ETH, scaled by 1e18: both chains use ETH, so fixed at 1e18 with no keeper loop. */
  homeNativeRate: bigint;
  /** `changeCurrencyRates(usdc, rateInEth, rateDecimals)`: `rateInEth / 10^rateDecimals` wei per USDC unit. */
  usdc: { address: string; rateInEth: bigint; rateDecimals: number };
  ruler: RulerChoice;
  lightbulb: { templateId: bigint; templateUri: string };
}

/** ETH price in USDC used for the initial USDC rate. Update it to the market on deploy day: the keeper then steps. */
export const USDC_PER_ETH = 2500n;

export const MAINNET_DEFAULTS: VeashiDefaults = {
  // CCIP 0, LayerZero 1, Axelar 2 on both gateways, in this order ([O11]). Every selected reporter dispatches and every
  // selected bridging cost is charged; the threshold tolerates delivery failures, not a dispatch revert.
  oracles: [
    { id: 0, bridge: Bridges.CCIP, bridgingCost: parseEther("0.0004") },
    { id: 1, bridge: Bridges.LZ, bridgingCost: parseEther("0.0002") },
    { id: 2, bridge: Bridges.AXELAR, bridgingCost: parseEther("0.0002") },
  ],
  defaultOracleIds: [0, 1, 2],
  defaultThreshold: 2,
  // General court (1), 3 jurors, 0.0001 ETH per juror: a Lightbulb case costs the HomeGateway 0.0003 ETH, the bot's
  // `referenceCaseCostEth` (checked by contracts/test/veashi-deploy against config/mainnet.example.json, [L7]).
  court: { id: 1n, minJurors: 3n, feeForJuror: parseEther("0.0001") },
  homeNativeRate: 10n ** 18n,
  // Native USDC on Base (Circle). 6 rate decimals: rateInEth = 1e12 * 1e6 / USDC_PER_ETH.
  usdc: {
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    rateInEth: 10n ** 18n / USDC_PER_ETH,
    rateDecimals: 6,
  },
  // Default: a dedicated KlerosCoreRuler (governor = deployer). To reuse a ruler instead, e.g. KlerosCoreRulerNeo on
  // Arbitrum: { kind: "existing", address: "0xc0169e0B19aE02ac4fADD689260CF038726DFE13" }. Its fees are then not
  // ours: `court.feeForJuror` must match its `arbitrationCost`, or the home script refuses.
  ruler: {
    kind: "deploy",
    minStake: 0n,
    alpha: 10_000n,
    jurorsForCourtJump: 256n,
  },
  lightbulb: { templateId: 0n, templateUri: "" },
};

export interface OracleAddresses {
  outboundReporter: string;
  outboundAdapter: string;
  inboundAdapter: string;
}

export interface GatewayAddresses {
  yaho: string;
  yaru: string;
  /** Index-aligned with `VeashiDefaults.oracles`. */
  oracles: OracleAddresses[];
}

export interface VeashiAddresses {
  foreign: GatewayAddresses;
  home: GatewayAddresses;
}

export interface VeashiParameters extends VeashiDefaults {
  set: "mainnet" | "hardhat-stand-in";
  foreignChainId: number;
  homeChainId: number;
  keeper: string;
  addresses: VeashiAddresses;
}

function sdkAddress(value: string | undefined, what: string): string {
  if (!value || !isAddress(value) || value === ZeroAddress) {
    throw new Error(`Veashi: ${what} is missing from @kleros/veashi-sdk`);
  }
  return getAddress(value);
}

/**
 * The SDK addresses of a gateway pair. A route `<src>-<dst>` has Yaho and the reporters on `src`, Yaru and the adapters
 * on `dst`. ForeignGateway: Yaho of foreign->home, Yaru of home->foreign, per bridge the foreign->home reporter
 * (outbound), the foreign->home adapter (outbound, on the home chain) and the home->foreign adapter (inbound).
 * HomeGateway: the mirror image.
 */
export function sdkAddresses(foreignChainId: number, homeChainId: number, bridges: BridgeId[]): VeashiAddresses {
  const side = (local: number, remote: number): GatewayAddresses => ({
    yaho: sdkAddress(getYaho(local, remote), `getYaho(${local}, ${remote})`),
    yaru: sdkAddress(getYaru(remote, local), `getYaru(${remote}, ${local})`),
    oracles: bridges.map((bridge) => ({
      outboundReporter: sdkAddress(getReporter(local, remote, bridge), `getReporter(${local}, ${remote}, ${bridge})`),
      outboundAdapter: sdkAddress(getAdapter(local, remote, bridge), `getAdapter(${local}, ${remote}, ${bridge})`),
      inboundAdapter: sdkAddress(getAdapter(remote, local, bridge), `getAdapter(${remote}, ${local}, ${bridge})`),
    })),
  });
  return {
    foreign: side(foreignChainId, homeChainId),
    home: side(homeChainId, foreignChainId),
  };
}

/**
 * The keeper from `VEASHI_KEEPER_ADDRESS`. Refused when malformed or zero; when missing, refused unless a stand-in is
 * given (the in-process hardhat network only). Messages name the variable, never echo more than the bad value.
 */
export function resolveKeeper(env: NodeJS.ProcessEnv, standIn?: string): string {
  const raw = env[KEEPER_ENV]?.trim();
  if (!raw) {
    if (standIn) return standIn;
    throw new Error(`Veashi: ${KEEPER_ENV} is not set; it must hold the bot's address (the ForeignGateway keeper)`);
  }
  if (!/^0x[0-9a-fA-F]{40}$/.test(raw) || !isAddress(raw)) {
    throw new Error(`Veashi: ${KEEPER_ENV} is not a valid address (expected 0x + 40 hex digits, valid checksum)`);
  }
  if (getAddress(raw) === ZeroAddress) throw new Error(`Veashi: ${KEEPER_ENV} is the zero address`);
  return getAddress(raw);
}

const UINT64_MAX = 2n ** 64n - 1n;

/** Every problem of a parameter set; empty means valid. Run before any transaction ([O11]). */
export function parameterProblems(p: VeashiParameters): string[] {
  const problems: string[] = [];
  const ids = p.oracles.map((o) => o.id);
  p.oracles.forEach((oracle, index) => {
    if (oracle.id !== index)
      problems.push(`oracles[${index}]: ID ${oracle.id}, expected ${index} (registration order)`);
    if (oracle.bridgingCost <= 0n) problems.push(`oracles[${index}]: bridgingCost must be non-zero`);
  });
  if (new Set(ids).size !== ids.length) problems.push(`oracles: duplicate oracle ID in [${ids.join(", ")}]`);
  const bridges = p.oracles.map((o) => o.bridge);
  if (new Set(bridges).size !== bridges.length) problems.push(`oracles: duplicate bridge in [${bridges.join(", ")}]`);
  if (p.oracles.length === 0) problems.push("oracles: none");
  const seen = new Set<number>();
  for (const id of p.defaultOracleIds) {
    if (!ids.includes(id)) problems.push(`defaultOracleIds: unknown oracle ID ${id}`);
    if (seen.has(id)) problems.push(`defaultOracleIds: duplicate oracle ID ${id}`);
    seen.add(id);
  }
  const length = p.defaultOracleIds.length;
  if (!Number.isInteger(p.defaultThreshold) || p.defaultThreshold < 1 || p.defaultThreshold > length) {
    problems.push(`defaultThreshold ${p.defaultThreshold} is outside 1..${length}`);
  }
  if (p.court.id < 1n) problems.push("court.id: the forking court (0) is not a court the Lightbulb can name");
  if (p.court.minJurors < 1n) problems.push("court.minJurors must be at least 1");
  if (p.court.feeForJuror <= 0n) problems.push("court.feeForJuror must be non-zero (the keeper cannot move a zero)");
  if (p.ruler.kind === "deploy" && p.court.id !== 1n) {
    problems.push("court.id must be 1: a deployed KlerosCoreRuler has only the General court (1)");
  }
  if (p.ruler.kind === "existing" && (!isAddress(p.ruler.address) || p.ruler.address === ZeroAddress)) {
    problems.push(`ruler.address ${p.ruler.address} is not an address`);
  }
  if (p.homeNativeRate !== 10n ** 18n) problems.push("homeNativeRate must be 1e18: Base and Arbitrum both use ETH");
  if (p.usdc.rateInEth <= 0n || p.usdc.rateInEth > UINT64_MAX) problems.push("usdc.rateInEth must be in 1..2^64-1");
  if (!Number.isInteger(p.usdc.rateDecimals) || p.usdc.rateDecimals < 0 || p.usdc.rateDecimals > 255) {
    problems.push("usdc.rateDecimals must be a uint8");
  }
  if (!isAddress(p.usdc.address) || p.usdc.address === ZeroAddress) problems.push("usdc.address is not an address");
  for (const side of ["foreign", "home"] as const) {
    if (p.addresses[side].oracles.length !== p.oracles.length) {
      problems.push(`addresses.${side}: ${p.addresses[side].oracles.length} oracles for ${p.oracles.length} IDs`);
    }
  }
  return problems;
}

export function assertValidParameters(p: VeashiParameters): VeashiParameters {
  const problems = parameterProblems(p);
  if (problems.length > 0) throw new Error(`Veashi: invalid parameters:\n  - ${problems.join("\n  - ")}`);
  return p;
}

/** The mainnet set: `MAINNET_DEFAULTS`, the SDK addresses for Base 8453 <-> Arbitrum 42161, the keeper from the env. */
export function mainnetParameters(env: NodeJS.ProcessEnv = process.env, defaults = MAINNET_DEFAULTS): VeashiParameters {
  return assertValidParameters({
    ...defaults,
    set: "mainnet",
    foreignChainId: MAINNET_CHAINS.foreign,
    homeChainId: MAINNET_CHAINS.home,
    keeper: resolveKeeper(env),
    addresses: sdkAddresses(
      MAINNET_CHAINS.foreign,
      MAINNET_CHAINS.home,
      defaults.oracles.map((o) => o.bridge)
    ),
  });
}

/**
 * The in-process hardhat network's stand-in, installed by the test fixture (contracts/test/veashi-deploy) after it
 * deploys the stand-in Yaho and reporters: the mainnet defaults with the fixture's addresses, chain ids and keeper,
 * plus any override a test needs. Never consulted on another network.
 */
export interface HardhatStandIn {
  addresses: VeashiAddresses;
  keeper: string;
  foreignChainId: number;
  homeChainId: number;
  overrides?: Partial<VeashiDefaults>;
}

// hardhat-deploy re-requires every file under deploy/ (this one included) on each run, so a module-level variable
// would not survive: the stand-in lives in one process-wide slot.
const STAND_IN_SLOT = Symbol.for("kleros.veashi.hardhatStandIn");
const slots = globalThis as unknown as Record<symbol, HardhatStandIn | undefined>;

export function setHardhatStandIn(standIn: HardhatStandIn | undefined): void {
  slots[STAND_IN_SLOT] = standIn;
}

export function standInParameters(env: NodeJS.ProcessEnv = process.env): VeashiParameters {
  const installed = slots[STAND_IN_SLOT];
  if (!installed) {
    throw new Error("Veashi: no hardhat stand-in installed (the test fixture in contracts/test/veashi-deploy does it)");
  }
  const { overrides, ...standIn } = installed;
  return assertValidParameters({
    ...MAINNET_DEFAULTS,
    ...overrides,
    set: "hardhat-stand-in",
    foreignChainId: standIn.foreignChainId,
    homeChainId: standIn.homeChainId,
    keeper: resolveKeeper(env, standIn.keeper),
    addresses: standIn.addresses,
  });
}
