import type { ChainId, PairId, RouteId } from "./types";

/**
 * Accounting scopes keep funds apart. A loop may only spend holdings of its own scope:
 * - `arbitration` funds belong to one gateway pair and only ever go to that pair's HomeGateway;
 * - `bridging` funds belong to one reporter route and only ever fund that route's reporter;
 * - `gas` is the operator-funded transaction-gas reserve of the EOA on one chain; nothing but gas spends it.
 */
export type AccountingScope =
  | { kind: "arbitration"; pairId: PairId }
  | { kind: "bridging"; routeId: RouteId }
  | { kind: "gas"; chainId: ChainId };

export function scopeKey(scope: AccountingScope): string {
  switch (scope.kind) {
    case "arbitration":
      return `arbitration:${scope.pairId}`;
    case "bridging":
      return `bridging:${scope.routeId}`;
    case "gas":
      return `gas:${scope.chainId}`;
  }
}

export function parseScopeKey(key: string): AccountingScope {
  const index = key.indexOf(":");
  if (index < 0) throw new Error(`invalid scope key: ${key}`);
  const kind = key.slice(0, index);
  const rest = key.slice(index + 1);
  switch (kind) {
    case "arbitration":
      return { kind, pairId: rest };
    case "bridging":
      return { kind, routeId: rest };
    case "gas": {
      const chainId = Number(rest);
      if (!Number.isInteger(chainId)) throw new Error(`invalid scope key: ${key}`);
      return { kind, chainId };
    }
    default:
      throw new Error(`invalid scope key: ${key}`);
  }
}

export function sameScope(a: AccountingScope, b: AccountingScope): boolean {
  return scopeKey(a) === scopeKey(b);
}

/** The ForeignGateway fee categories the contract keeps separate. */
export type ForeignFeeCategory = "arbitration" | "bridging";

/**
 * Claim keys name an on-chain balance that more than one loop may draw from. Every loop must
 * `Ledger.claim` against the key before withdrawing, so two loops never withdraw the same funds.
 */
export function foreignGatewayClaimKey(pairId: PairId, category: ForeignFeeCategory, assetKey: string): string {
  return `fg:${pairId}:${category}:${assetKey}`;
}
