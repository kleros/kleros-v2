import { describe, expect, it } from "vitest";
import { foreignGatewayClaimKey, parseScopeKey, sameScope, scopeKey } from "./accounting";

describe("accounting scopes", () => {
  it("round-trips every scope kind through its key", () => {
    for (const scope of [
      { kind: "arbitration" as const, pairId: "arc-arbitrum" },
      { kind: "bridging" as const, routeId: "base->arbitrum" },
      { kind: "gas" as const, chainId: 42161 },
    ]) {
      expect(parseScopeKey(scopeKey(scope))).toEqual(scope);
    }
    expect(scopeKey({ kind: "bridging", routeId: "base->arbitrum" })).toBe("bridging:base->arbitrum");
  });

  it("rejects malformed keys", () => {
    expect(() => parseScopeKey("nope")).toThrow();
    expect(() => parseScopeKey("gas:abc")).toThrow();
    expect(() => parseScopeKey("other:1")).toThrow();
  });

  it("compares scopes and builds claim keys", () => {
    expect(sameScope({ kind: "gas", chainId: 1 }, { kind: "gas", chainId: 1 })).toBe(true);
    expect(sameScope({ kind: "gas", chainId: 1 }, { kind: "arbitration", pairId: "1" })).toBe(false);
    expect(foreignGatewayClaimKey("arc-arbitrum", "bridging", "5042:native")).toBe(
      "fg:arc-arbitrum:bridging:5042:native"
    );
  });
});
