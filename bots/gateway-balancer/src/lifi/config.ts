import { z } from "zod";
import type { Address } from "../domain";

// Local copies: `src/config/schema.ts` imports this module, so importing from it here would be a cycle.
const addressSchema = z
  .string()
  .regex(/^0x[0-9a-fA-F]{40}$/, "expected a 0x-prefixed 20-byte hex address")
  .transform((value) => value as Address);
const assetAddressSchema = z.union([z.literal("native"), addressSchema]);

const decimalAmount = z.string().regex(/^\d+(\.\d+)?$/, 'expected a decimal amount such as "0.5"');
const chainAddress = z.object({ chainId: z.number().int().positive(), address: addressSchema });
const chainAsset = z.object({ chainId: z.number().int().positive(), address: assetAddressSchema });

const limitSchema = z.object({
  chainId: z.number().int().positive(),
  asset: assetAddressSchema,
  /** The asset's decimals as configured in the topology; the amounts below are whole units. */
  decimals: z.number().int().min(0).max(36),
  perTransfer: decimalAmount,
  /** Rolling 24 hours, summed from the ledger's `transfer` spends of this chain and asset. */
  daily: decimalAmount,
});

const routeClassSchema = z.object({
  name: z.string().min(1),
  fromChainId: z.number().int().positive(),
  fromAsset: assetAddressSchema,
  toChainId: z.number().int().positive(),
  toAsset: assetAddressSchema,
  /** Whole units of the source asset to quote. */
  amount: decimalAmount,
});

/**
 * Owned by the refill lane: LI.FI endpoint, allowlists (tools, chains, assets, targets, spenders), limits,
 * slippage budget. `"lifi": {}` parses and approves nothing: every allowlist is empty and no asset has a limit.
 */
export const lifiConfigSchema = z
  .object({
    endpoint: z.string().url().default("https://li.quest/v1"),
    /** Sent as LI.FI's `integrator` parameter when set; not a secret. */
    integrator: z.string().min(1).optional(),
    /** LI.FI's per-request slippage parameter (fraction); the operation-level budget is `maxLossBps`. */
    requestSlippage: z.number().positive().max(0.05).default(0.005),
    /** End-to-end loss budget of one operation against the oracle baseline, in basis points. */
    maxLossBps: z.number().int().min(0).max(10_000).default(500),
    /** Quoted fees (normalized into the output asset) may not exceed this share of the gross output. */
    maxQuotedFeeBps: z.number().int().min(0).max(10_000).default(300),
    /**
     * The most LI.FI's fee forwarder may pay inside one transaction (`forwardNativeFees`, `forwardERC20Fees`), as a
     * share of the forwarding item's input (decisions [L41]); 100 is 1 percent.
     */
    maxFeeBps: z.number().int().min(0).max(10_000).default(100),
    allowedChains: z.array(z.number().int().positive()).default([]),
    /** LI.FI tool keys (bridges, exchanges, and `feeCollection` for LI.FI's own fee step). */
    allowedTools: z.array(z.string().min(1)).default([]),
    allowedAssets: z.array(chainAsset).default([]),
    /** Contracts a LI.FI transaction may call (the LI.FI diamond, a tool's own entry point). */
    allowedTargets: z.array(chainAddress).default([]),
    /** Addresses an ERC20 approval may name. */
    allowedSpenders: z.array(chainAddress).default([]),
    /**
     * Contracts the LI.FI Diamond may call or approve inside one transaction (`SwapData.callTo`, `SwapData.approveTo`
     * of every source swap): LI.FI's fee collector, a DEX router and its approval proxy. Empty: any quote with a
     * source swap is rejected.
     */
    allowedSwapContracts: z.array(chainAddress).default([]),
    /**
     * LayerSwap depositories (`LayerSwapData.depositoryReceiver`) per source chain. The quote reports the depository
     * only inside the calldata, so this allowlist is the bot's own check on top of the facet's signature check.
     */
    layerSwapDepositories: z.array(chainAddress).default([]),
    /**
     * Who LI.FI's fee forwarder (`forwardNativeFees`, `forwardERC20Fees` inside `SwapData.callData`) may pay per
     * source chain, besides the signer and the Diamond (decisions [L41]): LI.FI's fee wallet once verified with LI.FI.
     * Empty (the default and the shipped example): any quote whose fee step pays someone else is rejected.
     */
    feeRecipients: z.array(chainAddress).default([]),
    limits: z.array(limitSchema).default([]),
    /**
     * LI.FI's token for a chain's native asset when it is not the zero address (Arc: native USDC is
     * `0x3600…0000` with 6 decimals in LI.FI while the chain's native unit has 18).
     */
    nativeTokens: z
      .array(z.object({ chainId: z.number().int().positive(), address: addressSchema, decimals: z.number().int() }))
      .default([]),
    /** Maps token symbols onto price-oracle symbols for the baseline and fee normalization. */
    priceSymbols: z.record(z.string()).default({ WETH: "ETH", "USDC.e": "USDC", USDbC: "USDC" }),
    /** A quote older than this is requoted (against the original baseline) before the send. */
    quoteMaxAgeSeconds: z.number().int().positive().default(120),
    /** Minimum time between two status polls of one transfer. */
    pollIntervalSeconds: z.number().int().positive().default(30),
    /** After this long without a final status the transfer is `attention` (never a second bridge). */
    statusTimeoutSeconds: z.number().int().positive().default(7200),
    /**
     * An ERC20 delivery (WETH, a token) is credited only when the EOA's token balance rose by the amount (decisions
     * [L39]); a delivery not visible after this many checks (one per poll) goes to `attention`...
     */
    creditCheckMaxTicks: z.number().int().positive().default(10),
    /** ...or this long after the first failed check, whichever comes first. */
    creditCheckMaxAgeSeconds: z.number().int().positive().default(1800),
    /**
     * A continuation leg (its input already sits on the destination chain) the policy keeps blocking is requoted at
     * most this many times, or for `statusTimeoutSeconds` after the first block; then its booking moves from
     * `in-transit` to the `eoa` holding of that asset and the transfer goes to `attention` (decisions [L64]).
     */
    continuationBlockedMaxTicks: z.number().int().positive().default(20),
    /** Route classes the `lifi-probe` quotes; derived from the topology when empty. */
    routeClasses: z.array(routeClassSchema).default([]),
  })
  .default({});
export type LifiConfig = z.infer<typeof lifiConfigSchema>;
export type RouteClass = z.infer<typeof routeClassSchema>;
