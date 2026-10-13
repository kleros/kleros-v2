import { getAddress } from "ethers";
import type { ForeignGateway, HomeGateway, KlerosCoreRuler } from "../../../typechain-types";
import type { VeashiParameters } from "./parameters";

/**
 * Read-back of the deployed Veashi gateways (decisions [O7]): what each gateway stores, compared with the parameter
 * set and with the other gateway. The two oracle lists must mirror each other, same IDs in the same order: the home
 * oracle i's inbound adapter is the foreign oracle i's outbound adapter and the other way round. Nothing enforces it
 * on-chain, and a mismatch makes `onMessage` revert on the other chain.
 */

export interface OracleSnapshot {
  outboundReporter: string;
  outboundAdapter: string;
  inboundAdapter: string;
}

export interface ForeignSnapshot {
  address: string;
  governor: string;
  keeper: string;
  homeChainId: bigint;
  homeGateway: string;
  yaho: string;
  yaru: string;
  oracles: Array<OracleSnapshot & { enabled: boolean }>;
  defaultOracleIds: bigint[];
  defaultThreshold: bigint;
  feeForJuror: bigint;
  bridgingCosts: bigint[];
  usdc: { accepted: boolean; rateInEth: bigint; rateDecimals: bigint };
  homeNativeRate: bigint;
}

export interface HomeSnapshot {
  address: string;
  governor: string;
  arbitrator: string;
  foreignChainId: bigint;
  foreignGateway: string;
  yaho: string;
  yaru: string;
  oracles: OracleSnapshot[];
}

const same = (a: string, b: string) => getAddress(a) === getAddress(b);

export async function readForeignGateway(gateway: ForeignGateway, p: VeashiParameters): Promise<ForeignSnapshot> {
  const count = Number(await gateway.oracleCount());
  const oracles: ForeignSnapshot["oracles"] = [];
  const bridgingCosts: bigint[] = [];
  for (let id = 0; id < count; id++) {
    const oracle = await gateway.oracles(id);
    oracles.push({
      outboundReporter: oracle.outboundReporter,
      outboundAdapter: oracle.outboundAdapter,
      inboundAdapter: oracle.inboundAdapter,
      enabled: oracle.enabled,
    });
    bridgingCosts.push(await gateway.oracleBridgingCost(id));
  }
  const defaults = await gateway.getDefaultOracles();
  const usdc = await gateway.currencyRates(p.usdc.address);
  return {
    address: await gateway.getAddress(),
    governor: await gateway.governor(),
    keeper: await gateway.keeper(),
    homeChainId: await gateway.homeChainID(),
    homeGateway: await gateway.homeGateway(),
    yaho: await gateway.yaho(),
    yaru: await gateway.yaru(),
    oracles,
    defaultOracleIds: [...defaults.oracleIDs],
    defaultThreshold: defaults.threshold,
    feeForJuror: await gateway.feeForJuror(p.court.id),
    bridgingCosts,
    usdc: {
      accepted: usdc.feePaymentAccepted,
      rateInEth: usdc.rateInEth,
      rateDecimals: usdc.rateDecimals,
    },
    homeNativeRate: await gateway.homeNativeRate(),
  };
}

export async function readHomeGateway(gateway: HomeGateway): Promise<HomeSnapshot> {
  const count = Number(await gateway.oracleCount());
  const oracles: OracleSnapshot[] = [];
  for (let id = 0; id < count; id++) {
    const oracle = await gateway.oracles(id);
    oracles.push({
      outboundReporter: oracle.outboundReporter,
      outboundAdapter: oracle.outboundAdapter,
      inboundAdapter: oracle.inboundAdapter,
    });
  }
  return {
    address: await gateway.getAddress(),
    governor: await gateway.governor(),
    arbitrator: await gateway.arbitrator(),
    foreignChainId: await gateway.foreignChainID(),
    foreignGateway: await gateway.foreignGateway(),
    yaho: await gateway.yaho(),
    yaru: await gateway.yaru(),
    oracles,
  };
}

function checkOracleAddresses(
  problems: string[],
  label: string,
  actual: OracleSnapshot[],
  expected: VeashiParameters["addresses"]["foreign"]["oracles"]
): void {
  if (actual.length !== expected.length)
    problems.push(`${label}: ${actual.length} oracles, expected ${expected.length}`);
  expected.forEach((want, id) => {
    const have = actual[id];
    if (!have) return;
    for (const field of ["outboundReporter", "outboundAdapter", "inboundAdapter"] as const) {
      if (!same(have[field], want[field])) {
        problems.push(`${label} oracle ${id}: ${field} ${have[field]}, expected ${want[field]}`);
      }
    }
  });
}

/** The ForeignGateway against the parameter set. `homeGateway` is the expected HomeGateway (once configured). */
export function foreignProblems(
  s: ForeignSnapshot,
  p: VeashiParameters,
  expected: { governor: string; homeGateway: string }
): string[] {
  const problems: string[] = [];
  const check = (ok: boolean, message: string) => ok || problems.push(`ForeignGateway: ${message}`);
  check(same(s.governor, expected.governor), `governor ${s.governor}, expected ${expected.governor}`);
  check(same(s.keeper, p.keeper), `keeper ${s.keeper}, expected ${p.keeper}`);
  check(same(s.homeGateway, expected.homeGateway), `homeGateway ${s.homeGateway}, expected ${expected.homeGateway}`);
  check(s.homeChainId === BigInt(p.homeChainId), `homeChainID ${s.homeChainId}, expected ${p.homeChainId}`);
  check(same(s.yaho, p.addresses.foreign.yaho), `yaho ${s.yaho}, expected ${p.addresses.foreign.yaho}`);
  check(same(s.yaru, p.addresses.foreign.yaru), `yaru ${s.yaru}, expected ${p.addresses.foreign.yaru}`);
  checkOracleAddresses(problems, "ForeignGateway", s.oracles, p.addresses.foreign.oracles);
  s.oracles.forEach((o, id) => check(o.enabled, `oracle ${id} is disabled`));
  const ids = s.defaultOracleIds.map(Number);
  check(
    ids.join(",") === p.defaultOracleIds.join(",") && s.defaultThreshold === BigInt(p.defaultThreshold),
    `default oracles [${ids}] threshold ${s.defaultThreshold}, expected [${p.defaultOracleIds}] threshold ${p.defaultThreshold}`
  );
  check(
    s.feeForJuror === p.court.feeForJuror,
    `feeForJuror(${p.court.id}) ${s.feeForJuror}, expected ${p.court.feeForJuror}`
  );
  p.oracles.forEach((o) =>
    check(
      s.bridgingCosts[o.id] === o.bridgingCost,
      `bridging cost of oracle ${o.id} ${s.bridgingCosts[o.id]}, expected ${o.bridgingCost}`
    )
  );
  check(s.usdc.accepted, `USDC ${p.usdc.address} is not accepted`);
  check(
    s.usdc.rateInEth === p.usdc.rateInEth && s.usdc.rateDecimals === BigInt(p.usdc.rateDecimals),
    `USDC rate ${s.usdc.rateInEth}/10^${s.usdc.rateDecimals}, expected ${p.usdc.rateInEth}/10^${p.usdc.rateDecimals}`
  );
  check(s.homeNativeRate === p.homeNativeRate, `homeNativeRate ${s.homeNativeRate}, expected ${p.homeNativeRate}`);
  return problems;
}

/** The HomeGateway against the parameter set. */
export function homeProblems(
  s: HomeSnapshot,
  p: VeashiParameters,
  expected: { governor: string; arbitrator: string; foreignGateway: string }
): string[] {
  const problems: string[] = [];
  const check = (ok: boolean, message: string) => ok || problems.push(`HomeGateway: ${message}`);
  check(same(s.governor, expected.governor), `governor ${s.governor}, expected ${expected.governor}`);
  check(same(s.arbitrator, expected.arbitrator), `arbitrator ${s.arbitrator}, expected ${expected.arbitrator}`);
  check(
    same(s.foreignGateway, expected.foreignGateway),
    `foreignGateway ${s.foreignGateway}, expected ${expected.foreignGateway}`
  );
  check(
    s.foreignChainId === BigInt(p.foreignChainId),
    `foreignChainID ${s.foreignChainId}, expected ${p.foreignChainId}`
  );
  check(same(s.yaho, p.addresses.home.yaho), `yaho ${s.yaho}, expected ${p.addresses.home.yaho}`);
  check(same(s.yaru, p.addresses.home.yaru), `yaru ${s.yaru}, expected ${p.addresses.home.yaru}`);
  checkOracleAddresses(problems, "HomeGateway", s.oracles, p.addresses.home.oracles);
  return problems;
}

/** The two gateways against each other: they name each other, and their oracle lists mirror (same IDs, same order). */
export function mirrorProblems(foreign: ForeignSnapshot, home: HomeSnapshot): string[] {
  const problems: string[] = [];
  if (!same(foreign.homeGateway, home.address)) {
    problems.push(`ForeignGateway.homeGateway ${foreign.homeGateway} is not the HomeGateway ${home.address}`);
  }
  if (!same(home.foreignGateway, foreign.address)) {
    problems.push(`HomeGateway.foreignGateway ${home.foreignGateway} is not the ForeignGateway ${foreign.address}`);
  }
  if (foreign.oracles.length !== home.oracles.length) {
    problems.push(`oracle count: ForeignGateway ${foreign.oracles.length}, HomeGateway ${home.oracles.length}`);
  }
  const count = Math.min(foreign.oracles.length, home.oracles.length);
  for (let id = 0; id < count; id++) {
    const [f, h] = [foreign.oracles[id], home.oracles[id]];
    if (!same(h.inboundAdapter, f.outboundAdapter)) {
      problems.push(
        `oracle ${id}: HomeGateway inbound adapter ${h.inboundAdapter} != ForeignGateway outbound ${f.outboundAdapter}`
      );
    }
    if (!same(h.outboundAdapter, f.inboundAdapter)) {
      problems.push(
        `oracle ${id}: HomeGateway outbound adapter ${h.outboundAdapter} != ForeignGateway inbound ${f.inboundAdapter}`
      );
    }
  }
  return problems;
}

/** KlerosCoreRuler mode for the HomeGateway: manual (1), with `ruler` as its ruler. */
export async function rulerProblems(
  ruler: KlerosCoreRuler,
  homeGateway: string,
  rulerAccount: string
): Promise<string[]> {
  const problems: string[] = [];
  const current = await ruler.rulers(homeGateway);
  if (!same(current, rulerAccount)) problems.push(`ruler of the HomeGateway is ${current}, expected ${rulerAccount}`);
  const mode = (await ruler.settings(homeGateway)).rulingMode;
  if (mode !== 1n) problems.push(`ruling mode of the HomeGateway is ${mode}, expected manual (1)`);
  return problems;
}

export function assertNoProblems(what: string, problems: string[]): void {
  if (problems.length > 0) throw new Error(`Veashi read-back failed (${what}):\n  - ${problems.join("\n  - ")}`);
}
