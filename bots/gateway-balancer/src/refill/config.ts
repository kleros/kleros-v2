import { z } from "zod";

/**
 * Owned by the refill lane: reference case cost, low-water and target case counts, economic minimums, per pair
 * overrides.
 */
export const refillConfigSchema = z.object({}).passthrough().default({});
export type RefillConfig = z.infer<typeof refillConfigSchema>;
