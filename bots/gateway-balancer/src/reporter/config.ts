import { parseUnits } from "viem";
import { z } from "zod";
import type { ChainConfig, ReporterRoute } from "../config/schema";

/** A decimal amount in whole native tokens of the reporter's chain ("0.0002" ETH), converted with its decimals. */
const nativeAmountSchema = z.string().regex(/^\d+(\.\d+)?$/, 'expected a decimal amount such as "0.0002"');

const messageCountSchema = z.number().int().positive();

export const reporterRouteSettingsSchema = z
  .object({
    /** Estimated cost of one message, in whole native tokens of the reporter's chain. Required to fund the route. */
    costPerMessage: nativeAmountSchema.optional(),
    lowWaterMessages: messageCountSchema.optional(),
    targetMessages: messageCountSchema.optional(),
    /** Top-ups worth fewer messages than this are deferred (economic minimum). */
    minTopUpMessages: z.number().int().nonnegative().optional(),
  })
  .strict();

/** Owned by the reporter lane: per route cost per message, low-water and target message counts, minimum top-up. */
export const reporterConfigSchema = z
  .object({
    /** Defaults for every route; each route may override them under `routes.<routeId>`. */
    lowWaterMessages: messageCountSchema.default(20),
    targetMessages: messageCountSchema.default(100),
    minTopUpMessages: z.number().int().nonnegative().default(5),
    /**
     * An ambiguous `Transfers` deferral (`insufficient-holding:` or an unrecognised reason: a credit the operation
     * expects is missing) sends the operation to `attention` after this many consecutive deferrals...
     */
    maxAmbiguousDeferrals: z.number().int().positive().default(5),
    /** ...or once the first of them is this old, whichever comes first. */
    ambiguousDeferralMaxAgeMinutes: z.number().int().positive().default(60),
    /** Keyed by the topology route id (e.g. "base->arbitrum"). */
    routes: z.record(z.string().min(1), reporterRouteSettingsSchema).default({}),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.targetMessages <= value.lowWaterMessages) {
      ctx.addIssue({
        code: "custom",
        message: "targetMessages must exceed lowWaterMessages",
        path: ["targetMessages"],
      });
    }
    for (const [routeId, route] of Object.entries(value.routes)) {
      const low = route.lowWaterMessages ?? value.lowWaterMessages;
      const target = route.targetMessages ?? value.targetMessages;
      if (target <= low) {
        ctx.addIssue({
          code: "custom",
          message: `route ${routeId}: targetMessages must exceed lowWaterMessages`,
          path: ["routes", routeId, "targetMessages"],
        });
      }
    }
  })
  .default({});
export type ReporterConfig = z.infer<typeof reporterConfigSchema>;

/** A route's balance thresholds in the smallest unit of its chain's native token. */
export interface RouteThresholds {
  costPerMessage: bigint;
  lowWaterMessages: number;
  targetMessages: number;
  lowWater: bigint;
  target: bigint;
  minTopUp: bigint;
}

/** `undefined` when the route has no configured cost per message (the loop suspends it). */
export function routeThresholds(
  config: ReporterConfig,
  route: ReporterRoute,
  chain: Pick<ChainConfig, "nativeDecimals">
): RouteThresholds | undefined {
  const settings = config.routes[route.id];
  if (!settings?.costPerMessage) return undefined;
  const costPerMessage = parseUnits(settings.costPerMessage, chain.nativeDecimals);
  if (costPerMessage <= 0n) return undefined;
  const lowWaterMessages = settings.lowWaterMessages ?? config.lowWaterMessages;
  const targetMessages = settings.targetMessages ?? config.targetMessages;
  const minTopUpMessages = settings.minTopUpMessages ?? config.minTopUpMessages;
  return {
    costPerMessage,
    lowWaterMessages,
    targetMessages,
    lowWater: costPerMessage * BigInt(lowWaterMessages),
    target: costPerMessage * BigInt(targetMessages),
    minTopUp: costPerMessage * BigInt(minTopUpMessages),
  };
}
