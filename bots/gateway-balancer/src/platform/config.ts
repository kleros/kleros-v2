import { z } from "zod";

/**
 * Owned by the platform lane: scheduling, confirmations, retry/backoff, gas reserves, notifications, journal
 * path, health.
 */
export const platformConfigSchema = z.object({}).passthrough().default({});
export type PlatformConfig = z.infer<typeof platformConfigSchema>;
