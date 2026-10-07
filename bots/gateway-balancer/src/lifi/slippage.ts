import { applyBps } from "../domain";
import type { PriceOracle } from "../ports";
import type { QuotedFee } from "./client";

/**
 * The operation-level loss budget (specification 5.2). The baseline is the operation's input converted into
 * the output asset at the oracle's USD prices; the minimum acceptable output is the baseline minus `maxLossBps`.
 * A quote passes when its minimum output plus its quoted fees (normalized into the output asset), plus the fees
 * of earlier legs of the same operation, reaches that minimum. Resumes and requotes reuse the persisted baseline.
 */

export interface PricedAmount {
  amount: bigint;
  symbol: string;
  decimals: number;
}

export interface PricedAsset {
  symbol: string;
  decimals: number;
}

export type BaselineResult =
  | { kind: "baseline"; amount: bigint; inputPriceE18: bigint | null; outputPriceE18: bigint | null }
  | { kind: "unavailable"; reason: string };

export type PriceSymbols = Record<string, string>;

export function priceSymbol(symbol: string, symbols: PriceSymbols): string {
  return symbols[symbol] ?? symbol;
}

function rescale(amount: bigint, fromDecimals: number, toDecimals: number): bigint {
  if (fromDecimals === toDecimals) return amount;
  if (fromDecimals < toDecimals) return amount * 10n ** BigInt(toDecimals - fromDecimals);
  return amount / 10n ** BigInt(fromDecimals - toDecimals);
}

/** Converts at USD prices (1e18-scaled) between two assets of given decimals, floored. */
export function convertAtPrices(
  amount: bigint,
  from: { decimals: number; priceE18: bigint },
  to: { decimals: number; priceE18: bigint }
): bigint {
  if (to.priceE18 <= 0n) throw new Error("convertAtPrices: non-positive output price");
  const value = rescale(amount * from.priceE18, from.decimals, to.decimals);
  return value / to.priceE18;
}

/** Converts `input` into `output` units; one oracle read per distinct price symbol, none when they coincide. */
export async function convertWithOracle(
  oracle: PriceOracle,
  symbols: PriceSymbols,
  input: PricedAmount,
  output: PricedAsset
): Promise<BaselineResult> {
  const inSymbol = priceSymbol(input.symbol, symbols);
  const outSymbol = priceSymbol(output.symbol, symbols);
  if (inSymbol === outSymbol) {
    return {
      kind: "baseline",
      amount: rescale(input.amount, input.decimals, output.decimals),
      inputPriceE18: null,
      outputPriceE18: null,
    };
  }
  const [inPrice, outPrice] = [await oracle.price(inSymbol), await oracle.price(outSymbol)];
  if (inPrice.kind !== "price")
    return { kind: "unavailable", reason: `${inSymbol} price ${inPrice.reason}: ${inPrice.detail}` };
  if (outPrice.kind !== "price") {
    return { kind: "unavailable", reason: `${outSymbol} price ${outPrice.reason}: ${outPrice.detail}` };
  }
  return {
    kind: "baseline",
    amount: convertAtPrices(
      input.amount,
      { decimals: input.decimals, priceE18: inPrice.priceE18 },
      { decimals: output.decimals, priceE18: outPrice.priceE18 }
    ),
    inputPriceE18: inPrice.priceE18,
    outputPriceE18: outPrice.priceE18,
  };
}

/** The operation's baseline output: input converted at the oracle's prices. */
export function computeBaseline(
  oracle: PriceOracle,
  symbols: PriceSymbols,
  input: PricedAmount,
  output: PricedAsset
): Promise<BaselineResult> {
  return convertWithOracle(oracle, symbols, input, output);
}

export function minimumAcceptableOutput(baseline: bigint, maxLossBps: number): bigint {
  return baseline - applyBps(baseline, maxLossBps);
}

/**
 * Normalizes quoted fees into output-asset units; `unavailable` when a fee token cannot be priced. `included` fees are
 * deducted from the input (the quoted output already reflects them); fees with `included: false` are paid on top and
 * reduce the net proceeds. `amount` is the budget credit `withinBudget` applies: included fees minus the fees paid on
 * top (negative when the fees on top dominate), so a fee paid on top is never added to the budget.
 */
export async function normalizeFees(
  oracle: PriceOracle,
  symbols: PriceSymbols,
  fees: readonly QuotedFee[],
  output: PricedAsset
): Promise<
  { kind: "fees"; amount: bigint; included: bigint; onTop: bigint } | { kind: "unavailable"; reason: string }
> {
  let included = 0n;
  let onTop = 0n;
  for (const fee of fees) {
    if (fee.amount === 0n) continue;
    const converted = await convertWithOracle(
      oracle,
      symbols,
      { amount: fee.amount, symbol: fee.token.symbol, decimals: fee.token.decimals },
      output
    );
    if (converted.kind !== "baseline") return { kind: "unavailable", reason: `fee ${fee.name}: ${converted.reason}` };
    if (fee.included) included += converted.amount;
    else onTop += converted.amount;
  }
  return { kind: "fees", amount: included - onTop, included, onTop };
}

/**
 * What a quote's minimum output must reach for this leg: the operation's minimum acceptable output less the fees
 * already paid by earlier legs. Passed to the route provider as `RouteRequest.minimumOutput`.
 */
export function legMinimumOutput(minimumAcceptable: bigint, priorFeesInOutput: bigint): bigint {
  const value = minimumAcceptable - priorFeesInOutput;
  return value > 0n ? value : 0n;
}

/**
 * The budget check of one quote: minimum output plus its fee credit (`normalizeFees().amount`: included fees minus
 * fees paid on top) reaches the leg minimum.
 */
export function withinBudget(input: { legMinimum: bigint; quoteMinimumOutput: bigint; feesInOutput: bigint }): boolean {
  return input.quoteMinimumOutput + input.feesInOutput >= input.legMinimum;
}
