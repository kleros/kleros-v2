/**
 * Quote-only probe for the operator's launch gates: prints, for every configured route class, the LI.FI quote,
 * the tools involved, fees, minimum output and the policy verdict. Never signs, never sends. Refill lane.
 *
 *   GATEWAY_BALANCER_CONFIG=config/production.json BALANCER_ADDRESS=0x… \
 *     yarn workspace @kleros/gateway-balancer-bot lifi-probe
 *
 * Exit code 0 when every class has an approved quote, 1 when any class has none, 2 on a usage error.
 */
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { formatUnits, getAddress, parseUnits } from "viem";
import { appConfigSchema, type AppConfig } from "../config/schema";
import { NATIVE, type Address, type Asset } from "../domain";
import type { PriceOracle, PriceResult, RouteRequest } from "../ports";
import { LifiClient } from "./client";
import type { RouteClass } from "./config";
import { evaluateQuote } from "./policy";
import { computeBaseline, minimumAcceptableOutput, normalizeFees } from "./slippage";
import { validateLifiConfig } from "./validate";

const DEFAULT_PROBE_AMOUNTS: Record<string, string> = { ETH: "0.05", USDC: "100" };

export interface ResolvedRouteClass {
  name: string;
  from: Asset;
  to: Asset;
  amount: bigint;
}

function nativeAsset(config: AppConfig, chainId: number): Asset {
  const chain = config.topology.chains.find((c) => c.id === chainId);
  if (!chain) throw new Error(`chain ${chainId} is not in the topology`);
  return { chainId, address: NATIVE, symbol: chain.nativeSymbol, decimals: chain.nativeDecimals };
}

function topologyAsset(config: AppConfig, chainId: number, address: string): Asset {
  if (address === NATIVE) return nativeAsset(config, chainId);
  for (const pair of config.topology.pairs) {
    const found = pair.collectedAssets.find(
      (a) => a.chainId === chainId && a.address.toLowerCase() === address.toLowerCase()
    );
    if (found) return { ...found };
  }
  throw new Error(`asset ${address} on chain ${chainId} is not a collected asset of the topology`);
}

function chainName(config: AppConfig, chainId: number): string {
  return config.topology.chains.find((c) => c.id === chainId)?.name ?? String(chainId);
}

/**
 * The configured route classes, or by default every collected asset to its home chain's native and (for an ERC20)
 * to its own chain's native.
 */
export function routeClasses(config: AppConfig): ResolvedRouteClass[] {
  const configured: RouteClass[] = config.lifi.routeClasses;
  if (configured.length > 0) {
    return configured.map((rc) => {
      const from = topologyAsset(config, rc.fromChainId, rc.fromAsset);
      return {
        name: rc.name,
        from,
        to: topologyAsset(config, rc.toChainId, rc.toAsset),
        amount: parseUnits(rc.amount, from.decimals),
      };
    });
  }
  const classes: ResolvedRouteClass[] = [];
  const seen = new Set<string>();
  const add = (from: Asset, to: Asset) => {
    const name = `${from.symbol}@${chainName(config, from.chainId)} -> ${to.symbol}@${chainName(config, to.chainId)}`;
    if (seen.has(name)) return;
    seen.add(name);
    classes.push({ name, from, to, amount: parseUnits(DEFAULT_PROBE_AMOUNTS[from.symbol] ?? "1", from.decimals) });
  };
  for (const pair of config.topology.pairs) {
    for (const asset of pair.collectedAssets) add({ ...asset }, nativeAsset(config, pair.homeChainId));
  }
  for (const pair of config.topology.pairs) {
    for (const asset of pair.collectedAssets) {
      if (asset.address !== NATIVE) add({ ...asset }, nativeAsset(config, pair.foreignChainId));
    }
  }
  return classes;
}

/** Prices from LI.FI's own response; the probe has no oracle. Labelled as such in the output. */
function reportedOracle(prices: Record<string, string>, symbols: Record<string, string>): PriceOracle {
  return {
    async price(base: string): Promise<PriceResult> {
      const entry = Object.entries(prices).find(([symbol]) => (symbols[symbol] ?? symbol) === base);
      if (!entry)
        return { kind: "unavailable", base, reason: "insufficient-sources", detail: "LI.FI reported no price" };
      const priceE18 = parseUnits(entry[1], 18);
      return { kind: "price", base, priceE18, observations: [], spreadBps: 0, at: new Date(0) };
    },
  };
}

export interface ProbeOptions {
  config: AppConfig;
  fetch: typeof globalThis.fetch;
  signer: Address;
  out: (line: string) => void;
}

export async function runProbe({ config, fetch, signer, out }: ProbeOptions): Promise<number> {
  const client = new LifiClient({ fetch, config: config.lifi, chains: config.topology.chains });
  const lifi = config.lifi;
  out(`LI.FI probe (quote only, never signs) against ${lifi.endpoint} as ${signer}`);
  out(
    `budget: maxLossBps ${lifi.maxLossBps}, maxQuotedFeeBps ${lifi.maxQuotedFeeBps}, maxFeeBps ` +
      `${lifi.maxFeeBps}; prices below are LI.FI-reported (the bot uses its oracle)`
  );
  // A configuration problem is a failed gate of its own; the classes are still probed for the operator's view.
  const problems = validateLifiConfig(lifi, config.topology);
  for (const problem of problems) out(`config: ${problem}`);
  let known: Set<string> | null = null;
  try {
    const tools = await client.tools();
    known = new Set([...tools.bridges, ...tools.exchanges]);
  } catch (error) {
    out(`tools: unavailable (${error instanceof Error ? error.message : String(error)})`);
  }
  let failures = problems.length;
  for (const rc of routeClasses(config)) {
    out("");
    out(`== ${rc.name}: ${formatUnits(rc.amount, rc.from.decimals)} ${rc.from.symbol}`);
    const request: RouteRequest = {
      fromChainId: rc.from.chainId,
      fromAsset: rc.from,
      toChainId: rc.to.chainId,
      toAsset: rc.to,
      amount: rc.amount,
      sender: signer,
      recipient: signer,
      purpose: "refill",
    };
    let result;
    try {
      result = await client.quote(request);
    } catch (error) {
      failures += 1;
      out(`verdict: ERROR ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }
    if (result.kind === "no-route") {
      failures += 1;
      out(`verdict: NO ROUTE (${result.reason})`);
      continue;
    }
    const { quote, fees, details } = result.parsed;
    const oracle = reportedOracle(details.reportedPricesUsd, lifi.priceSymbols);
    const normalized = await normalizeFees(oracle, lifi.priceSymbols, fees, rc.to);
    if (normalized.kind === "fees") quote.feeCostsInOutput = normalized.amount;
    const baseline = await computeBaseline(
      oracle,
      lifi.priceSymbols,
      { amount: quote.inputAmount, symbol: rc.from.symbol, decimals: rc.from.decimals },
      rc.to
    );
    const minimumOutput =
      baseline.kind === "baseline" ? minimumAcceptableOutput(baseline.amount, lifi.maxLossBps) : undefined;
    const violations = evaluateQuote(lifi, {
      request: { ...request, minimumOutput },
      quote,
      details,
      spentLast24h: 0n,
      signer,
      feesPaidInOutput: normalized.kind === "fees" ? normalized.included + normalized.onTop : undefined,
    });
    if (normalized.kind !== "fees") violations.push(`price: ${normalized.reason}`);
    if (baseline.kind !== "baseline") violations.push(`price: ${baseline.reason}`);
    const tools = [...new Set([quote.tool, ...details.includedTools])];
    const fmt = (amount: bigint) => `${formatUnits(amount, rc.to.decimals)} ${rc.to.symbol}`;
    out(`tool: ${quote.tool}; included steps: ${details.includedTools.join(", ") || "none"}`);
    if (known)
      out(
        `tools known to LI.FI: ` +
          `${tools.map((t) => `${t}${known!.has(t) || t === "feeCollection" ? "" : " (unlisted)"}`).join(", ")}`
      );
    for (const step of quote.steps) {
      const spender = step.spender ? `, spender ${getAddress(step.spender)}` : "";
      const approval = step.approvalAmount !== undefined ? `, approval ${step.approvalAmount}` : "";
      out(`step ${step.kind}: target ${getAddress(step.target)}${spender}${approval}, value ${step.tx.value}`);
    }
    out(`estimated output: ${fmt(quote.estimatedOutput)}; minimum output: ${fmt(quote.minimumOutput)}`);
    const feeList = fees.map(
      (f) => `${f.name} ${formatUnits(f.amount, f.token.decimals)} ${f.token.symbol}${f.included ? "" : " (on top)"}`
    );
    out(`fees: ${feeList.join("; ") || "none"}`);
    out(
      `fees in output: ${
        normalized.kind === "fees"
          ? `${fmt(normalized.included)} included, ${fmt(normalized.onTop)} on top`
          : "unavailable"
      }; gas: ` + `${formatUnits(quote.gasCostsNative, 18)} native`
    );
    const wrapped = quote.deliversWrapped ? "; delivers wrapped native (unwrap before deposit)" : "";
    out(`budget minimum: ${minimumOutput === undefined ? "unavailable" : fmt(minimumOutput)}${wrapped}`);
    if (violations.length === 0) {
      out("verdict: APPROVED");
    } else {
      failures += 1;
      out(`verdict: REJECTED`);
      for (const violation of violations) out(`  - ${violation}`);
    }
  }
  out("");
  out(
    failures === 0 ? "every route class has an approved quote" : `${failures} route class(es) without an approved quote`
  );
  return failures === 0 ? 0 : 1;
}

function argValue(argv: string[], flag: string): string | undefined {
  const index = argv.indexOf(flag);
  return index >= 0 ? argv[index + 1] : undefined;
}

async function main(argv: string[]): Promise<number> {
  try {
    const dotenv = await import("dotenv");
    dotenv.config();
  } catch {
    // optional
  }
  const path = argValue(argv, "--config") ?? process.env.GATEWAY_BALANCER_CONFIG ?? "config/example.json";
  const address = argValue(argv, "--address") ?? process.env.BALANCER_ADDRESS;
  if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    console.error(
      "lifi-probe: set BALANCER_ADDRESS (or --address 0x…) to the balancer EOA's address; the key is never read"
    );
    return 2;
  }
  const config = appConfigSchema.parse(JSON.parse(readFileSync(path, "utf8")));
  return runProbe({ config, fetch: globalThis.fetch, signer: getAddress(address), out: (line) => console.log(line) });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).then(
    (code) => {
      process.exitCode = code;
    },
    (error: unknown) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 2;
    }
  );
}
