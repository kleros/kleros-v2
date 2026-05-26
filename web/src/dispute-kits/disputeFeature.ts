import { DisputeKits } from "src/dispute-kits";

import { isProductionDeployment } from "../consts/index";

import { DisputeKitDataMap, GatedDisputeKitData } from "./prepareArbitratorExtradata";

export enum Group {
  Voting = "Voting",
  Eligibility = "Eligibility",
}

/** A single feature, grouped into categories. has to be atomic.
 * For gated, we split them into atomic erc20 and erc1155 */
export enum Features {
  ShieldedVote = "shieldedVote",
  ClassicVote = "classicVote",
  UniversityVote = "universityVote",
  ClassicEligibility = "classicEligibility",
  GatedErc20 = "gatedErc20",
  GatedErc1155 = "gatedErc1155",
  ArgentinaConsumerProtection = "argentinaConsumerProtection",
}

/** Group of features (like radio buttons per category) */
export type FeatureGroups = Record<string, Features[]>;

/** Definition of a dispute kit */
export interface DisputeKit {
  id: DisputeKits;
  /**
   * The feature sets this kit supports.
   * Each array represents a valid configuration, and has to be 1:1,
   * if either subset matches the selected feature array this dispute kit is selected
   */
  featureSets: Features[][];
}

// groups
// withing a group only one feature can be selected, we deselect the other one when a new one is selected
// we don't use these directly in here for utils because these need to be filtered based on court selection.
// NOTE: a feature cannot appear in more than one Group
// DEV: the order of features in array , determine the order the radios appear on UI
export const featureGroups: FeatureGroups = {
  [Group.Voting]: [Features.ClassicVote, Features.ShieldedVote, Features.UniversityVote],
  [Group.Eligibility]: [
    Features.ClassicEligibility,
    Features.GatedErc20,
    Features.GatedErc1155,
    Features.ArgentinaConsumerProtection,
  ],
};

// dispute kits
// each array is a unique match, for multiple combinations, add more arrays.
// TODO: move to dk cofig registry
// we need this to structure disputekit data for the dispute, not sure how to move this to config yet
export const disputeKits: DisputeKit[] = [
  {
    id: DisputeKits.Classic,
    featureSets: [[Features.ClassicVote, Features.ClassicEligibility]],
  }, // strict
  { id: DisputeKits.Shutter, featureSets: [[Features.ShieldedVote, Features.ClassicEligibility]] }, // strict
  {
    id: DisputeKits.Gated,
    // strictly keep the common feature in front and in order.
    featureSets: [
      [Features.ClassicVote, Features.GatedErc20],
      [Features.ClassicVote, Features.GatedErc1155],
    ],
  },
  {
    id: DisputeKits.GatedShutter,
    featureSets: [
      [Features.ShieldedVote, Features.GatedErc20],
      [Features.ShieldedVote, Features.GatedErc1155],
    ],
  },
  {
    id: DisputeKits.ArgentinaConsumerProtection,
    featureSets: [[Features.ClassicVote, Features.ArgentinaConsumerProtection]],
  },
  {
    id: DisputeKits.ClassicUniversity,
    featureSets: [[Features.UniversityVote, Features.ClassicEligibility]],
  },
];

// excluded on mainnet, we can later update it to an array if we want to have more deployment specific kits
const UNIVERSITY_DISPUTE_KIT_ID = DisputeKits.ClassicUniversity;

/**
 * Dispute kits available for the current deployment.
 * University DK is excluded on mainnet.
 */
export const getDisputeKitsForDeployment = (): DisputeKit[] =>
  isProductionDeployment() ? disputeKits.filter((kit) => kit.id !== UNIVERSITY_DISPUTE_KIT_ID) : disputeKits;

/**
 * Feature groups for the current deployment.
 * University vote is excluded on mainnet.
 */
export const getFeatureGroupsForDeployment = (): FeatureGroups =>
  isProductionDeployment()
    ? {
        ...featureGroups,
        [Group.Voting]: featureGroups[Group.Voting].filter((f) => f !== Features.UniversityVote),
      }
    : featureGroups;

export function resolveInitialFeatureSet(kit: DisputeKit, disputeKitData?: DisputeKitDataMap[DisputeKits]) {
  switch (kit.id) {
    case DisputeKits.Classic:
    case DisputeKits.Shutter:
    case DisputeKits.ArgentinaConsumerProtection:
    case DisputeKits.ClassicUniversity:
      return kit.featureSets[0];
    case DisputeKits.Gated:
    case DisputeKits.GatedShutter: {
      const isERC1155 = (disputeKitData as GatedDisputeKitData | undefined)?.isERC1155;
      return (
        kit.featureSets.find((set) =>
          isERC1155 ? set.includes(Features.GatedErc1155) : set.includes(Features.GatedErc20)
        ) ?? kit.featureSets[0]
      );
    }
    default: {
      // this is an exhaustive type check,
      // so we get a type error if a disputeKit is not handled in above switch
      const _exhaustive = kit.id satisfies never;
      return _exhaustive;
    }
  }
}

/** Canonical string for a feature set (order-independent) */
function normalize(features: Features[]): string {
  return [...features].sort().join("|");
}

/** Check if `a` is exactly the same as `b` (order-insensitive) */
function arraysEqual(a: Features[], b: Features[]): boolean {
  return normalize(a) === normalize(b);
}

/**
 * Toggle a feature, ensuring radio behavior per group
 * @returns the updated selected features array
 */
export function toggleFeature(selected: Features[], feature: Features, groups: FeatureGroups): Features[] {
  const group = Object.entries(groups).find(([_, feats]) => feats.includes(feature));
  if (!group) return selected; // not found in any group
  const [_, features] = group; // <= this is the group we are making selection in currently

  // Remove any feature from this group
  const withoutGroup = selected.filter((f) => !features.includes(f));

  // If it was already selected => deselect
  if (selected.includes(feature)) {
    return withoutGroup;
  }

  // Otherwise => select this one
  return [...withoutGroup, feature];
}

/**
 * Find dispute kits that match the given selection
 */
export function findMatchingKits(selected: Features[], kits: DisputeKit[]): DisputeKit[] {
  return kits.filter((kit) =>
    kit.featureSets.some(
      (set) => arraysEqual(set, selected) // strict exact match
    )
  );
}

/**
 * Ensures that the current selection of features is always in a valid state.
 * We use this just to make sure we don't accidently allow user to select an invalid state in handleToggle
 *
 * "Valid" means:
 *   - Either matches at least one dispute kit fully, OR
 *   - Could still be completed into a valid kit (prefix of a valid set).
 *
 * If the selection is invalid:
 *   1. Try removing one conflicting group to recover validity.
 *   2. If nothing works, fallback to keeping only the last clicked feature.
 *
 * @returns  A corrected selection that is guaranteed to be valid.
 */
export function ensureValidSmart(selected: Features[], groups: FeatureGroups, kits: DisputeKit[]): Features[] {
  // --- Helper: checks if a candidate is valid or could still become valid ---
  function isValidOrPrefix(candidate: Features[]): boolean {
    return (
      findMatchingKits(candidate, kits).length > 0 ||
      kits.some((kit) =>
        kit.featureSets.some(
          (set) => candidate.every((f) => set.includes(f)) // prefix check
        )
      )
    );
  }

  // --- Case 1: Current selection is already valid ---
  if (isValidOrPrefix(selected)) {
    return selected;
  }

  // --- Case 2: Try fixing by removing one group at a time ---
  for (const [_, features] of Object.entries(groups)) {
    const withoutGroup = selected.filter((f) => !features.includes(f));
    if (isValidOrPrefix(withoutGroup)) {
      return withoutGroup;
    }
  }

  // --- Case 3: Fallback to only the last picked feature ---
  return selected.length > 0 ? [selected[selected.length - 1]] : [];
}

// Checks if the candidate if selected, can still lead to a match
function canStillLeadToMatch(candidate: Features[], kits: DisputeKit[]): boolean {
  return kits.some((kit) =>
    kit.featureSets.some((set) =>
      // candidate must be subset of this set
      candidate.every((f) => set.includes(f))
    )
  );
}

/**
 * Compute which features should be disabled,
 * given the current selection.
 */
export function getDisabledOptions(selected: Features[], groups: FeatureGroups, kits: DisputeKit[]): Set<Features> {
  const disabled = new Set<Features>();

  // If nothing is selected => allow all
  if (selected.length === 0) {
    return disabled;
  }

  for (const [_, features] of Object.entries(groups)) {
    for (const feature of features) {
      const candidate = toggleFeature(selected, feature, groups);

      // Instead of only checking full matches:
      const valid = findMatchingKits(candidate, kits).length > 0 || canStillLeadToMatch(candidate, kits);

      if (!valid) {
        disabled.add(feature);
      }
    }
  }

  return disabled;
}

/**
 * Features that are visible for a given court,
 * based only on the kits that court supports.
 */
export function getVisibleFeaturesForCourt(
  supportedKits: number[],
  allKits: DisputeKit[],
  groups: FeatureGroups
): FeatureGroups {
  // Get supported kits for this court
  const filteredKits = allKits.filter((kit) => supportedKits.includes(kit.id));

  // Gather all features that appear in these kits
  const visible = new Set<Features>();
  for (const kit of filteredKits) {
    for (const set of kit.featureSets) {
      set.forEach((f) => visible.add(f));
    }
  }

  // Filter groups => only keep features that are visible
  const filteredGroups: FeatureGroups = {};
  for (const [groupName, features] of Object.entries(groups)) {
    const visibleFeatures = features.filter((f) => visible.has(f));
    if (visibleFeatures.length > 0) {
      filteredGroups[groupName] = visibleFeatures;
    }
  }

  return filteredGroups;
}
