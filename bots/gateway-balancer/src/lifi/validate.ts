import type { Topology } from "../config/schema";
import { NATIVE } from "../domain";
import type { LifiConfig } from "./config";

/**
 * Cross-checks of the `lifi` section against the topology that its zod schema cannot see (decisions [L36]). Each
 * `limits[]` entry names a topology chain and an asset whose decimals it repeats: the chain's `nativeDecimals` for
 * `native`, the collected asset's decimals for a token (the wrapped native has the native unit's decimals). A wrong
 * `decimals` would scale the per-transfer and daily limits by a power of ten. Returns every problem; empty is valid.
 */
export function validateLifiConfig(config: LifiConfig, topology: Topology): string[] {
  const problems: string[] = [];
  config.limits.forEach((limit, i) => {
    const at = `lifi.limits[${i}]`;
    const chain = topology.chains.find((c) => c.id === limit.chainId);
    if (!chain) {
      problems.push(`${at}: chain ${limit.chainId} is not in the topology`);
      return;
    }
    let expected: number | undefined;
    let label: string;
    if (limit.asset === NATIVE) {
      expected = chain.nativeDecimals;
      label = `native ${chain.nativeSymbol} of chain ${chain.id}`;
    } else {
      const address = limit.asset.toLowerCase();
      const collected = topology.pairs
        .flatMap((p) => p.collectedAssets)
        .find((a) => a.chainId === limit.chainId && a.address.toLowerCase() === address);
      if (collected) expected = collected.decimals;
      else if (chain.wrappedNative?.toLowerCase() === address) expected = chain.nativeDecimals;
      label = `${collected?.symbol ?? limit.asset} on chain ${chain.id}`;
    }
    if (expected === undefined) {
      problems.push(`${at}: ${label} is not a topology asset, so its decimals cannot be checked`);
    } else if (limit.decimals !== expected) {
      problems.push(`${at}.decimals: ${limit.decimals} differs from the topology's ${expected} for ${label}`);
    }
  });
  return problems;
}

/** Throws one error listing every problem; the lane factories call it so a bad section fails at startup. */
export function assertValidLifiConfig(config: LifiConfig, topology: Topology): void {
  const problems = validateLifiConfig(config, topology);
  if (problems.length > 0) throw new Error(`invalid lifi configuration: ${problems.join("; ")}`);
}
