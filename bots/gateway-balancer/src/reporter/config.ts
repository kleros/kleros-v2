import { z } from "zod";

/** Owned by the reporter lane: per route cost per message, low-water and target message counts, minimum top-up. */
export const reporterConfigSchema = z.object({}).passthrough().default({});
export type ReporterConfig = z.infer<typeof reporterConfigSchema>;
