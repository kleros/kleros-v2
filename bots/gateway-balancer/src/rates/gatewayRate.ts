import { decodeErrorResult, encodeFunctionData, isHex } from "viem";
import type { Address, ChainId, Hex, PairId, TxRequest } from "../domain";
import type { ChainClient, ForeignGatewayRate, RateRejection } from "../ports";
import { RATE_DECIMALS, RATE_ERROR_REJECTIONS, foreignGatewayRateAbi } from "./abi/foreignGatewayRate";
import { toE18 } from "./providers/types";

/** The executor's fixed suffix on `failed.error` and `reverted.reason` (decisions.md). */
const REVERT_DATA = /revertData=(0x[0-9a-fA-F]*|none)$/;

/** Extracts the revert bytes from an executor error string; null for `revertData=none` or any other form. */
export function revertDataOf(error: unknown): Hex | null {
  const text = typeof error === "string" ? error : error instanceof Error ? error.message : null;
  if (text === null) return null;
  const match = REVERT_DATA.exec(text.trimEnd());
  if (!match || match[1] === "none") return null;
  const data = match[1] as Hex;
  return isHex(data, { strict: true }) && data.length >= 10 && data.length % 2 === 0 ? data : null;
}

/** Maps executor revert bytes to the guardrail of the fragment's custom error; anything else is `unknown`. */
export function classifyRateRejection(error: unknown): RateRejection {
  const data = revertDataOf(error);
  if (!data) return "unknown";
  try {
    const decoded = decodeErrorResult({ abi: foreignGatewayRateAbi, data });
    return RATE_ERROR_REJECTIONS[decoded.errorName] ?? "unknown";
  } catch {
    return "unknown";
  }
}

/** `ForeignGatewayRate` over the pending fragment in `abi/foreignGatewayRate.ts`. */
export class ForeignGatewayRateAdapter implements ForeignGatewayRate {
  constructor(
    readonly pairId: PairId,
    private readonly chainId: ChainId,
    private readonly address: Address,
    private readonly chain: ChainClient,
    private readonly rateDecimals: number = RATE_DECIMALS
  ) {}

  async currentRate(): Promise<{ rateE18: bigint; updatedAt: Date | null }> {
    const [rate, updatedAt] = await this.chain.readContract<readonly [bigint, bigint]>({
      address: this.address,
      abi: foreignGatewayRateAbi,
      functionName: "currencyRate",
    });
    return {
      rateE18: toE18(rate, this.rateDecimals),
      updatedAt: updatedAt === 0n ? null : new Date(Number(updatedAt) * 1000),
    };
  }

  /** Converts 1e18 to the contract's scale (floored); the rate is never adjusted to fit a guardrail. */
  async updateRateTx(rateE18: bigint): Promise<TxRequest> {
    if (rateE18 <= 0n) throw new Error(`rate must be positive, got ${rateE18}`);
    const newRate =
      this.rateDecimals >= 18
        ? rateE18 * 10n ** BigInt(this.rateDecimals - 18)
        : rateE18 / 10n ** BigInt(18 - this.rateDecimals);
    return {
      chainId: this.chainId,
      to: this.address,
      data: encodeFunctionData({ abi: foreignGatewayRateAbi, functionName: "updateCurrencyRate", args: [newRate] }),
      value: 0n,
    };
  }

  classifyRejection(error: unknown): RateRejection {
    return classifyRateRejection(error);
  }
}
