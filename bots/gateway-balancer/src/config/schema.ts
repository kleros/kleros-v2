import { z } from "zod";
import { lifiConfigSchema } from "../lifi/config";
import { platformConfigSchema } from "../platform/config";
import { ratesConfigSchema } from "../rates/config";
import { refillConfigSchema } from "../refill/config";
import { reporterConfigSchema } from "../reporter/config";
import type { Address } from "../domain";

/**
 * The non-secret configuration file. The topology (chains, pairs, routes, assets) is shared and frozen;
 * each lane owns the schema of its own section (`platform`, `refill`, `lifi`, `reporter`, `rates`).
 * Secrets (the EOA key, RPC URLs with keys, webhook URLs) come from the environment, never from this file.
 */

export const addressSchema = z
  .string()
  .regex(/^0x[0-9a-fA-F]{40}$/, "expected a 0x-prefixed 20-byte hex address")
  .transform((value) => value as Address);

export const assetAddressSchema = z.union([z.literal("native"), addressSchema]);

export const chainConfigSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  /** Name of the environment variable holding the RPC URL (URLs may embed keys). */
  rpcUrlEnv: z.string().min(1),
  nativeSymbol: z.string().min(1),
  nativeDecimals: z.number().int().positive().default(18),
  /** Needed on any chain where a route may deliver wrapped native (unwrap before depositing). */
  wrappedNative: addressSchema.optional(),
  confirmations: z.number().int().min(1).default(3),
  /** Template with `{hash}`, e.g. "https://arbiscan.io/tx/{hash}". */
  explorerTxUrl: z.string().optional(),
});

export const assetConfigSchema = z.object({
  chainId: z.number().int().positive(),
  address: assetAddressSchema,
  symbol: z.string().min(1),
  decimals: z.number().int().min(0).max(36),
});

export const pairConfigSchema = z.object({
  id: z.string().min(1),
  foreignChainId: z.number().int().positive(),
  foreignGateway: addressSchema,
  homeChainId: z.number().int().positive(),
  homeGateway: addressSchema,
  /** The assets the ForeignGateway collects; every entry lives on the foreign chain. */
  collectedAssets: z.array(assetConfigSchema).min(1),
  /** The currency the ForeignGateway's rate converts ETH into (e.g. "USD"); absent for an ETH-denominated pair. */
  rateCurrency: z.string().min(1).optional(),
});

export const reporterRouteSchema = z.object({
  /** e.g. "base->arbitrum". */
  id: z.string().min(1),
  pairId: z.string().min(1),
  /** The chain the reporter is deployed on (the sending side of the route). */
  chainId: z.number().int().positive(),
  reporter: addressSchema,
  /** v1 supports one mechanism: a plain native transfer accepted by the reporter's `receive()`. */
  fundingMethod: z.literal("nativeTransfer"),
});

export const topologySchema = z.object({
  chains: z.array(chainConfigSchema).min(1),
  pairs: z.array(pairConfigSchema).min(1),
  routes: z.array(reporterRouteSchema),
});

export const appConfigSchema = z.object({
  topology: topologySchema,
  platform: platformConfigSchema,
  refill: refillConfigSchema,
  lifi: lifiConfigSchema,
  reporter: reporterConfigSchema,
  rates: ratesConfigSchema,
});

export type ChainConfig = z.infer<typeof chainConfigSchema>;
export type AssetConfig = z.infer<typeof assetConfigSchema>;
export type PairConfig = z.infer<typeof pairConfigSchema>;
export type ReporterRoute = z.infer<typeof reporterRouteSchema>;
export type Topology = z.infer<typeof topologySchema>;
export type AppConfig = z.infer<typeof appConfigSchema>;
export type AppConfigInput = z.input<typeof appConfigSchema>;
