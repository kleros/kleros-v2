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

export interface DisputeKitConfig {
  id: DisputeKits;
  displayName: string;
  address: Address;
  OverviewExtraInfo?: React.FC<OverviewExtraInfoProps>;
  // Rendering just the Voting component allows us to let
  // DisputeKit Voting component handle the separate flows of Vote, Reveal, Commit.
  VotingComponent: React.FC<DisputeKitVotingProps>;
  AppealComponent: React.FC<DisputeKitAppealProps>;
  disputeKitAbi: Abi;
  hasAutomaticVoteReveal: boolean;
}
