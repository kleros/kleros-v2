export enum Group {
  Voting = "Voting",
  Eligibility = "Eligibility",
}

/** A single feature, grouped into categories. has to be atomic.
 * For gated, we split them into atomic erc20 and erc1155 */
export enum Features {
  ShieldedVote = "shieldedVote",
  ClassicVote = "classicVote",
  ClassicEligibility = "classicEligibility",
  GatedErc20 = "gatedErc20",
  GatedErc1155 = "gatedErc1155",
  ArgentinaConsumerProtection = "argentinaConsumerProtection",
}

/** Group of features (like radio buttons per category) */
export type FeatureGroups = Record<string, Features[]>;

/** Definition of a dispute kit */
export interface DisputeKit {
  id: number;
  /**
   * The feature sets this kit supports.
   * Each array represents a valid configuration, and has to be 1:1,
   * if either subset matches the selected feature array this dispute kit is selected
   */
  featureSets: Features[][];

  type: "general" | "gated";
}

export type DisputeKits = DisputeKit[];

// groups
// withing a group only one feature can be selected, we deselect the other one when a new one is selected
// we don't use these directly in here for utils because these need to be filtered based on court selection.
// NOTE: a feature cannot appear in more than one Group
// DEV: the order of features in array , determine the order the radios appear on UI
export const featureGroups: FeatureGroups = {
  [Group.Voting]: [Features.ClassicVote, Features.ShieldedVote],
  [Group.Eligibility]: [
    Features.ClassicEligibility,
    Features.GatedErc20,
    Features.GatedErc1155,
    Features.ArgentinaConsumerProtection,
  ],
};

// dispute kits
// each array is a unique match, for multiple combinations, add more arrays.
export const disputeKits: DisputeKits = [
  {
    id: 1,
    featureSets: [[Features.ClassicVote, Features.ClassicEligibility]],
    type: "general",
  }, // strict
  { id: 2, featureSets: [[Features.ShieldedVote, Features.ClassicEligibility]], type: "general" }, // strict
  {
    id: 3,
    // strictly keep the common feature in front and in order.
    featureSets: [
      [Features.ClassicVote, Features.GatedErc20],
      [Features.ClassicVote, Features.GatedErc1155],
    ],
    type: "gated",
  },
  {
    id: 4,
    featureSets: [
      [Features.ShieldedVote, Features.GatedErc20],
      [Features.ShieldedVote, Features.GatedErc1155],
    ],
    type: "gated",
  },
  {
    id: 5,
    featureSets: [[Features.ClassicVote, Features.ArgentinaConsumerProtection]],
    type: "general",
  },
];

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
export function findMatchingKits(selected: Features[], kits: DisputeKits): DisputeKit[] {
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
export function ensureValidSmart(selected: Features[], groups: FeatureGroups, kits: DisputeKits): Features[] {
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
function canStillLeadToMatch(candidate: Features[], kits: DisputeKits): boolean {
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
export function getDisabledOptions(selected: Features[], groups: FeatureGroups, kits: DisputeKits): Set<Features> {
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
  allKits: DisputeKits,
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
