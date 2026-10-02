/**
 * Shared value types. Frozen during a workflow run: lanes import from here and never edit it.
 */

export type Address = `0x${string}`;
export type Hex = `0x${string}`;
export type ChainId = number;

/** A gateway pair, e.g. "arc-arbitrum". Declared in `topology.pairs`. */
export type PairId = string;
/** A reporter route, e.g. "base->arbitrum". Declared in `topology.routes`. Direction matters. */
export type RouteId = string;
/** Assigned by the journal when an operation intent is recorded. */
export type OperationId = string;

export const NATIVE = "native" as const;
export type AssetAddress = Address | typeof NATIVE;

export interface Asset {
  chainId: ChainId;
  address: AssetAddress;
  symbol: string;
  decimals: number;
}

export function isNative(asset: Pick<Asset, "address">): boolean {
  return asset.address === NATIVE;
}

export function sameAsset(a: Pick<Asset, "chainId" | "address">, b: Pick<Asset, "chainId" | "address">): boolean {
  return a.chainId === b.chainId && a.address.toLowerCase() === b.address.toLowerCase();
}

export function assetKey(asset: Pick<Asset, "chainId" | "address">): string {
  return `${asset.chainId}:${asset.address.toLowerCase()}`;
}

/** A transaction the executor can sign and send. `value` is in the chain's native unit (wei). */
export interface TxRequest {
  chainId: ChainId;
  to: Address;
  data?: Hex;
  value: bigint;
  /** Optional gas limit; the executor estimates when absent. */
  gas?: bigint;
}
