import { z } from "zod";

/** Owned by the rates lane: price providers, freshness, disagreement threshold, minimum sources, update trigger. */
export const ratesConfigSchema = z.object({}).passthrough().default({});
export type RatesConfig = z.infer<typeof ratesConfigSchema>;
