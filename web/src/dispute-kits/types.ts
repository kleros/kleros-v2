import React from "react";

import type { Abi, Address } from "viem";

import { Periods } from "consts/periods";

import { DisputeDetailsQuery } from "src/graphql/graphql";

import type { DisputeKits } from "./disputeKits";

/** Props for Overview extra info (ex. token gate display) */
export interface OverviewExtraInfoProps {
  disputeId: string;
  disputeKitAddress: Address;
  currentRoundIndex: number;
}

export interface DisputeKitVotingProps {
  arbitrable: Address;
  /** Called to toggle popup, maybe change to callback? to be called after an action is completed */
  setIsOpen: (val: boolean) => void;
  disputeKitId: DisputeKits;
  dispute: DisputeDetailsQuery["dispute"];
  currentPeriodIndex: Periods;
}

export interface DisputeKitAppealProps {
  isAppealMiniGuideOpen: boolean;
  toggleAppealMiniGuide: () => void;
  disputeKitId: DisputeKits;
}

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

export interface DisputeKitConfig<TAbi extends Abi = Abi> {
  id: DisputeKits;
  displayName: string;
  address: Address;
  OverviewExtraInfo?: React.FC<OverviewExtraInfoProps>;
  // Rendering just the Voting component allows us to let
  // DisputeKit Voting component handle the separate flows of Vote, Reveal, Commit.
  VotingComponent: React.FC<DisputeKitVotingProps>;
  AppealComponent: React.FC<DisputeKitAppealProps>;
  disputeKitAbi: TAbi;
  hasAutomaticVoteReveal: boolean;
  /**
   * The feature sets this kit supports.
   * Each array represents a valid configuration, and has to be 1:1,
   * if either subset matches the selected feature array this dispute kit is selected.
   * each array is a unique match, for multiple combinations, add more arrays.
   */
  featureSets: Features[][];
}
