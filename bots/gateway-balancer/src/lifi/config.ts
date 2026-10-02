import { z } from "zod";

/**
 * Owned by the refill lane: LI.FI endpoint, allowlists (tools, chains, assets, targets, spenders), limits,
 * slippage budget.
 */
export const lifiConfigSchema = z.object({}).passthrough().default({});
export type LifiConfig = z.infer<typeof lifiConfigSchema>;
