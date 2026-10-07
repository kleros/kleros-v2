import { parseEther, parseUnits } from "viem";
import { z } from "zod";

/** A non-negative decimal amount in whole units ("0.003" ETH, "25" USDC); parsed with the asset's decimals. */
const decimalAmount = z.string().regex(/^\d+(\.\d+)?$/, 'expected a decimal amount such as "0.003"');

const depositMethodSchema = z.enum(["function", "nativeTransfer"]);

const pairOverrideSchema = z.object({
  enabled: z.boolean().optional(),
  referenceCaseCostEth: decimalAmount.optional(),
  lowWaterCases: z.number().int().positive().optional(),
  targetCases: z.number().int().positive().optional(),
  /** Per collected-asset symbol: amounts below this are deferred (uneconomical to withdraw and bridge). */
  economicMinimums: z.record(decimalAmount).optional(),
  depositMethod: depositMethodSchema.optional(),
});

/**
 * Owned by the refill lane: reference case cost, low-water and target case counts, economic minimums, per pair
 * overrides. `"refill": {}` parses; without a `referenceCaseCostEth` a pair's loop only observes and never refills.
 */
export const refillConfigSchema = z
  .object({
    /** ETH cost of one reference case (three jurors). Launch gate: no default, a pair without it never refills. */
    referenceCaseCostEth: decimalAmount.optional(),
    /** Trigger strictly below `lowWaterCases * referenceCaseCostEth` of available native ETH. */
    lowWaterCases: z.number().int().positive().default(20),
    /** Nominal capacity; a sweep that cannot reach it is a partial refill and notifies. */
    targetCases: z.number().int().positive().default(100),
    economicMinimums: z.record(decimalAmount).default({ ETH: "0.002", USDC: "5" }),
    /** How the HomeGateway is funded: the pending fragment's payable function, or a plain native transfer. */
    depositMethod: depositMethodSchema.default("function"),
    /**
     * An ambiguous `Transfers` deferral (`insufficient-holding:` or an unrecognised reason, decisions [L20]) is
     * retried at most this many consecutive times before the operation goes to `attention`.
     */
    maxAmbiguousDeferrals: z.number().int().positive().default(10),
    /** ...or for at most this long after the first one of the run, whichever comes first. */
    ambiguousDeferralMaxAgeSeconds: z.number().int().positive().default(3600),
    pairs: z.record(pairOverrideSchema).default({}),
  })
  .default({});
export type RefillConfig = z.infer<typeof refillConfigSchema>;
export type DepositMethodConfig = z.infer<typeof depositMethodSchema>;

export interface PairRefillSettings {
  enabled: boolean;
  /** Wei; null when not configured (the loop observes and never refills). */
  referenceCaseCostWei: bigint | null;
  lowWaterCases: number;
  targetCases: number;
  economicMinimums: Record<string, string>;
  depositMethod: DepositMethodConfig;
}

/** The effective settings of one pair: its override on top of the section defaults. */
export function pairRefillSettings(config: RefillConfig, pairId: string): PairRefillSettings {
  const override = config.pairs[pairId] ?? {};
  const cost = override.referenceCaseCostEth ?? config.referenceCaseCostEth;
  return {
    enabled: override.enabled ?? true,
    referenceCaseCostWei: cost === undefined ? null : parseEther(cost),
    lowWaterCases: override.lowWaterCases ?? config.lowWaterCases,
    targetCases: override.targetCases ?? config.targetCases,
    economicMinimums: { ...config.economicMinimums, ...(override.economicMinimums ?? {}) },
    depositMethod: override.depositMethod ?? config.depositMethod,
  };
}

/** The economic minimum of an asset in its smallest unit; 0 when none is configured for its symbol. */
export function economicMinimum(settings: PairRefillSettings, symbol: string, decimals: number): bigint {
  const value = settings.economicMinimums[symbol];
  return value === undefined ? 0n : parseUnits(value, decimals);
}
