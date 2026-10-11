import { describe, it, expect } from "vitest";

import { DisputeKits } from "./disputeKits";
import { DISPUTE_KIT_REGISTRY, getDisputeKitConfigByAddress, getDisputeKitConfigByKitId } from "./registry";
import { Features } from "./types";

const kits = Object.values(DISPUTE_KIT_REGISTRY);

describe("DISPUTE_KIT_REGISTRY", () => {
  it("has one entry per on-chain kit id, keyed by that id", () => {
    const enumIds = Object.values(DisputeKits).filter((v) => typeof v === "number");
    expect(Object.keys(DISPUTE_KIT_REGISTRY).map(Number).sort()).toEqual([...enumIds].sort());
    for (const [key, kit] of Object.entries(DISPUTE_KIT_REGISTRY)) expect(kit.id).toBe(Number(key));
  });

  it("gives every kit a distinct deployed address", () => {
    const addresses = kits.map((kit) => kit.address.toLowerCase());
    addresses.forEach((address) => expect(address).toMatch(/^0x[0-9a-f]{40}$/));
    expect(new Set(addresses).size).toBe(kits.length);
  });

  it("marks only shutter kits as revealing votes automatically", () => {
    const automatic = kits.filter((kit) => kit.hasAutomaticVoteReveal).map((kit) => kit.id);
    expect(automatic.sort()).toEqual([DisputeKits.Shutter, DisputeKits.GatedShutter]);
  });

  it("uses each feature set exactly once across kits", () => {
    const normalized = kits.flatMap((kit) => kit.featureSets.map((set) => [...set].sort().join("|")));
    expect(new Set(normalized).size).toBe(normalized.length);
  });

  it("puts the voting feature first in every gated feature set", () => {
    for (const kit of [DISPUTE_KIT_REGISTRY[DisputeKits.Gated], DISPUTE_KIT_REGISTRY[DisputeKits.GatedShutter]]) {
      const [first] = kit.featureSets;
      kit.featureSets.forEach((set) => expect(set[0]).toBe(first[0]));
    }
    expect(DISPUTE_KIT_REGISTRY[DisputeKits.GatedShutter].featureSets[0][0]).toBe(Features.ShieldedVote);
  });
});

describe("getDisputeKitConfigByAddress", () => {
  it.each(kits.map((kit) => [kit.displayName, kit] as const))("finds %s case-insensitively", (_, kit) => {
    expect(getDisputeKitConfigByAddress(kit.address.toLowerCase() as `0x${string}`)?.id).toBe(kit.id);
    expect(getDisputeKitConfigByAddress(kit.address.toUpperCase().replace("0X", "0x") as `0x${string}`)?.id).toBe(
      kit.id
    );
  });

  it("returns undefined for an unknown address", () => {
    expect(getDisputeKitConfigByAddress("0x000000000000000000000000000000000000dEaD")).toBeUndefined();
  });
});

describe("getDisputeKitConfigByKitId", () => {
  it.each([
    [DisputeKits.Gated, DisputeKits.Gated],
    ["4", DisputeKits.GatedShutter],
    [6n, DisputeKits.ClassicUniversity],
    ["0x1", DisputeKits.Classic],
  ])("resolves %s to kit %i", (input, expected) => {
    expect(getDisputeKitConfigByKitId(input)?.id).toBe(expected);
  });

  it.each([0, "7", "not-a-number", "1.5"])("returns undefined for %j", (input) => {
    expect(getDisputeKitConfigByKitId(input)).toBeUndefined();
  });
});
