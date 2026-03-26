import type { Address } from "viem";

import { DEFAULT_CHAIN } from "consts/chains";
import {
  disputeKitClassicAbi,
  disputeKitClassicAddress,
  disputeKitClassicUniversityAbi,
  disputeKitClassicUniversityAddress,
  disputeKitGatedAbi,
  disputeKitGatedAddress,
  disputeKitGatedArgentinaConsumerProtectionAbi,
  disputeKitGatedArgentinaConsumerProtectionAddress,
  disputeKitGatedShutterAbi,
  disputeKitGatedShutterAddress,
  disputeKitShutterAbi,
  disputeKitShutterAddress,
} from "hooks/contracts/generated";

import ClassicAppealComponent from "pages/Cases/CaseDetails/Appeal/Classic";
import GatedOverviewExtraInfo from "pages/Cases/CaseDetails/Overview/DisputeKitOverviewExtraInfo/gated";
import ClassicVotingComponent from "pages/Cases/CaseDetails/Voting/Classic";
import ShutterVotingComponent from "pages/Cases/CaseDetails/Voting/Shutter";

import { DisputeKits } from "./disputeKits";
import type { DisputeKitConfig } from "./types";

const chainId = DEFAULT_CHAIN.id;

/** VotingComponent and AppealComponent are wired through this registry,
 * while their implementation stays near their usage */
const DISPUTE_KIT_REGISTRY: Record<DisputeKits, DisputeKitConfig> = {
  [DisputeKits.Classic]: {
    id: DisputeKits.Classic,
    displayName: "Classic",
    address: disputeKitClassicAddress[chainId],
    OverviewExtraInfo: undefined,
    VotingComponent: ClassicVotingComponent,
    AppealComponent: ClassicAppealComponent,
    disputeKitAbi: disputeKitClassicAbi,
    hasAutomaticVoteReveal: false,
  },
  [DisputeKits.Shutter]: {
    id: DisputeKits.Shutter,
    displayName: "Shutter",
    address: disputeKitShutterAddress[chainId],
    OverviewExtraInfo: undefined,
    VotingComponent: ShutterVotingComponent,
    AppealComponent: ClassicAppealComponent,
    disputeKitAbi: disputeKitShutterAbi,
    hasAutomaticVoteReveal: true,
  },
  [DisputeKits.Gated]: {
    id: DisputeKits.Gated,
    displayName: "Token Gated",
    address: disputeKitGatedAddress[chainId],
    OverviewExtraInfo: GatedOverviewExtraInfo,
    VotingComponent: ClassicVotingComponent,
    AppealComponent: ClassicAppealComponent,
    disputeKitAbi: disputeKitGatedAbi,
    hasAutomaticVoteReveal: false,
  },
  [DisputeKits.GatedShutter]: {
    id: DisputeKits.GatedShutter,
    displayName: "Token Gated Shutter",
    address: disputeKitGatedShutterAddress[chainId],
    OverviewExtraInfo: GatedOverviewExtraInfo,
    VotingComponent: ShutterVotingComponent,
    AppealComponent: ClassicAppealComponent,
    disputeKitAbi: disputeKitGatedShutterAbi,
    hasAutomaticVoteReveal: true,
  },
  [DisputeKits.ArgentinaConsumerProtection]: {
    id: DisputeKits.ArgentinaConsumerProtection,
    displayName: "Argentina Consumer Protection",
    address: disputeKitGatedArgentinaConsumerProtectionAddress[chainId],
    OverviewExtraInfo: GatedOverviewExtraInfo,
    VotingComponent: ClassicVotingComponent,
    AppealComponent: ClassicAppealComponent,
    disputeKitAbi: disputeKitGatedArgentinaConsumerProtectionAbi,
    hasAutomaticVoteReveal: false,
  },
  [DisputeKits.ClassicUniversity]: {
    id: DisputeKits.ClassicUniversity,
    displayName: "Classic University",
    address: disputeKitClassicUniversityAddress[chainId],
    OverviewExtraInfo: undefined,
    VotingComponent: ClassicVotingComponent,
    AppealComponent: ClassicAppealComponent,
    disputeKitAbi: disputeKitClassicUniversityAbi,
    hasAutomaticVoteReveal: false,
  },
};

/** Lookup by enum key, will be defined */
export function getDisputeKitConfig(id: DisputeKits) {
  return DISPUTE_KIT_REGISTRY[id];
}

/** Lookup by dispute kit contract address */
export function getDisputeKitConfigByAddress(address: Address) {
  const addr = address.toLowerCase();
  return Object.values(DISPUTE_KIT_REGISTRY).find((kit) => kit.address.toLowerCase() === addr);
}

/** Lookup by numeric kit id */
export function getDisputeKitConfigByKitId(disputeKitId: number | string | bigint) {
  return Object.values(DISPUTE_KIT_REGISTRY).find((kit) => BigInt(kit.id) === BigInt(disputeKitId));
}
