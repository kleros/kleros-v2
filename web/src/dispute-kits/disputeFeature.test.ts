import { describe, it, expect, vi } from "vitest";

import {
  ensureValidSmart,
  featureGroups,
  findMatchingKits,
  getDisabledOptions,
  getDisputeKitsForDeployment,
  getFeatureGroupsForDeployment,
  getVisibleFeaturesForCourt,
  resolveInitialFeatureSet,
  toggleFeature,
} from "./disputeFeature";
import { DisputeKits } from "./disputeKits";
import type { GatedDisputeKitData } from "./prepareArbitratorExtradata";
import { DISPUTE_KIT_REGISTRY } from "./registry";
import { Features, Group } from "./types";

const allKits = Object.values(DISPUTE_KIT_REGISTRY);
const kit = (id: DisputeKits) => DISPUTE_KIT_REGISTRY[id];
const ids = (kits: { id: DisputeKits }[]) => kits.map((k) => k.id);

const gatedData = (isERC1155: boolean): GatedDisputeKitData => ({
  isValid: true,
  tokenGate: "0x00000000000000000000000000000000000000aa",
  isERC1155,
  tokenId: isERC1155 ? "7" : "0",
});

describe("resolveInitialFeatureSet", () => {
  it.each([
    DisputeKits.Classic,
    DisputeKits.Shutter,
    DisputeKits.ArgentinaConsumerProtection,
    DisputeKits.ClassicUniversity,
  ])("returns the first feature set for single-set kit %i", (id) => {
    expect(resolveInitialFeatureSet(kit(id))).toEqual(kit(id).featureSets[0]);
  });

  it.each([
    { id: DisputeKits.Gated, vote: Features.ClassicVote },
    { id: DisputeKits.GatedShutter, vote: Features.ShieldedVote },
  ])("picks the ERC-1155 or ERC-20 set for gated kit $id from its data", ({ id, vote }) => {
    expect(resolveInitialFeatureSet(kit(id), gatedData(true))).toEqual([vote, Features.GatedErc1155]);
    expect(resolveInitialFeatureSet(kit(id), gatedData(false))).toEqual([vote, Features.GatedErc20]);
    expect(resolveInitialFeatureSet(kit(id))).toEqual([vote, Features.GatedErc20]);
  });
});

describe("toggleFeature", () => {
  it("replaces the other feature of the same group (radio behaviour)", () => {
    expect(
      toggleFeature([Features.ClassicVote, Features.ClassicEligibility], Features.ShieldedVote, featureGroups)
    ).toEqual([Features.ClassicEligibility, Features.ShieldedVote]);
  });

  it("deselects a feature that is already selected", () => {
    expect(
      toggleFeature([Features.ClassicVote, Features.ClassicEligibility], Features.ClassicVote, featureGroups)
    ).toEqual([Features.ClassicEligibility]);
  });

  it("leaves the selection untouched for a feature outside every group", () => {
    const selected = [Features.ClassicVote];
    expect(toggleFeature(selected, Features.UniversityVote, { ...featureGroups, [Group.Voting]: [] })).toBe(selected);
  });
});

describe("findMatchingKits", () => {
  it.each([
    { selected: [Features.ClassicEligibility, Features.ShieldedVote], expected: [DisputeKits.Shutter] },
    { selected: [Features.GatedErc1155, Features.ClassicVote], expected: [DisputeKits.Gated] },
    { selected: [Features.ShieldedVote, Features.GatedErc20], expected: [DisputeKits.GatedShutter] },
    { selected: [Features.UniversityVote, Features.ClassicEligibility], expected: [DisputeKits.ClassicUniversity] },
    { selected: [Features.ClassicVote], expected: [] },
    { selected: [Features.UniversityVote, Features.GatedErc20], expected: [] },
  ])("matches $selected exactly to $expected", ({ selected, expected }) => {
    expect(ids(findMatchingKits(selected, allKits))).toEqual(expected);
  });
});

describe("ensureValidSmart", () => {
  it("keeps a selection that can still complete into a kit", () => {
    expect(ensureValidSmart([Features.ShieldedVote], featureGroups, allKits)).toEqual([Features.ShieldedVote]);
  });

  it("drops the first group whose removal makes the selection valid", () => {
    expect(ensureValidSmart([Features.UniversityVote, Features.GatedErc20], featureGroups, allKits)).toEqual([
      Features.GatedErc20,
    ]);
  });

  it("falls back to the last picked feature when no single group removal helps", () => {
    const classicOnly = [kit(DisputeKits.Classic)];
    expect(ensureValidSmart([Features.ShieldedVote, Features.GatedErc20], featureGroups, classicOnly)).toEqual([
      Features.GatedErc20,
    ]);
  });

  it("returns an empty selection when nothing is selected and nothing matches", () => {
    expect(ensureValidSmart([], featureGroups, [])).toEqual([]);
  });
});

describe("getDisabledOptions", () => {
  it("disables nothing while the selection is empty", () => {
    expect(getDisabledOptions([], featureGroups, allKits).size).toBe(0);
  });

  it("disables eligibility options no kit offers with university voting", () => {
    expect(getDisabledOptions([Features.UniversityVote], featureGroups, allKits)).toEqual(
      new Set([Features.GatedErc20, Features.GatedErc1155, Features.ArgentinaConsumerProtection])
    );
  });

  it("disables Argentina consumer protection once shielded voting is chosen", () => {
    expect(getDisabledOptions([Features.ShieldedVote], featureGroups, allKits)).toEqual(
      new Set([Features.ArgentinaConsumerProtection])
    );
  });
});

describe("getVisibleFeaturesForCourt", () => {
  it("shows only the features of the kits a court supports, in group order", () => {
    expect(getVisibleFeaturesForCourt([DisputeKits.Classic, DisputeKits.Shutter], allKits, featureGroups)).toEqual({
      [Group.Voting]: [Features.ClassicVote, Features.ShieldedVote],
      [Group.Eligibility]: [Features.ClassicEligibility],
    });
  });

  it("shows both gate token types for a court supporting the gated kit", () => {
    expect(getVisibleFeaturesForCourt([DisputeKits.Gated], allKits, featureGroups)).toEqual({
      [Group.Voting]: [Features.ClassicVote],
      [Group.Eligibility]: [Features.GatedErc20, Features.GatedErc1155],
    });
  });
});

describe("deployment filtering", () => {
  it("offers every kit and the university vote outside mainnet", () => {
    expect(ids(getDisputeKitsForDeployment())).toContain(DisputeKits.ClassicUniversity);
    expect(getFeatureGroupsForDeployment()[Group.Voting]).toContain(Features.UniversityVote);
  });

  it("hides the university kit and vote on mainnet", () => {
    vi.stubEnv("REACT_APP_DEPLOYMENT", "mainnet");

    expect(ids(getDisputeKitsForDeployment())).not.toContain(DisputeKits.ClassicUniversity);
    expect(getDisputeKitsForDeployment()).toHaveLength(allKits.length - 1);
    expect(getFeatureGroupsForDeployment()).toEqual({
      [Group.Voting]: [Features.ClassicVote, Features.ShieldedVote],
      [Group.Eligibility]: featureGroups[Group.Eligibility],
    });
  });
});
