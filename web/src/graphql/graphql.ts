/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  BigDecimal: { input: any; output: any };
  BigInt: { input: any; output: any };
  Bytes: { input: any; output: any };
  /**
   * 8 bytes signed integer
   *
   */
  Int8: { input: any; output: any };
};

export type Arbitrable = {
  __typename?: "Arbitrable";
  disputes: Array<Dispute>;
  id: Scalars["ID"]["output"];
  totalDisputes: Scalars["BigInt"]["output"];
};

export type ArbitrableDisputesArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Dispute_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  where?: InputMaybe<Dispute_Filter>;
};

export type Arbitrable_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Arbitrable_Filter>>>;
  disputes_?: InputMaybe<Dispute_Filter>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  id_gt?: InputMaybe<Scalars["ID"]["input"]>;
  id_gte?: InputMaybe<Scalars["ID"]["input"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  id_lt?: InputMaybe<Scalars["ID"]["input"]>;
  id_lte?: InputMaybe<Scalars["ID"]["input"]>;
  id_not?: InputMaybe<Scalars["ID"]["input"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  or?: InputMaybe<Array<InputMaybe<Arbitrable_Filter>>>;
  totalDisputes?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalDisputes_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalDisputes_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalDisputes_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  totalDisputes_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalDisputes_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalDisputes_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalDisputes_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
};

export enum Arbitrable_OrderBy {
  Disputes = "disputes",
  Id = "id",
  TotalDisputes = "totalDisputes",
}

export type BlockChangedFilter = {
  number_gte: Scalars["Int"]["input"];
};

export type Block_Height = {
  hash?: InputMaybe<Scalars["Bytes"]["input"]>;
  number?: InputMaybe<Scalars["Int"]["input"]>;
  number_gte?: InputMaybe<Scalars["Int"]["input"]>;
};

export type ClassicContribution = Contribution & {
  __typename?: "ClassicContribution";
  amount: Scalars["BigInt"]["output"];
  choice: Scalars["BigInt"]["output"];
  contributor: User;
  coreDispute: Dispute;
  id: Scalars["ID"]["output"];
  localRound: ClassicRound;
  rewardWithdrawn: Scalars["Boolean"]["output"];
};

export type ClassicContribution_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars["BigInt"]["input"]>;
  amount_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  amount_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  amount_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  amount_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  amount_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  amount_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  amount_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  and?: InputMaybe<Array<InputMaybe<ClassicContribution_Filter>>>;
  choice?: InputMaybe<Scalars["BigInt"]["input"]>;
  choice_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  choice_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  choice_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  choice_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  choice_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  choice_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  choice_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  contributor?: InputMaybe<Scalars["String"]["input"]>;
  contributor_?: InputMaybe<User_Filter>;
  contributor_contains?: InputMaybe<Scalars["String"]["input"]>;
  contributor_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  contributor_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  contributor_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  contributor_gt?: InputMaybe<Scalars["String"]["input"]>;
  contributor_gte?: InputMaybe<Scalars["String"]["input"]>;
  contributor_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  contributor_lt?: InputMaybe<Scalars["String"]["input"]>;
  contributor_lte?: InputMaybe<Scalars["String"]["input"]>;
  contributor_not?: InputMaybe<Scalars["String"]["input"]>;
  contributor_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  contributor_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  contributor_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  contributor_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  contributor_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  contributor_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  contributor_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  contributor_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  contributor_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_?: InputMaybe<Dispute_Filter>;
  coreDispute_contains?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_gt?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_gte?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  coreDispute_lt?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_lte?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  coreDispute_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  id_gt?: InputMaybe<Scalars["ID"]["input"]>;
  id_gte?: InputMaybe<Scalars["ID"]["input"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  id_lt?: InputMaybe<Scalars["ID"]["input"]>;
  id_lte?: InputMaybe<Scalars["ID"]["input"]>;
  id_not?: InputMaybe<Scalars["ID"]["input"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  localRound?: InputMaybe<Scalars["String"]["input"]>;
  localRound_?: InputMaybe<ClassicRound_Filter>;
  localRound_contains?: InputMaybe<Scalars["String"]["input"]>;
  localRound_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  localRound_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  localRound_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  localRound_gt?: InputMaybe<Scalars["String"]["input"]>;
  localRound_gte?: InputMaybe<Scalars["String"]["input"]>;
  localRound_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  localRound_lt?: InputMaybe<Scalars["String"]["input"]>;
  localRound_lte?: InputMaybe<Scalars["String"]["input"]>;
  localRound_not?: InputMaybe<Scalars["String"]["input"]>;
  localRound_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  localRound_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  localRound_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  localRound_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  localRound_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  localRound_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  localRound_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  localRound_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  localRound_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  or?: InputMaybe<Array<InputMaybe<ClassicContribution_Filter>>>;
  rewardWithdrawn?: InputMaybe<Scalars["Boolean"]["input"]>;
  rewardWithdrawn_in?: InputMaybe<Array<Scalars["Boolean"]["input"]>>;
  rewardWithdrawn_not?: InputMaybe<Scalars["Boolean"]["input"]>;
  rewardWithdrawn_not_in?: InputMaybe<Array<Scalars["Boolean"]["input"]>>;
};

export enum ClassicContribution_OrderBy {
  Amount = "amount",
  Choice = "choice",
  Contributor = "contributor",
  ContributorActiveDisputes = "contributor__activeDisputes",
  ContributorId = "contributor__id",
  ContributorTotalCoherent = "contributor__totalCoherent",
  ContributorTotalDelayed = "contributor__totalDelayed",
  ContributorTotalDisputes = "contributor__totalDisputes",
  ContributorTotalResolvedDisputes = "contributor__totalResolvedDisputes",
  ContributorTotalStake = "contributor__totalStake",
  CoreDispute = "coreDispute",
  CoreDisputeCurrentRoundIndex = "coreDispute__currentRoundIndex",
  CoreDisputeCurrentRuling = "coreDispute__currentRuling",
  CoreDisputeId = "coreDispute__id",
  CoreDisputeLastPeriodChange = "coreDispute__lastPeriodChange",
  CoreDisputeOverridden = "coreDispute__overridden",
  CoreDisputePeriod = "coreDispute__period",
  CoreDisputeRuled = "coreDispute__ruled",
  CoreDisputeTied = "coreDispute__tied",
  Id = "id",
  LocalRound = "localRound",
  LocalRoundFeeRewards = "localRound__feeRewards",
  LocalRoundId = "localRound__id",
  LocalRoundTied = "localRound__tied",
  LocalRoundTotalCommited = "localRound__totalCommited",
  LocalRoundTotalVoted = "localRound__totalVoted",
  LocalRoundWinningChoice = "localRound__winningChoice",
  RewardWithdrawn = "rewardWithdrawn",
}

export type ClassicDispute = DisputeKitDispute & {
  __typename?: "ClassicDispute";
  coreDispute: Dispute;
  currentLocalRoundIndex: Scalars["BigInt"]["output"];
  extraData: Scalars["Bytes"]["output"];
  id: Scalars["ID"]["output"];
  jumped: Scalars["Boolean"]["output"];
  localRounds: Array<DisputeKitRound>;
  numberOfChoices: Scalars["BigInt"]["output"];
};

export type ClassicDisputeLocalRoundsArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<DisputeKitRound_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  where?: InputMaybe<DisputeKitRound_Filter>;
};

export type ClassicDispute_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<ClassicDispute_Filter>>>;
  coreDispute?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_?: InputMaybe<Dispute_Filter>;
  coreDispute_contains?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_gt?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_gte?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  coreDispute_lt?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_lte?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  coreDispute_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  currentLocalRoundIndex?: InputMaybe<Scalars["BigInt"]["input"]>;
  currentLocalRoundIndex_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  currentLocalRoundIndex_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  currentLocalRoundIndex_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  currentLocalRoundIndex_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  currentLocalRoundIndex_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  currentLocalRoundIndex_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  currentLocalRoundIndex_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  extraData?: InputMaybe<Scalars["Bytes"]["input"]>;
  extraData_contains?: InputMaybe<Scalars["Bytes"]["input"]>;
  extraData_gt?: InputMaybe<Scalars["Bytes"]["input"]>;
  extraData_gte?: InputMaybe<Scalars["Bytes"]["input"]>;
  extraData_in?: InputMaybe<Array<Scalars["Bytes"]["input"]>>;
  extraData_lt?: InputMaybe<Scalars["Bytes"]["input"]>;
  extraData_lte?: InputMaybe<Scalars["Bytes"]["input"]>;
  extraData_not?: InputMaybe<Scalars["Bytes"]["input"]>;
  extraData_not_contains?: InputMaybe<Scalars["Bytes"]["input"]>;
  extraData_not_in?: InputMaybe<Array<Scalars["Bytes"]["input"]>>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  id_gt?: InputMaybe<Scalars["ID"]["input"]>;
  id_gte?: InputMaybe<Scalars["ID"]["input"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  id_lt?: InputMaybe<Scalars["ID"]["input"]>;
  id_lte?: InputMaybe<Scalars["ID"]["input"]>;
  id_not?: InputMaybe<Scalars["ID"]["input"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  jumped?: InputMaybe<Scalars["Boolean"]["input"]>;
  jumped_in?: InputMaybe<Array<Scalars["Boolean"]["input"]>>;
  jumped_not?: InputMaybe<Scalars["Boolean"]["input"]>;
  jumped_not_in?: InputMaybe<Array<Scalars["Boolean"]["input"]>>;
  localRounds_?: InputMaybe<DisputeKitRound_Filter>;
  numberOfChoices?: InputMaybe<Scalars["BigInt"]["input"]>;
  numberOfChoices_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  numberOfChoices_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  numberOfChoices_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  numberOfChoices_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  numberOfChoices_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  numberOfChoices_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  numberOfChoices_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  or?: InputMaybe<Array<InputMaybe<ClassicDispute_Filter>>>;
};

export enum ClassicDispute_OrderBy {
  CoreDispute = "coreDispute",
  CoreDisputeCurrentRoundIndex = "coreDispute__currentRoundIndex",
  CoreDisputeCurrentRuling = "coreDispute__currentRuling",
  CoreDisputeId = "coreDispute__id",
  CoreDisputeLastPeriodChange = "coreDispute__lastPeriodChange",
  CoreDisputeOverridden = "coreDispute__overridden",
  CoreDisputePeriod = "coreDispute__period",
  CoreDisputeRuled = "coreDispute__ruled",
  CoreDisputeTied = "coreDispute__tied",
  CurrentLocalRoundIndex = "currentLocalRoundIndex",
  ExtraData = "extraData",
  Id = "id",
  Jumped = "jumped",
  LocalRounds = "localRounds",
  NumberOfChoices = "numberOfChoices",
}

export type ClassicEvidence = Evidence & {
  __typename?: "ClassicEvidence";
  evidence: Scalars["String"]["output"];
  evidenceGroup: EvidenceGroup;
  id: Scalars["ID"]["output"];
  sender: User;
};

export type ClassicEvidenceGroup = EvidenceGroup & {
  __typename?: "ClassicEvidenceGroup";
  evidences: Array<Evidence>;
  id: Scalars["ID"]["output"];
  nextEvidenceIndex: Scalars["BigInt"]["output"];
};

export type ClassicEvidenceGroupEvidencesArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Evidence_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  where?: InputMaybe<Evidence_Filter>;
};

export type ClassicEvidenceGroup_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<ClassicEvidenceGroup_Filter>>>;
  evidences_?: InputMaybe<Evidence_Filter>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  id_gt?: InputMaybe<Scalars["ID"]["input"]>;
  id_gte?: InputMaybe<Scalars["ID"]["input"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  id_lt?: InputMaybe<Scalars["ID"]["input"]>;
  id_lte?: InputMaybe<Scalars["ID"]["input"]>;
  id_not?: InputMaybe<Scalars["ID"]["input"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  nextEvidenceIndex?: InputMaybe<Scalars["BigInt"]["input"]>;
  nextEvidenceIndex_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  nextEvidenceIndex_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  nextEvidenceIndex_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  nextEvidenceIndex_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  nextEvidenceIndex_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  nextEvidenceIndex_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  nextEvidenceIndex_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  or?: InputMaybe<Array<InputMaybe<ClassicEvidenceGroup_Filter>>>;
};

export enum ClassicEvidenceGroup_OrderBy {
  Evidences = "evidences",
  Id = "id",
  NextEvidenceIndex = "nextEvidenceIndex",
}

export type ClassicEvidence_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<ClassicEvidence_Filter>>>;
  evidence?: InputMaybe<Scalars["String"]["input"]>;
  evidenceGroup?: InputMaybe<Scalars["String"]["input"]>;
  evidenceGroup_?: InputMaybe<EvidenceGroup_Filter>;
  evidenceGroup_contains?: InputMaybe<Scalars["String"]["input"]>;
  evidenceGroup_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  evidenceGroup_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  evidenceGroup_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  evidenceGroup_gt?: InputMaybe<Scalars["String"]["input"]>;
  evidenceGroup_gte?: InputMaybe<Scalars["String"]["input"]>;
  evidenceGroup_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  evidenceGroup_lt?: InputMaybe<Scalars["String"]["input"]>;
  evidenceGroup_lte?: InputMaybe<Scalars["String"]["input"]>;
  evidenceGroup_not?: InputMaybe<Scalars["String"]["input"]>;
  evidenceGroup_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  evidenceGroup_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  evidenceGroup_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  evidenceGroup_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  evidenceGroup_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  evidenceGroup_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  evidenceGroup_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  evidenceGroup_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  evidenceGroup_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  evidence_contains?: InputMaybe<Scalars["String"]["input"]>;
  evidence_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  evidence_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  evidence_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  evidence_gt?: InputMaybe<Scalars["String"]["input"]>;
  evidence_gte?: InputMaybe<Scalars["String"]["input"]>;
  evidence_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  evidence_lt?: InputMaybe<Scalars["String"]["input"]>;
  evidence_lte?: InputMaybe<Scalars["String"]["input"]>;
  evidence_not?: InputMaybe<Scalars["String"]["input"]>;
  evidence_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  evidence_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  evidence_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  evidence_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  evidence_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  evidence_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  evidence_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  evidence_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  evidence_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  id_gt?: InputMaybe<Scalars["ID"]["input"]>;
  id_gte?: InputMaybe<Scalars["ID"]["input"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  id_lt?: InputMaybe<Scalars["ID"]["input"]>;
  id_lte?: InputMaybe<Scalars["ID"]["input"]>;
  id_not?: InputMaybe<Scalars["ID"]["input"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  or?: InputMaybe<Array<InputMaybe<ClassicEvidence_Filter>>>;
  sender?: InputMaybe<Scalars["String"]["input"]>;
  sender_?: InputMaybe<User_Filter>;
  sender_contains?: InputMaybe<Scalars["String"]["input"]>;
  sender_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  sender_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  sender_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  sender_gt?: InputMaybe<Scalars["String"]["input"]>;
  sender_gte?: InputMaybe<Scalars["String"]["input"]>;
  sender_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  sender_lt?: InputMaybe<Scalars["String"]["input"]>;
  sender_lte?: InputMaybe<Scalars["String"]["input"]>;
  sender_not?: InputMaybe<Scalars["String"]["input"]>;
  sender_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  sender_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  sender_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  sender_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  sender_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  sender_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  sender_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  sender_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  sender_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
};

export enum ClassicEvidence_OrderBy {
  Evidence = "evidence",
  EvidenceGroup = "evidenceGroup",
  EvidenceGroupId = "evidenceGroup__id",
  EvidenceGroupNextEvidenceIndex = "evidenceGroup__nextEvidenceIndex",
  Id = "id",
  Sender = "sender",
  SenderActiveDisputes = "sender__activeDisputes",
  SenderId = "sender__id",
  SenderTotalCoherent = "sender__totalCoherent",
  SenderTotalDelayed = "sender__totalDelayed",
  SenderTotalDisputes = "sender__totalDisputes",
  SenderTotalResolvedDisputes = "sender__totalResolvedDisputes",
  SenderTotalStake = "sender__totalStake",
}

export type ClassicJustification = {
  __typename?: "ClassicJustification";
  choice: Scalars["BigInt"]["output"];
  coreDispute: Dispute;
  id: Scalars["ID"]["output"];
  juror: User;
  localRound: ClassicRound;
  reference: Scalars["String"]["output"];
  votes: Array<ClassicVote>;
};

export type ClassicJustificationVotesArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ClassicVote_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  where?: InputMaybe<ClassicVote_Filter>;
};

export type ClassicJustification_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<ClassicJustification_Filter>>>;
  choice?: InputMaybe<Scalars["BigInt"]["input"]>;
  choice_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  choice_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  choice_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  choice_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  choice_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  choice_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  choice_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  coreDispute?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_?: InputMaybe<Dispute_Filter>;
  coreDispute_contains?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_gt?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_gte?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  coreDispute_lt?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_lte?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  coreDispute_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  id_gt?: InputMaybe<Scalars["ID"]["input"]>;
  id_gte?: InputMaybe<Scalars["ID"]["input"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  id_lt?: InputMaybe<Scalars["ID"]["input"]>;
  id_lte?: InputMaybe<Scalars["ID"]["input"]>;
  id_not?: InputMaybe<Scalars["ID"]["input"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  juror?: InputMaybe<Scalars["String"]["input"]>;
  juror_?: InputMaybe<User_Filter>;
  juror_contains?: InputMaybe<Scalars["String"]["input"]>;
  juror_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  juror_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  juror_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  juror_gt?: InputMaybe<Scalars["String"]["input"]>;
  juror_gte?: InputMaybe<Scalars["String"]["input"]>;
  juror_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  juror_lt?: InputMaybe<Scalars["String"]["input"]>;
  juror_lte?: InputMaybe<Scalars["String"]["input"]>;
  juror_not?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  juror_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  juror_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  juror_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  localRound?: InputMaybe<Scalars["String"]["input"]>;
  localRound_?: InputMaybe<ClassicRound_Filter>;
  localRound_contains?: InputMaybe<Scalars["String"]["input"]>;
  localRound_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  localRound_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  localRound_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  localRound_gt?: InputMaybe<Scalars["String"]["input"]>;
  localRound_gte?: InputMaybe<Scalars["String"]["input"]>;
  localRound_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  localRound_lt?: InputMaybe<Scalars["String"]["input"]>;
  localRound_lte?: InputMaybe<Scalars["String"]["input"]>;
  localRound_not?: InputMaybe<Scalars["String"]["input"]>;
  localRound_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  localRound_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  localRound_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  localRound_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  localRound_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  localRound_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  localRound_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  localRound_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  localRound_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  or?: InputMaybe<Array<InputMaybe<ClassicJustification_Filter>>>;
  reference?: InputMaybe<Scalars["String"]["input"]>;
  reference_contains?: InputMaybe<Scalars["String"]["input"]>;
  reference_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  reference_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  reference_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  reference_gt?: InputMaybe<Scalars["String"]["input"]>;
  reference_gte?: InputMaybe<Scalars["String"]["input"]>;
  reference_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  reference_lt?: InputMaybe<Scalars["String"]["input"]>;
  reference_lte?: InputMaybe<Scalars["String"]["input"]>;
  reference_not?: InputMaybe<Scalars["String"]["input"]>;
  reference_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  reference_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  reference_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  reference_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  reference_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  reference_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  reference_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  reference_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  reference_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  votes_?: InputMaybe<ClassicVote_Filter>;
};

export enum ClassicJustification_OrderBy {
  Choice = "choice",
  CoreDispute = "coreDispute",
  CoreDisputeCurrentRoundIndex = "coreDispute__currentRoundIndex",
  CoreDisputeCurrentRuling = "coreDispute__currentRuling",
  CoreDisputeId = "coreDispute__id",
  CoreDisputeLastPeriodChange = "coreDispute__lastPeriodChange",
  CoreDisputeOverridden = "coreDispute__overridden",
  CoreDisputePeriod = "coreDispute__period",
  CoreDisputeRuled = "coreDispute__ruled",
  CoreDisputeTied = "coreDispute__tied",
  Id = "id",
  Juror = "juror",
  JurorActiveDisputes = "juror__activeDisputes",
  JurorId = "juror__id",
  JurorTotalCoherent = "juror__totalCoherent",
  JurorTotalDelayed = "juror__totalDelayed",
  JurorTotalDisputes = "juror__totalDisputes",
  JurorTotalResolvedDisputes = "juror__totalResolvedDisputes",
  JurorTotalStake = "juror__totalStake",
  LocalRound = "localRound",
  LocalRoundFeeRewards = "localRound__feeRewards",
  LocalRoundId = "localRound__id",
  LocalRoundTied = "localRound__tied",
  LocalRoundTotalCommited = "localRound__totalCommited",
  LocalRoundTotalVoted = "localRound__totalVoted",
  LocalRoundWinningChoice = "localRound__winningChoice",
  Reference = "reference",
  Votes = "votes",
}

export type ClassicRound = DisputeKitRound & {
  __typename?: "ClassicRound";
  contributions: Array<ClassicContribution>;
  counts: Array<Scalars["BigInt"]["output"]>;
  feeRewards: Scalars["BigInt"]["output"];
  fundedChoices: Array<Scalars["BigInt"]["output"]>;
  id: Scalars["ID"]["output"];
  justifications?: Maybe<Array<ClassicJustification>>;
  localDispute: DisputeKitDispute;
  paidFees: Array<Scalars["BigInt"]["output"]>;
  tied: Scalars["Boolean"]["output"];
  totalCommited: Scalars["BigInt"]["output"];
  totalVoted: Scalars["BigInt"]["output"];
  votes: Array<Vote>;
  winningChoice: Scalars["BigInt"]["output"];
};

export type ClassicRoundContributionsArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ClassicContribution_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  where?: InputMaybe<ClassicContribution_Filter>;
};

export type ClassicRoundJustificationsArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ClassicJustification_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  where?: InputMaybe<ClassicJustification_Filter>;
};

export type ClassicRoundVotesArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Vote_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  where?: InputMaybe<Vote_Filter>;
};

export type ClassicRound_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<ClassicRound_Filter>>>;
  contributions_?: InputMaybe<ClassicContribution_Filter>;
  counts?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  counts_contains?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  counts_contains_nocase?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  counts_not?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  counts_not_contains?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  counts_not_contains_nocase?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  feeRewards?: InputMaybe<Scalars["BigInt"]["input"]>;
  feeRewards_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  feeRewards_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  feeRewards_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  feeRewards_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  feeRewards_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  feeRewards_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  feeRewards_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  fundedChoices?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  fundedChoices_contains?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  fundedChoices_contains_nocase?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  fundedChoices_not?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  fundedChoices_not_contains?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  fundedChoices_not_contains_nocase?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  id_gt?: InputMaybe<Scalars["ID"]["input"]>;
  id_gte?: InputMaybe<Scalars["ID"]["input"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  id_lt?: InputMaybe<Scalars["ID"]["input"]>;
  id_lte?: InputMaybe<Scalars["ID"]["input"]>;
  id_not?: InputMaybe<Scalars["ID"]["input"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  justifications_?: InputMaybe<ClassicJustification_Filter>;
  localDispute?: InputMaybe<Scalars["String"]["input"]>;
  localDispute_?: InputMaybe<DisputeKitDispute_Filter>;
  localDispute_contains?: InputMaybe<Scalars["String"]["input"]>;
  localDispute_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  localDispute_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  localDispute_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  localDispute_gt?: InputMaybe<Scalars["String"]["input"]>;
  localDispute_gte?: InputMaybe<Scalars["String"]["input"]>;
  localDispute_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  localDispute_lt?: InputMaybe<Scalars["String"]["input"]>;
  localDispute_lte?: InputMaybe<Scalars["String"]["input"]>;
  localDispute_not?: InputMaybe<Scalars["String"]["input"]>;
  localDispute_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  localDispute_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  localDispute_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  localDispute_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  localDispute_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  localDispute_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  localDispute_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  localDispute_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  localDispute_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  or?: InputMaybe<Array<InputMaybe<ClassicRound_Filter>>>;
  paidFees?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  paidFees_contains?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  paidFees_contains_nocase?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  paidFees_not?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  paidFees_not_contains?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  paidFees_not_contains_nocase?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  tied?: InputMaybe<Scalars["Boolean"]["input"]>;
  tied_in?: InputMaybe<Array<Scalars["Boolean"]["input"]>>;
  tied_not?: InputMaybe<Scalars["Boolean"]["input"]>;
  tied_not_in?: InputMaybe<Array<Scalars["Boolean"]["input"]>>;
  totalCommited?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalCommited_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalCommited_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalCommited_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  totalCommited_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalCommited_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalCommited_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalCommited_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  totalVoted?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalVoted_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalVoted_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalVoted_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  totalVoted_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalVoted_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalVoted_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalVoted_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  votes_?: InputMaybe<Vote_Filter>;
  winningChoice?: InputMaybe<Scalars["BigInt"]["input"]>;
  winningChoice_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  winningChoice_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  winningChoice_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  winningChoice_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  winningChoice_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  winningChoice_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  winningChoice_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
};

export enum ClassicRound_OrderBy {
  Contributions = "contributions",
  Counts = "counts",
  FeeRewards = "feeRewards",
  FundedChoices = "fundedChoices",
  Id = "id",
  Justifications = "justifications",
  LocalDispute = "localDispute",
  LocalDisputeCurrentLocalRoundIndex = "localDispute__currentLocalRoundIndex",
  LocalDisputeId = "localDispute__id",
  PaidFees = "paidFees",
  Tied = "tied",
  TotalCommited = "totalCommited",
  TotalVoted = "totalVoted",
  Votes = "votes",
  WinningChoice = "winningChoice",
}

export type ClassicVote = Vote & {
  __typename?: "ClassicVote";
  choice?: Maybe<Scalars["BigInt"]["output"]>;
  commit?: Maybe<Scalars["Bytes"]["output"]>;
  commited: Scalars["Boolean"]["output"];
  coreDispute: Dispute;
  draw?: Maybe<Draw>;
  id: Scalars["ID"]["output"];
  juror: User;
  justification: ClassicJustification;
  localRound: DisputeKitRound;
  voted: Scalars["Boolean"]["output"];
};

export type ClassicVote_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<ClassicVote_Filter>>>;
  choice?: InputMaybe<Scalars["BigInt"]["input"]>;
  choice_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  choice_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  choice_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  choice_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  choice_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  choice_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  choice_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  commit?: InputMaybe<Scalars["Bytes"]["input"]>;
  commit_contains?: InputMaybe<Scalars["Bytes"]["input"]>;
  commit_gt?: InputMaybe<Scalars["Bytes"]["input"]>;
  commit_gte?: InputMaybe<Scalars["Bytes"]["input"]>;
  commit_in?: InputMaybe<Array<Scalars["Bytes"]["input"]>>;
  commit_lt?: InputMaybe<Scalars["Bytes"]["input"]>;
  commit_lte?: InputMaybe<Scalars["Bytes"]["input"]>;
  commit_not?: InputMaybe<Scalars["Bytes"]["input"]>;
  commit_not_contains?: InputMaybe<Scalars["Bytes"]["input"]>;
  commit_not_in?: InputMaybe<Array<Scalars["Bytes"]["input"]>>;
  commited?: InputMaybe<Scalars["Boolean"]["input"]>;
  commited_in?: InputMaybe<Array<Scalars["Boolean"]["input"]>>;
  commited_not?: InputMaybe<Scalars["Boolean"]["input"]>;
  commited_not_in?: InputMaybe<Array<Scalars["Boolean"]["input"]>>;
  coreDispute?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_?: InputMaybe<Dispute_Filter>;
  coreDispute_contains?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_gt?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_gte?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  coreDispute_lt?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_lte?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  coreDispute_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  draw?: InputMaybe<Scalars["String"]["input"]>;
  draw_?: InputMaybe<Draw_Filter>;
  draw_contains?: InputMaybe<Scalars["String"]["input"]>;
  draw_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  draw_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  draw_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  draw_gt?: InputMaybe<Scalars["String"]["input"]>;
  draw_gte?: InputMaybe<Scalars["String"]["input"]>;
  draw_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  draw_lt?: InputMaybe<Scalars["String"]["input"]>;
  draw_lte?: InputMaybe<Scalars["String"]["input"]>;
  draw_not?: InputMaybe<Scalars["String"]["input"]>;
  draw_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  draw_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  draw_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  draw_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  draw_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  draw_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  draw_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  draw_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  draw_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  id_gt?: InputMaybe<Scalars["ID"]["input"]>;
  id_gte?: InputMaybe<Scalars["ID"]["input"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  id_lt?: InputMaybe<Scalars["ID"]["input"]>;
  id_lte?: InputMaybe<Scalars["ID"]["input"]>;
  id_not?: InputMaybe<Scalars["ID"]["input"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  juror?: InputMaybe<Scalars["String"]["input"]>;
  juror_?: InputMaybe<User_Filter>;
  juror_contains?: InputMaybe<Scalars["String"]["input"]>;
  juror_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  juror_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  juror_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  juror_gt?: InputMaybe<Scalars["String"]["input"]>;
  juror_gte?: InputMaybe<Scalars["String"]["input"]>;
  juror_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  juror_lt?: InputMaybe<Scalars["String"]["input"]>;
  juror_lte?: InputMaybe<Scalars["String"]["input"]>;
  juror_not?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  juror_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  juror_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  juror_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  justification?: InputMaybe<Scalars["String"]["input"]>;
  justification_?: InputMaybe<ClassicJustification_Filter>;
  justification_contains?: InputMaybe<Scalars["String"]["input"]>;
  justification_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  justification_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  justification_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  justification_gt?: InputMaybe<Scalars["String"]["input"]>;
  justification_gte?: InputMaybe<Scalars["String"]["input"]>;
  justification_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  justification_lt?: InputMaybe<Scalars["String"]["input"]>;
  justification_lte?: InputMaybe<Scalars["String"]["input"]>;
  justification_not?: InputMaybe<Scalars["String"]["input"]>;
  justification_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  justification_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  justification_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  justification_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  justification_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  justification_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  justification_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  justification_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  justification_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  localRound?: InputMaybe<Scalars["String"]["input"]>;
  localRound_?: InputMaybe<DisputeKitRound_Filter>;
  localRound_contains?: InputMaybe<Scalars["String"]["input"]>;
  localRound_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  localRound_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  localRound_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  localRound_gt?: InputMaybe<Scalars["String"]["input"]>;
  localRound_gte?: InputMaybe<Scalars["String"]["input"]>;
  localRound_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  localRound_lt?: InputMaybe<Scalars["String"]["input"]>;
  localRound_lte?: InputMaybe<Scalars["String"]["input"]>;
  localRound_not?: InputMaybe<Scalars["String"]["input"]>;
  localRound_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  localRound_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  localRound_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  localRound_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  localRound_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  localRound_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  localRound_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  localRound_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  localRound_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  or?: InputMaybe<Array<InputMaybe<ClassicVote_Filter>>>;
  voted?: InputMaybe<Scalars["Boolean"]["input"]>;
  voted_in?: InputMaybe<Array<Scalars["Boolean"]["input"]>>;
  voted_not?: InputMaybe<Scalars["Boolean"]["input"]>;
  voted_not_in?: InputMaybe<Array<Scalars["Boolean"]["input"]>>;
};

export enum ClassicVote_OrderBy {
  Choice = "choice",
  Commit = "commit",
  Commited = "commited",
  CoreDispute = "coreDispute",
  CoreDisputeCurrentRoundIndex = "coreDispute__currentRoundIndex",
  CoreDisputeCurrentRuling = "coreDispute__currentRuling",
  CoreDisputeId = "coreDispute__id",
  CoreDisputeLastPeriodChange = "coreDispute__lastPeriodChange",
  CoreDisputeOverridden = "coreDispute__overridden",
  CoreDisputePeriod = "coreDispute__period",
  CoreDisputeRuled = "coreDispute__ruled",
  CoreDisputeTied = "coreDispute__tied",
  Draw = "draw",
  DrawId = "draw__id",
  DrawVoteId = "draw__voteID",
  Id = "id",
  Juror = "juror",
  JurorActiveDisputes = "juror__activeDisputes",
  JurorId = "juror__id",
  JurorTotalCoherent = "juror__totalCoherent",
  JurorTotalDelayed = "juror__totalDelayed",
  JurorTotalDisputes = "juror__totalDisputes",
  JurorTotalResolvedDisputes = "juror__totalResolvedDisputes",
  JurorTotalStake = "juror__totalStake",
  Justification = "justification",
  JustificationChoice = "justification__choice",
  JustificationId = "justification__id",
  JustificationReference = "justification__reference",
  LocalRound = "localRound",
  LocalRoundId = "localRound__id",
  Voted = "voted",
}

export type Contribution = {
  contributor: User;
  coreDispute: Dispute;
  id: Scalars["ID"]["output"];
};

export type Contribution_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Contribution_Filter>>>;
  contributor?: InputMaybe<Scalars["String"]["input"]>;
  contributor_?: InputMaybe<User_Filter>;
  contributor_contains?: InputMaybe<Scalars["String"]["input"]>;
  contributor_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  contributor_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  contributor_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  contributor_gt?: InputMaybe<Scalars["String"]["input"]>;
  contributor_gte?: InputMaybe<Scalars["String"]["input"]>;
  contributor_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  contributor_lt?: InputMaybe<Scalars["String"]["input"]>;
  contributor_lte?: InputMaybe<Scalars["String"]["input"]>;
  contributor_not?: InputMaybe<Scalars["String"]["input"]>;
  contributor_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  contributor_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  contributor_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  contributor_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  contributor_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  contributor_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  contributor_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  contributor_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  contributor_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_?: InputMaybe<Dispute_Filter>;
  coreDispute_contains?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_gt?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_gte?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  coreDispute_lt?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_lte?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  coreDispute_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  id_gt?: InputMaybe<Scalars["ID"]["input"]>;
  id_gte?: InputMaybe<Scalars["ID"]["input"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  id_lt?: InputMaybe<Scalars["ID"]["input"]>;
  id_lte?: InputMaybe<Scalars["ID"]["input"]>;
  id_not?: InputMaybe<Scalars["ID"]["input"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  or?: InputMaybe<Array<InputMaybe<Contribution_Filter>>>;
};

export enum Contribution_OrderBy {
  Contributor = "contributor",
  ContributorActiveDisputes = "contributor__activeDisputes",
  ContributorId = "contributor__id",
  ContributorTotalCoherent = "contributor__totalCoherent",
  ContributorTotalDelayed = "contributor__totalDelayed",
  ContributorTotalDisputes = "contributor__totalDisputes",
  ContributorTotalResolvedDisputes = "contributor__totalResolvedDisputes",
  ContributorTotalStake = "contributor__totalStake",
  CoreDispute = "coreDispute",
  CoreDisputeCurrentRoundIndex = "coreDispute__currentRoundIndex",
  CoreDisputeCurrentRuling = "coreDispute__currentRuling",
  CoreDisputeId = "coreDispute__id",
  CoreDisputeLastPeriodChange = "coreDispute__lastPeriodChange",
  CoreDisputeOverridden = "coreDispute__overridden",
  CoreDisputePeriod = "coreDispute__period",
  CoreDisputeRuled = "coreDispute__ruled",
  CoreDisputeTied = "coreDispute__tied",
  Id = "id",
}

export type Counter = {
  __typename?: "Counter";
  activeJurors: Scalars["BigInt"]["output"];
  cases: Scalars["BigInt"]["output"];
  casesRuled: Scalars["BigInt"]["output"];
  casesVoting: Scalars["BigInt"]["output"];
  id: Scalars["ID"]["output"];
  paidETH: Scalars["BigInt"]["output"];
  redistributedPNK: Scalars["BigInt"]["output"];
  stakedPNK: Scalars["BigInt"]["output"];
};

export type Counter_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  activeJurors?: InputMaybe<Scalars["BigInt"]["input"]>;
  activeJurors_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  activeJurors_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  activeJurors_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  activeJurors_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  activeJurors_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  activeJurors_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  activeJurors_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  and?: InputMaybe<Array<InputMaybe<Counter_Filter>>>;
  cases?: InputMaybe<Scalars["BigInt"]["input"]>;
  casesRuled?: InputMaybe<Scalars["BigInt"]["input"]>;
  casesRuled_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  casesRuled_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  casesRuled_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  casesRuled_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  casesRuled_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  casesRuled_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  casesRuled_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  casesVoting?: InputMaybe<Scalars["BigInt"]["input"]>;
  casesVoting_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  casesVoting_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  casesVoting_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  casesVoting_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  casesVoting_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  casesVoting_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  casesVoting_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  cases_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  cases_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  cases_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  cases_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  cases_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  cases_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  cases_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  id_gt?: InputMaybe<Scalars["ID"]["input"]>;
  id_gte?: InputMaybe<Scalars["ID"]["input"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  id_lt?: InputMaybe<Scalars["ID"]["input"]>;
  id_lte?: InputMaybe<Scalars["ID"]["input"]>;
  id_not?: InputMaybe<Scalars["ID"]["input"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  or?: InputMaybe<Array<InputMaybe<Counter_Filter>>>;
  paidETH?: InputMaybe<Scalars["BigInt"]["input"]>;
  paidETH_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  paidETH_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  paidETH_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  paidETH_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  paidETH_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  paidETH_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  paidETH_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  redistributedPNK?: InputMaybe<Scalars["BigInt"]["input"]>;
  redistributedPNK_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  redistributedPNK_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  redistributedPNK_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  redistributedPNK_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  redistributedPNK_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  redistributedPNK_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  redistributedPNK_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  stakedPNK?: InputMaybe<Scalars["BigInt"]["input"]>;
  stakedPNK_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  stakedPNK_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  stakedPNK_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  stakedPNK_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  stakedPNK_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  stakedPNK_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  stakedPNK_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
};

export enum Counter_OrderBy {
  ActiveJurors = "activeJurors",
  Cases = "cases",
  CasesRuled = "casesRuled",
  CasesVoting = "casesVoting",
  Id = "id",
  PaidEth = "paidETH",
  RedistributedPnk = "redistributedPNK",
  StakedPnk = "stakedPNK",
}

export type Court = {
  __typename?: "Court";
  alpha: Scalars["BigInt"]["output"];
  children: Array<Court>;
  delayedStake: Scalars["BigInt"]["output"];
  disputes: Array<Dispute>;
  feeForJuror: Scalars["BigInt"]["output"];
  hiddenVotes: Scalars["Boolean"]["output"];
  id: Scalars["ID"]["output"];
  jurorsForCourtJump: Scalars["BigInt"]["output"];
  minStake: Scalars["BigInt"]["output"];
  name?: Maybe<Scalars["String"]["output"]>;
  numberDisputes: Scalars["BigInt"]["output"];
  numberStakedJurors: Scalars["BigInt"]["output"];
  paidETH: Scalars["BigInt"]["output"];
  paidPNK: Scalars["BigInt"]["output"];
  parent?: Maybe<Court>;
  policy?: Maybe<Scalars["String"]["output"]>;
  stake: Scalars["BigInt"]["output"];
  stakedJurors: Array<JurorTokensPerCourt>;
  supportedDisputeKits: Array<DisputeKit>;
  timesPerPeriod: Array<Scalars["BigInt"]["output"]>;
};

export type CourtChildrenArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Court_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  where?: InputMaybe<Court_Filter>;
};

export type CourtDisputesArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Dispute_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  where?: InputMaybe<Dispute_Filter>;
};

export type CourtStakedJurorsArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<JurorTokensPerCourt_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  where?: InputMaybe<JurorTokensPerCourt_Filter>;
};

export type CourtSupportedDisputeKitsArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<DisputeKit_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  where?: InputMaybe<DisputeKit_Filter>;
};

export type Court_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  alpha?: InputMaybe<Scalars["BigInt"]["input"]>;
  alpha_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  alpha_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  alpha_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  alpha_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  alpha_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  alpha_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  alpha_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  and?: InputMaybe<Array<InputMaybe<Court_Filter>>>;
  children_?: InputMaybe<Court_Filter>;
  delayedStake?: InputMaybe<Scalars["BigInt"]["input"]>;
  delayedStake_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  delayedStake_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  delayedStake_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  delayedStake_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  delayedStake_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  delayedStake_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  delayedStake_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  disputes_?: InputMaybe<Dispute_Filter>;
  feeForJuror?: InputMaybe<Scalars["BigInt"]["input"]>;
  feeForJuror_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  feeForJuror_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  feeForJuror_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  feeForJuror_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  feeForJuror_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  feeForJuror_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  feeForJuror_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  hiddenVotes?: InputMaybe<Scalars["Boolean"]["input"]>;
  hiddenVotes_in?: InputMaybe<Array<Scalars["Boolean"]["input"]>>;
  hiddenVotes_not?: InputMaybe<Scalars["Boolean"]["input"]>;
  hiddenVotes_not_in?: InputMaybe<Array<Scalars["Boolean"]["input"]>>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  id_gt?: InputMaybe<Scalars["ID"]["input"]>;
  id_gte?: InputMaybe<Scalars["ID"]["input"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  id_lt?: InputMaybe<Scalars["ID"]["input"]>;
  id_lte?: InputMaybe<Scalars["ID"]["input"]>;
  id_not?: InputMaybe<Scalars["ID"]["input"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  jurorsForCourtJump?: InputMaybe<Scalars["BigInt"]["input"]>;
  jurorsForCourtJump_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  jurorsForCourtJump_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  jurorsForCourtJump_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  jurorsForCourtJump_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  jurorsForCourtJump_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  jurorsForCourtJump_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  jurorsForCourtJump_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  minStake?: InputMaybe<Scalars["BigInt"]["input"]>;
  minStake_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  minStake_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  minStake_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  minStake_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  minStake_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  minStake_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  minStake_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  name_contains?: InputMaybe<Scalars["String"]["input"]>;
  name_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  name_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  name_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  name_gt?: InputMaybe<Scalars["String"]["input"]>;
  name_gte?: InputMaybe<Scalars["String"]["input"]>;
  name_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  name_lt?: InputMaybe<Scalars["String"]["input"]>;
  name_lte?: InputMaybe<Scalars["String"]["input"]>;
  name_not?: InputMaybe<Scalars["String"]["input"]>;
  name_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  name_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  name_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  name_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  name_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  name_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  name_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  name_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  name_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  numberDisputes?: InputMaybe<Scalars["BigInt"]["input"]>;
  numberDisputes_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  numberDisputes_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  numberDisputes_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  numberDisputes_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  numberDisputes_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  numberDisputes_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  numberDisputes_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  numberStakedJurors?: InputMaybe<Scalars["BigInt"]["input"]>;
  numberStakedJurors_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  numberStakedJurors_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  numberStakedJurors_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  numberStakedJurors_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  numberStakedJurors_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  numberStakedJurors_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  numberStakedJurors_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  or?: InputMaybe<Array<InputMaybe<Court_Filter>>>;
  paidETH?: InputMaybe<Scalars["BigInt"]["input"]>;
  paidETH_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  paidETH_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  paidETH_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  paidETH_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  paidETH_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  paidETH_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  paidETH_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  paidPNK?: InputMaybe<Scalars["BigInt"]["input"]>;
  paidPNK_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  paidPNK_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  paidPNK_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  paidPNK_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  paidPNK_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  paidPNK_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  paidPNK_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  parent?: InputMaybe<Scalars["String"]["input"]>;
  parent_?: InputMaybe<Court_Filter>;
  parent_contains?: InputMaybe<Scalars["String"]["input"]>;
  parent_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  parent_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  parent_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  parent_gt?: InputMaybe<Scalars["String"]["input"]>;
  parent_gte?: InputMaybe<Scalars["String"]["input"]>;
  parent_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  parent_lt?: InputMaybe<Scalars["String"]["input"]>;
  parent_lte?: InputMaybe<Scalars["String"]["input"]>;
  parent_not?: InputMaybe<Scalars["String"]["input"]>;
  parent_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  parent_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  parent_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  parent_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  parent_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  parent_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  parent_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  parent_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  parent_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  policy?: InputMaybe<Scalars["String"]["input"]>;
  policy_contains?: InputMaybe<Scalars["String"]["input"]>;
  policy_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  policy_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  policy_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  policy_gt?: InputMaybe<Scalars["String"]["input"]>;
  policy_gte?: InputMaybe<Scalars["String"]["input"]>;
  policy_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  policy_lt?: InputMaybe<Scalars["String"]["input"]>;
  policy_lte?: InputMaybe<Scalars["String"]["input"]>;
  policy_not?: InputMaybe<Scalars["String"]["input"]>;
  policy_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  policy_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  policy_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  policy_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  policy_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  policy_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  policy_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  policy_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  policy_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  stake?: InputMaybe<Scalars["BigInt"]["input"]>;
  stake_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  stake_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  stake_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  stake_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  stake_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  stake_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  stake_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  stakedJurors_?: InputMaybe<JurorTokensPerCourt_Filter>;
  supportedDisputeKits?: InputMaybe<Array<Scalars["String"]["input"]>>;
  supportedDisputeKits_?: InputMaybe<DisputeKit_Filter>;
  supportedDisputeKits_contains?: InputMaybe<Array<Scalars["String"]["input"]>>;
  supportedDisputeKits_contains_nocase?: InputMaybe<Array<Scalars["String"]["input"]>>;
  supportedDisputeKits_not?: InputMaybe<Array<Scalars["String"]["input"]>>;
  supportedDisputeKits_not_contains?: InputMaybe<Array<Scalars["String"]["input"]>>;
  supportedDisputeKits_not_contains_nocase?: InputMaybe<Array<Scalars["String"]["input"]>>;
  timesPerPeriod?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  timesPerPeriod_contains?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  timesPerPeriod_contains_nocase?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  timesPerPeriod_not?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  timesPerPeriod_not_contains?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  timesPerPeriod_not_contains_nocase?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
};

export enum Court_OrderBy {
  Alpha = "alpha",
  Children = "children",
  DelayedStake = "delayedStake",
  Disputes = "disputes",
  FeeForJuror = "feeForJuror",
  HiddenVotes = "hiddenVotes",
  Id = "id",
  JurorsForCourtJump = "jurorsForCourtJump",
  MinStake = "minStake",
  Name = "name",
  NumberDisputes = "numberDisputes",
  NumberStakedJurors = "numberStakedJurors",
  PaidEth = "paidETH",
  PaidPnk = "paidPNK",
  Parent = "parent",
  ParentAlpha = "parent__alpha",
  ParentDelayedStake = "parent__delayedStake",
  ParentFeeForJuror = "parent__feeForJuror",
  ParentHiddenVotes = "parent__hiddenVotes",
  ParentId = "parent__id",
  ParentJurorsForCourtJump = "parent__jurorsForCourtJump",
  ParentMinStake = "parent__minStake",
  ParentName = "parent__name",
  ParentNumberDisputes = "parent__numberDisputes",
  ParentNumberStakedJurors = "parent__numberStakedJurors",
  ParentPaidEth = "parent__paidETH",
  ParentPaidPnk = "parent__paidPNK",
  ParentPolicy = "parent__policy",
  ParentStake = "parent__stake",
  Policy = "policy",
  Stake = "stake",
  StakedJurors = "stakedJurors",
  SupportedDisputeKits = "supportedDisputeKits",
  TimesPerPeriod = "timesPerPeriod",
}

export type Dispute = {
  __typename?: "Dispute";
  arbitrated: Arbitrable;
  court: Court;
  currentRound: Round;
  currentRoundIndex: Scalars["BigInt"]["output"];
  currentRuling: Scalars["BigInt"]["output"];
  disputeKitDispute?: Maybe<DisputeKitDispute>;
  id: Scalars["ID"]["output"];
  lastPeriodChange: Scalars["BigInt"]["output"];
  overridden: Scalars["Boolean"]["output"];
  period: Period;
  rounds: Array<Round>;
  ruled: Scalars["Boolean"]["output"];
  shifts: Array<TokenAndEthShift>;
  tied: Scalars["Boolean"]["output"];
};

export type DisputeRoundsArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Round_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  where?: InputMaybe<Round_Filter>;
};

export type DisputeShiftsArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<TokenAndEthShift_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  where?: InputMaybe<TokenAndEthShift_Filter>;
};

export type DisputeKit = {
  __typename?: "DisputeKit";
  address?: Maybe<Scalars["Bytes"]["output"]>;
  children: Array<DisputeKit>;
  courts: Array<Court>;
  depthLevel: Scalars["BigInt"]["output"];
  id: Scalars["ID"]["output"];
  needsFreezing: Scalars["Boolean"]["output"];
  parent?: Maybe<DisputeKit>;
  rounds: Array<Round>;
};

export type DisputeKitChildrenArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<DisputeKit_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  where?: InputMaybe<DisputeKit_Filter>;
};

export type DisputeKitCourtsArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Court_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  where?: InputMaybe<Court_Filter>;
};

export type DisputeKitRoundsArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Round_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  where?: InputMaybe<Round_Filter>;
};

export type DisputeKitDispute = {
  coreDispute: Dispute;
  currentLocalRoundIndex: Scalars["BigInt"]["output"];
  id: Scalars["ID"]["output"];
  localRounds: Array<DisputeKitRound>;
};

export type DisputeKitDisputeLocalRoundsArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<DisputeKitRound_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  where?: InputMaybe<DisputeKitRound_Filter>;
};

export type DisputeKitDispute_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<DisputeKitDispute_Filter>>>;
  coreDispute?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_?: InputMaybe<Dispute_Filter>;
  coreDispute_contains?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_gt?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_gte?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  coreDispute_lt?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_lte?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  coreDispute_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  currentLocalRoundIndex?: InputMaybe<Scalars["BigInt"]["input"]>;
  currentLocalRoundIndex_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  currentLocalRoundIndex_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  currentLocalRoundIndex_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  currentLocalRoundIndex_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  currentLocalRoundIndex_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  currentLocalRoundIndex_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  currentLocalRoundIndex_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  id_gt?: InputMaybe<Scalars["ID"]["input"]>;
  id_gte?: InputMaybe<Scalars["ID"]["input"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  id_lt?: InputMaybe<Scalars["ID"]["input"]>;
  id_lte?: InputMaybe<Scalars["ID"]["input"]>;
  id_not?: InputMaybe<Scalars["ID"]["input"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  localRounds_?: InputMaybe<DisputeKitRound_Filter>;
  or?: InputMaybe<Array<InputMaybe<DisputeKitDispute_Filter>>>;
};

export enum DisputeKitDispute_OrderBy {
  CoreDispute = "coreDispute",
  CoreDisputeCurrentRoundIndex = "coreDispute__currentRoundIndex",
  CoreDisputeCurrentRuling = "coreDispute__currentRuling",
  CoreDisputeId = "coreDispute__id",
  CoreDisputeLastPeriodChange = "coreDispute__lastPeriodChange",
  CoreDisputeOverridden = "coreDispute__overridden",
  CoreDisputePeriod = "coreDispute__period",
  CoreDisputeRuled = "coreDispute__ruled",
  CoreDisputeTied = "coreDispute__tied",
  CurrentLocalRoundIndex = "currentLocalRoundIndex",
  Id = "id",
  LocalRounds = "localRounds",
}

export type DisputeKitRound = {
  id: Scalars["ID"]["output"];
  localDispute: DisputeKitDispute;
  votes: Array<Vote>;
};

export type DisputeKitRoundVotesArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Vote_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  where?: InputMaybe<Vote_Filter>;
};

export type DisputeKitRound_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<DisputeKitRound_Filter>>>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  id_gt?: InputMaybe<Scalars["ID"]["input"]>;
  id_gte?: InputMaybe<Scalars["ID"]["input"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  id_lt?: InputMaybe<Scalars["ID"]["input"]>;
  id_lte?: InputMaybe<Scalars["ID"]["input"]>;
  id_not?: InputMaybe<Scalars["ID"]["input"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  localDispute?: InputMaybe<Scalars["String"]["input"]>;
  localDispute_?: InputMaybe<DisputeKitDispute_Filter>;
  localDispute_contains?: InputMaybe<Scalars["String"]["input"]>;
  localDispute_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  localDispute_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  localDispute_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  localDispute_gt?: InputMaybe<Scalars["String"]["input"]>;
  localDispute_gte?: InputMaybe<Scalars["String"]["input"]>;
  localDispute_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  localDispute_lt?: InputMaybe<Scalars["String"]["input"]>;
  localDispute_lte?: InputMaybe<Scalars["String"]["input"]>;
  localDispute_not?: InputMaybe<Scalars["String"]["input"]>;
  localDispute_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  localDispute_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  localDispute_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  localDispute_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  localDispute_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  localDispute_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  localDispute_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  localDispute_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  localDispute_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  or?: InputMaybe<Array<InputMaybe<DisputeKitRound_Filter>>>;
  votes_?: InputMaybe<Vote_Filter>;
};

export enum DisputeKitRound_OrderBy {
  Id = "id",
  LocalDispute = "localDispute",
  LocalDisputeCurrentLocalRoundIndex = "localDispute__currentLocalRoundIndex",
  LocalDisputeId = "localDispute__id",
  Votes = "votes",
}

export type DisputeKit_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  address?: InputMaybe<Scalars["Bytes"]["input"]>;
  address_contains?: InputMaybe<Scalars["Bytes"]["input"]>;
  address_gt?: InputMaybe<Scalars["Bytes"]["input"]>;
  address_gte?: InputMaybe<Scalars["Bytes"]["input"]>;
  address_in?: InputMaybe<Array<Scalars["Bytes"]["input"]>>;
  address_lt?: InputMaybe<Scalars["Bytes"]["input"]>;
  address_lte?: InputMaybe<Scalars["Bytes"]["input"]>;
  address_not?: InputMaybe<Scalars["Bytes"]["input"]>;
  address_not_contains?: InputMaybe<Scalars["Bytes"]["input"]>;
  address_not_in?: InputMaybe<Array<Scalars["Bytes"]["input"]>>;
  and?: InputMaybe<Array<InputMaybe<DisputeKit_Filter>>>;
  children_?: InputMaybe<DisputeKit_Filter>;
  courts_?: InputMaybe<Court_Filter>;
  depthLevel?: InputMaybe<Scalars["BigInt"]["input"]>;
  depthLevel_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  depthLevel_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  depthLevel_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  depthLevel_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  depthLevel_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  depthLevel_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  depthLevel_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  id_gt?: InputMaybe<Scalars["ID"]["input"]>;
  id_gte?: InputMaybe<Scalars["ID"]["input"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  id_lt?: InputMaybe<Scalars["ID"]["input"]>;
  id_lte?: InputMaybe<Scalars["ID"]["input"]>;
  id_not?: InputMaybe<Scalars["ID"]["input"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  needsFreezing?: InputMaybe<Scalars["Boolean"]["input"]>;
  needsFreezing_in?: InputMaybe<Array<Scalars["Boolean"]["input"]>>;
  needsFreezing_not?: InputMaybe<Scalars["Boolean"]["input"]>;
  needsFreezing_not_in?: InputMaybe<Array<Scalars["Boolean"]["input"]>>;
  or?: InputMaybe<Array<InputMaybe<DisputeKit_Filter>>>;
  parent?: InputMaybe<Scalars["String"]["input"]>;
  parent_?: InputMaybe<DisputeKit_Filter>;
  parent_contains?: InputMaybe<Scalars["String"]["input"]>;
  parent_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  parent_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  parent_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  parent_gt?: InputMaybe<Scalars["String"]["input"]>;
  parent_gte?: InputMaybe<Scalars["String"]["input"]>;
  parent_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  parent_lt?: InputMaybe<Scalars["String"]["input"]>;
  parent_lte?: InputMaybe<Scalars["String"]["input"]>;
  parent_not?: InputMaybe<Scalars["String"]["input"]>;
  parent_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  parent_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  parent_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  parent_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  parent_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  parent_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  parent_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  parent_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  parent_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  rounds_?: InputMaybe<Round_Filter>;
};

export enum DisputeKit_OrderBy {
  Address = "address",
  Children = "children",
  Courts = "courts",
  DepthLevel = "depthLevel",
  Id = "id",
  NeedsFreezing = "needsFreezing",
  Parent = "parent",
  ParentAddress = "parent__address",
  ParentDepthLevel = "parent__depthLevel",
  ParentId = "parent__id",
  ParentNeedsFreezing = "parent__needsFreezing",
  Rounds = "rounds",
}

export type DisputeTemplate = {
  __typename?: "DisputeTemplate";
  id: Scalars["ID"]["output"];
  templateData: Scalars["String"]["output"];
  templateDataMappings: Scalars["String"]["output"];
  templateTag?: Maybe<Scalars["String"]["output"]>;
};

export type DisputeTemplate_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<DisputeTemplate_Filter>>>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  id_gt?: InputMaybe<Scalars["ID"]["input"]>;
  id_gte?: InputMaybe<Scalars["ID"]["input"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  id_lt?: InputMaybe<Scalars["ID"]["input"]>;
  id_lte?: InputMaybe<Scalars["ID"]["input"]>;
  id_not?: InputMaybe<Scalars["ID"]["input"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  or?: InputMaybe<Array<InputMaybe<DisputeTemplate_Filter>>>;
  templateData?: InputMaybe<Scalars["String"]["input"]>;
  templateDataMappings?: InputMaybe<Scalars["String"]["input"]>;
  templateDataMappings_contains?: InputMaybe<Scalars["String"]["input"]>;
  templateDataMappings_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  templateDataMappings_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  templateDataMappings_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  templateDataMappings_gt?: InputMaybe<Scalars["String"]["input"]>;
  templateDataMappings_gte?: InputMaybe<Scalars["String"]["input"]>;
  templateDataMappings_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  templateDataMappings_lt?: InputMaybe<Scalars["String"]["input"]>;
  templateDataMappings_lte?: InputMaybe<Scalars["String"]["input"]>;
  templateDataMappings_not?: InputMaybe<Scalars["String"]["input"]>;
  templateDataMappings_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  templateDataMappings_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  templateDataMappings_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  templateDataMappings_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  templateDataMappings_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  templateDataMappings_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  templateDataMappings_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  templateDataMappings_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  templateDataMappings_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  templateData_contains?: InputMaybe<Scalars["String"]["input"]>;
  templateData_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  templateData_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  templateData_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  templateData_gt?: InputMaybe<Scalars["String"]["input"]>;
  templateData_gte?: InputMaybe<Scalars["String"]["input"]>;
  templateData_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  templateData_lt?: InputMaybe<Scalars["String"]["input"]>;
  templateData_lte?: InputMaybe<Scalars["String"]["input"]>;
  templateData_not?: InputMaybe<Scalars["String"]["input"]>;
  templateData_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  templateData_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  templateData_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  templateData_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  templateData_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  templateData_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  templateData_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  templateData_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  templateData_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  templateTag?: InputMaybe<Scalars["String"]["input"]>;
  templateTag_contains?: InputMaybe<Scalars["String"]["input"]>;
  templateTag_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  templateTag_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  templateTag_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  templateTag_gt?: InputMaybe<Scalars["String"]["input"]>;
  templateTag_gte?: InputMaybe<Scalars["String"]["input"]>;
  templateTag_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  templateTag_lt?: InputMaybe<Scalars["String"]["input"]>;
  templateTag_lte?: InputMaybe<Scalars["String"]["input"]>;
  templateTag_not?: InputMaybe<Scalars["String"]["input"]>;
  templateTag_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  templateTag_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  templateTag_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  templateTag_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  templateTag_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  templateTag_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  templateTag_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  templateTag_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  templateTag_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
};

export enum DisputeTemplate_OrderBy {
  Id = "id",
  TemplateData = "templateData",
  TemplateDataMappings = "templateDataMappings",
  TemplateTag = "templateTag",
}

export type Dispute_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Dispute_Filter>>>;
  arbitrated?: InputMaybe<Scalars["String"]["input"]>;
  arbitrated_?: InputMaybe<Arbitrable_Filter>;
  arbitrated_contains?: InputMaybe<Scalars["String"]["input"]>;
  arbitrated_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  arbitrated_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  arbitrated_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  arbitrated_gt?: InputMaybe<Scalars["String"]["input"]>;
  arbitrated_gte?: InputMaybe<Scalars["String"]["input"]>;
  arbitrated_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  arbitrated_lt?: InputMaybe<Scalars["String"]["input"]>;
  arbitrated_lte?: InputMaybe<Scalars["String"]["input"]>;
  arbitrated_not?: InputMaybe<Scalars["String"]["input"]>;
  arbitrated_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  arbitrated_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  arbitrated_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  arbitrated_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  arbitrated_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  arbitrated_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  arbitrated_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  arbitrated_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  arbitrated_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  court?: InputMaybe<Scalars["String"]["input"]>;
  court_?: InputMaybe<Court_Filter>;
  court_contains?: InputMaybe<Scalars["String"]["input"]>;
  court_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  court_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  court_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  court_gt?: InputMaybe<Scalars["String"]["input"]>;
  court_gte?: InputMaybe<Scalars["String"]["input"]>;
  court_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  court_lt?: InputMaybe<Scalars["String"]["input"]>;
  court_lte?: InputMaybe<Scalars["String"]["input"]>;
  court_not?: InputMaybe<Scalars["String"]["input"]>;
  court_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  court_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  court_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  court_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  court_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  court_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  court_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  court_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  court_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  currentRound?: InputMaybe<Scalars["String"]["input"]>;
  currentRoundIndex?: InputMaybe<Scalars["BigInt"]["input"]>;
  currentRoundIndex_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  currentRoundIndex_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  currentRoundIndex_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  currentRoundIndex_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  currentRoundIndex_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  currentRoundIndex_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  currentRoundIndex_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  currentRound_?: InputMaybe<Round_Filter>;
  currentRound_contains?: InputMaybe<Scalars["String"]["input"]>;
  currentRound_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  currentRound_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  currentRound_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  currentRound_gt?: InputMaybe<Scalars["String"]["input"]>;
  currentRound_gte?: InputMaybe<Scalars["String"]["input"]>;
  currentRound_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  currentRound_lt?: InputMaybe<Scalars["String"]["input"]>;
  currentRound_lte?: InputMaybe<Scalars["String"]["input"]>;
  currentRound_not?: InputMaybe<Scalars["String"]["input"]>;
  currentRound_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  currentRound_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  currentRound_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  currentRound_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  currentRound_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  currentRound_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  currentRound_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  currentRound_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  currentRound_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  currentRuling?: InputMaybe<Scalars["BigInt"]["input"]>;
  currentRuling_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  currentRuling_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  currentRuling_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  currentRuling_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  currentRuling_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  currentRuling_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  currentRuling_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  disputeKitDispute_?: InputMaybe<DisputeKitDispute_Filter>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  id_gt?: InputMaybe<Scalars["ID"]["input"]>;
  id_gte?: InputMaybe<Scalars["ID"]["input"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  id_lt?: InputMaybe<Scalars["ID"]["input"]>;
  id_lte?: InputMaybe<Scalars["ID"]["input"]>;
  id_not?: InputMaybe<Scalars["ID"]["input"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  lastPeriodChange?: InputMaybe<Scalars["BigInt"]["input"]>;
  lastPeriodChange_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  lastPeriodChange_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  lastPeriodChange_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  lastPeriodChange_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  lastPeriodChange_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  lastPeriodChange_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  lastPeriodChange_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  or?: InputMaybe<Array<InputMaybe<Dispute_Filter>>>;
  overridden?: InputMaybe<Scalars["Boolean"]["input"]>;
  overridden_in?: InputMaybe<Array<Scalars["Boolean"]["input"]>>;
  overridden_not?: InputMaybe<Scalars["Boolean"]["input"]>;
  overridden_not_in?: InputMaybe<Array<Scalars["Boolean"]["input"]>>;
  period?: InputMaybe<Period>;
  period_in?: InputMaybe<Array<Period>>;
  period_not?: InputMaybe<Period>;
  period_not_in?: InputMaybe<Array<Period>>;
  rounds_?: InputMaybe<Round_Filter>;
  ruled?: InputMaybe<Scalars["Boolean"]["input"]>;
  ruled_in?: InputMaybe<Array<Scalars["Boolean"]["input"]>>;
  ruled_not?: InputMaybe<Scalars["Boolean"]["input"]>;
  ruled_not_in?: InputMaybe<Array<Scalars["Boolean"]["input"]>>;
  shifts_?: InputMaybe<TokenAndEthShift_Filter>;
  tied?: InputMaybe<Scalars["Boolean"]["input"]>;
  tied_in?: InputMaybe<Array<Scalars["Boolean"]["input"]>>;
  tied_not?: InputMaybe<Scalars["Boolean"]["input"]>;
  tied_not_in?: InputMaybe<Array<Scalars["Boolean"]["input"]>>;
};

export enum Dispute_OrderBy {
  Arbitrated = "arbitrated",
  ArbitratedId = "arbitrated__id",
  ArbitratedTotalDisputes = "arbitrated__totalDisputes",
  Court = "court",
  CourtAlpha = "court__alpha",
  CourtDelayedStake = "court__delayedStake",
  CourtFeeForJuror = "court__feeForJuror",
  CourtHiddenVotes = "court__hiddenVotes",
  CourtId = "court__id",
  CourtJurorsForCourtJump = "court__jurorsForCourtJump",
  CourtMinStake = "court__minStake",
  CourtName = "court__name",
  CourtNumberDisputes = "court__numberDisputes",
  CourtNumberStakedJurors = "court__numberStakedJurors",
  CourtPaidEth = "court__paidETH",
  CourtPaidPnk = "court__paidPNK",
  CourtPolicy = "court__policy",
  CourtStake = "court__stake",
  CurrentRound = "currentRound",
  CurrentRoundIndex = "currentRoundIndex",
  CurrentRoundId = "currentRound__id",
  CurrentRoundNbVotes = "currentRound__nbVotes",
  CurrentRoundPenalties = "currentRound__penalties",
  CurrentRoundRepartitions = "currentRound__repartitions",
  CurrentRoundTokensAtStakePerJuror = "currentRound__tokensAtStakePerJuror",
  CurrentRoundTotalFeesForJurors = "currentRound__totalFeesForJurors",
  CurrentRuling = "currentRuling",
  DisputeKitDispute = "disputeKitDispute",
  DisputeKitDisputeCurrentLocalRoundIndex = "disputeKitDispute__currentLocalRoundIndex",
  DisputeKitDisputeId = "disputeKitDispute__id",
  Id = "id",
  LastPeriodChange = "lastPeriodChange",
  Overridden = "overridden",
  Period = "period",
  Rounds = "rounds",
  Ruled = "ruled",
  Shifts = "shifts",
  Tied = "tied",
}

export type Draw = {
  __typename?: "Draw";
  dispute: Dispute;
  id: Scalars["ID"]["output"];
  juror: User;
  round: Round;
  vote?: Maybe<Vote>;
  voteID: Scalars["BigInt"]["output"];
};

export type Draw_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Draw_Filter>>>;
  dispute?: InputMaybe<Scalars["String"]["input"]>;
  dispute_?: InputMaybe<Dispute_Filter>;
  dispute_contains?: InputMaybe<Scalars["String"]["input"]>;
  dispute_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  dispute_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  dispute_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  dispute_gt?: InputMaybe<Scalars["String"]["input"]>;
  dispute_gte?: InputMaybe<Scalars["String"]["input"]>;
  dispute_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  dispute_lt?: InputMaybe<Scalars["String"]["input"]>;
  dispute_lte?: InputMaybe<Scalars["String"]["input"]>;
  dispute_not?: InputMaybe<Scalars["String"]["input"]>;
  dispute_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  dispute_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  dispute_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  dispute_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  dispute_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  dispute_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  dispute_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  dispute_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  dispute_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  id_gt?: InputMaybe<Scalars["ID"]["input"]>;
  id_gte?: InputMaybe<Scalars["ID"]["input"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  id_lt?: InputMaybe<Scalars["ID"]["input"]>;
  id_lte?: InputMaybe<Scalars["ID"]["input"]>;
  id_not?: InputMaybe<Scalars["ID"]["input"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  juror?: InputMaybe<Scalars["String"]["input"]>;
  juror_?: InputMaybe<User_Filter>;
  juror_contains?: InputMaybe<Scalars["String"]["input"]>;
  juror_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  juror_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  juror_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  juror_gt?: InputMaybe<Scalars["String"]["input"]>;
  juror_gte?: InputMaybe<Scalars["String"]["input"]>;
  juror_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  juror_lt?: InputMaybe<Scalars["String"]["input"]>;
  juror_lte?: InputMaybe<Scalars["String"]["input"]>;
  juror_not?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  juror_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  juror_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  juror_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  or?: InputMaybe<Array<InputMaybe<Draw_Filter>>>;
  round?: InputMaybe<Scalars["String"]["input"]>;
  round_?: InputMaybe<Round_Filter>;
  round_contains?: InputMaybe<Scalars["String"]["input"]>;
  round_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  round_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  round_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  round_gt?: InputMaybe<Scalars["String"]["input"]>;
  round_gte?: InputMaybe<Scalars["String"]["input"]>;
  round_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  round_lt?: InputMaybe<Scalars["String"]["input"]>;
  round_lte?: InputMaybe<Scalars["String"]["input"]>;
  round_not?: InputMaybe<Scalars["String"]["input"]>;
  round_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  round_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  round_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  round_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  round_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  round_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  round_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  round_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  round_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  voteID?: InputMaybe<Scalars["BigInt"]["input"]>;
  voteID_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  voteID_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  voteID_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  voteID_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  voteID_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  voteID_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  voteID_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  vote_?: InputMaybe<Vote_Filter>;
};

export enum Draw_OrderBy {
  Dispute = "dispute",
  DisputeCurrentRoundIndex = "dispute__currentRoundIndex",
  DisputeCurrentRuling = "dispute__currentRuling",
  DisputeId = "dispute__id",
  DisputeLastPeriodChange = "dispute__lastPeriodChange",
  DisputeOverridden = "dispute__overridden",
  DisputePeriod = "dispute__period",
  DisputeRuled = "dispute__ruled",
  DisputeTied = "dispute__tied",
  Id = "id",
  Juror = "juror",
  JurorActiveDisputes = "juror__activeDisputes",
  JurorId = "juror__id",
  JurorTotalCoherent = "juror__totalCoherent",
  JurorTotalDelayed = "juror__totalDelayed",
  JurorTotalDisputes = "juror__totalDisputes",
  JurorTotalResolvedDisputes = "juror__totalResolvedDisputes",
  JurorTotalStake = "juror__totalStake",
  Round = "round",
  RoundId = "round__id",
  RoundNbVotes = "round__nbVotes",
  RoundPenalties = "round__penalties",
  RoundRepartitions = "round__repartitions",
  RoundTokensAtStakePerJuror = "round__tokensAtStakePerJuror",
  RoundTotalFeesForJurors = "round__totalFeesForJurors",
  Vote = "vote",
  VoteId = "voteID",
  VoteId = "vote__id",
}

export type Evidence = {
  evidence: Scalars["String"]["output"];
  evidenceGroup: EvidenceGroup;
  id: Scalars["ID"]["output"];
  sender: User;
};

export type EvidenceGroup = {
  evidences: Array<Evidence>;
  id: Scalars["ID"]["output"];
  nextEvidenceIndex: Scalars["BigInt"]["output"];
};

export type EvidenceGroupEvidencesArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Evidence_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  where?: InputMaybe<Evidence_Filter>;
};

export type EvidenceGroup_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<EvidenceGroup_Filter>>>;
  evidences_?: InputMaybe<Evidence_Filter>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  id_gt?: InputMaybe<Scalars["ID"]["input"]>;
  id_gte?: InputMaybe<Scalars["ID"]["input"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  id_lt?: InputMaybe<Scalars["ID"]["input"]>;
  id_lte?: InputMaybe<Scalars["ID"]["input"]>;
  id_not?: InputMaybe<Scalars["ID"]["input"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  nextEvidenceIndex?: InputMaybe<Scalars["BigInt"]["input"]>;
  nextEvidenceIndex_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  nextEvidenceIndex_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  nextEvidenceIndex_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  nextEvidenceIndex_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  nextEvidenceIndex_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  nextEvidenceIndex_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  nextEvidenceIndex_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  or?: InputMaybe<Array<InputMaybe<EvidenceGroup_Filter>>>;
};

export enum EvidenceGroup_OrderBy {
  Evidences = "evidences",
  Id = "id",
  NextEvidenceIndex = "nextEvidenceIndex",
}

export type Evidence_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Evidence_Filter>>>;
  evidence?: InputMaybe<Scalars["String"]["input"]>;
  evidenceGroup?: InputMaybe<Scalars["String"]["input"]>;
  evidenceGroup_?: InputMaybe<EvidenceGroup_Filter>;
  evidenceGroup_contains?: InputMaybe<Scalars["String"]["input"]>;
  evidenceGroup_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  evidenceGroup_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  evidenceGroup_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  evidenceGroup_gt?: InputMaybe<Scalars["String"]["input"]>;
  evidenceGroup_gte?: InputMaybe<Scalars["String"]["input"]>;
  evidenceGroup_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  evidenceGroup_lt?: InputMaybe<Scalars["String"]["input"]>;
  evidenceGroup_lte?: InputMaybe<Scalars["String"]["input"]>;
  evidenceGroup_not?: InputMaybe<Scalars["String"]["input"]>;
  evidenceGroup_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  evidenceGroup_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  evidenceGroup_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  evidenceGroup_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  evidenceGroup_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  evidenceGroup_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  evidenceGroup_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  evidenceGroup_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  evidenceGroup_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  evidence_contains?: InputMaybe<Scalars["String"]["input"]>;
  evidence_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  evidence_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  evidence_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  evidence_gt?: InputMaybe<Scalars["String"]["input"]>;
  evidence_gte?: InputMaybe<Scalars["String"]["input"]>;
  evidence_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  evidence_lt?: InputMaybe<Scalars["String"]["input"]>;
  evidence_lte?: InputMaybe<Scalars["String"]["input"]>;
  evidence_not?: InputMaybe<Scalars["String"]["input"]>;
  evidence_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  evidence_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  evidence_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  evidence_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  evidence_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  evidence_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  evidence_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  evidence_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  evidence_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  id_gt?: InputMaybe<Scalars["ID"]["input"]>;
  id_gte?: InputMaybe<Scalars["ID"]["input"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  id_lt?: InputMaybe<Scalars["ID"]["input"]>;
  id_lte?: InputMaybe<Scalars["ID"]["input"]>;
  id_not?: InputMaybe<Scalars["ID"]["input"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  or?: InputMaybe<Array<InputMaybe<Evidence_Filter>>>;
  sender?: InputMaybe<Scalars["String"]["input"]>;
  sender_?: InputMaybe<User_Filter>;
  sender_contains?: InputMaybe<Scalars["String"]["input"]>;
  sender_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  sender_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  sender_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  sender_gt?: InputMaybe<Scalars["String"]["input"]>;
  sender_gte?: InputMaybe<Scalars["String"]["input"]>;
  sender_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  sender_lt?: InputMaybe<Scalars["String"]["input"]>;
  sender_lte?: InputMaybe<Scalars["String"]["input"]>;
  sender_not?: InputMaybe<Scalars["String"]["input"]>;
  sender_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  sender_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  sender_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  sender_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  sender_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  sender_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  sender_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  sender_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  sender_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
};

export enum Evidence_OrderBy {
  Evidence = "evidence",
  EvidenceGroup = "evidenceGroup",
  EvidenceGroupId = "evidenceGroup__id",
  EvidenceGroupNextEvidenceIndex = "evidenceGroup__nextEvidenceIndex",
  Id = "id",
  Sender = "sender",
  SenderActiveDisputes = "sender__activeDisputes",
  SenderId = "sender__id",
  SenderTotalCoherent = "sender__totalCoherent",
  SenderTotalDelayed = "sender__totalDelayed",
  SenderTotalDisputes = "sender__totalDisputes",
  SenderTotalResolvedDisputes = "sender__totalResolvedDisputes",
  SenderTotalStake = "sender__totalStake",
}

export type FeeToken = {
  __typename?: "FeeToken";
  accepted: Scalars["Boolean"]["output"];
  id: Scalars["ID"]["output"];
  rateDecimals: Scalars["Int"]["output"];
  rateInEth: Scalars["BigInt"]["output"];
  rounds?: Maybe<Array<Round>>;
  tokenAndETHShift?: Maybe<Array<TokenAndEthShift>>;
  totalPaid: Scalars["BigInt"]["output"];
  totalPaidInETH: Scalars["BigInt"]["output"];
};

export type FeeTokenRoundsArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Round_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  where?: InputMaybe<Round_Filter>;
};

export type FeeTokenTokenAndEthShiftArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<TokenAndEthShift_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  where?: InputMaybe<TokenAndEthShift_Filter>;
};

export type FeeToken_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  accepted?: InputMaybe<Scalars["Boolean"]["input"]>;
  accepted_in?: InputMaybe<Array<Scalars["Boolean"]["input"]>>;
  accepted_not?: InputMaybe<Scalars["Boolean"]["input"]>;
  accepted_not_in?: InputMaybe<Array<Scalars["Boolean"]["input"]>>;
  and?: InputMaybe<Array<InputMaybe<FeeToken_Filter>>>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  id_gt?: InputMaybe<Scalars["ID"]["input"]>;
  id_gte?: InputMaybe<Scalars["ID"]["input"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  id_lt?: InputMaybe<Scalars["ID"]["input"]>;
  id_lte?: InputMaybe<Scalars["ID"]["input"]>;
  id_not?: InputMaybe<Scalars["ID"]["input"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  or?: InputMaybe<Array<InputMaybe<FeeToken_Filter>>>;
  rateDecimals?: InputMaybe<Scalars["Int"]["input"]>;
  rateDecimals_gt?: InputMaybe<Scalars["Int"]["input"]>;
  rateDecimals_gte?: InputMaybe<Scalars["Int"]["input"]>;
  rateDecimals_in?: InputMaybe<Array<Scalars["Int"]["input"]>>;
  rateDecimals_lt?: InputMaybe<Scalars["Int"]["input"]>;
  rateDecimals_lte?: InputMaybe<Scalars["Int"]["input"]>;
  rateDecimals_not?: InputMaybe<Scalars["Int"]["input"]>;
  rateDecimals_not_in?: InputMaybe<Array<Scalars["Int"]["input"]>>;
  rateInEth?: InputMaybe<Scalars["BigInt"]["input"]>;
  rateInEth_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  rateInEth_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  rateInEth_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  rateInEth_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  rateInEth_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  rateInEth_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  rateInEth_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  rounds_?: InputMaybe<Round_Filter>;
  tokenAndETHShift_?: InputMaybe<TokenAndEthShift_Filter>;
  totalPaid?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalPaidInETH?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalPaidInETH_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalPaidInETH_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalPaidInETH_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  totalPaidInETH_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalPaidInETH_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalPaidInETH_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalPaidInETH_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  totalPaid_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalPaid_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalPaid_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  totalPaid_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalPaid_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalPaid_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalPaid_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
};

export enum FeeToken_OrderBy {
  Accepted = "accepted",
  Id = "id",
  RateDecimals = "rateDecimals",
  RateInEth = "rateInEth",
  Rounds = "rounds",
  TokenAndEthShift = "tokenAndETHShift",
  TotalPaid = "totalPaid",
  TotalPaidInEth = "totalPaidInETH",
}

export type JurorTokensPerCourt = {
  __typename?: "JurorTokensPerCourt";
  court: Court;
  delayed: Scalars["BigInt"]["output"];
  id: Scalars["ID"]["output"];
  juror: User;
  locked: Scalars["BigInt"]["output"];
  staked: Scalars["BigInt"]["output"];
};

export type JurorTokensPerCourt_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<JurorTokensPerCourt_Filter>>>;
  court?: InputMaybe<Scalars["String"]["input"]>;
  court_?: InputMaybe<Court_Filter>;
  court_contains?: InputMaybe<Scalars["String"]["input"]>;
  court_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  court_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  court_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  court_gt?: InputMaybe<Scalars["String"]["input"]>;
  court_gte?: InputMaybe<Scalars["String"]["input"]>;
  court_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  court_lt?: InputMaybe<Scalars["String"]["input"]>;
  court_lte?: InputMaybe<Scalars["String"]["input"]>;
  court_not?: InputMaybe<Scalars["String"]["input"]>;
  court_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  court_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  court_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  court_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  court_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  court_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  court_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  court_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  court_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  delayed?: InputMaybe<Scalars["BigInt"]["input"]>;
  delayed_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  delayed_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  delayed_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  delayed_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  delayed_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  delayed_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  delayed_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  id_gt?: InputMaybe<Scalars["ID"]["input"]>;
  id_gte?: InputMaybe<Scalars["ID"]["input"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  id_lt?: InputMaybe<Scalars["ID"]["input"]>;
  id_lte?: InputMaybe<Scalars["ID"]["input"]>;
  id_not?: InputMaybe<Scalars["ID"]["input"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  juror?: InputMaybe<Scalars["String"]["input"]>;
  juror_?: InputMaybe<User_Filter>;
  juror_contains?: InputMaybe<Scalars["String"]["input"]>;
  juror_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  juror_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  juror_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  juror_gt?: InputMaybe<Scalars["String"]["input"]>;
  juror_gte?: InputMaybe<Scalars["String"]["input"]>;
  juror_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  juror_lt?: InputMaybe<Scalars["String"]["input"]>;
  juror_lte?: InputMaybe<Scalars["String"]["input"]>;
  juror_not?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  juror_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  juror_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  juror_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  locked?: InputMaybe<Scalars["BigInt"]["input"]>;
  locked_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  locked_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  locked_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  locked_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  locked_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  locked_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  locked_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  or?: InputMaybe<Array<InputMaybe<JurorTokensPerCourt_Filter>>>;
  staked?: InputMaybe<Scalars["BigInt"]["input"]>;
  staked_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  staked_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  staked_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  staked_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  staked_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  staked_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  staked_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
};

export enum JurorTokensPerCourt_OrderBy {
  Court = "court",
  CourtAlpha = "court__alpha",
  CourtDelayedStake = "court__delayedStake",
  CourtFeeForJuror = "court__feeForJuror",
  CourtHiddenVotes = "court__hiddenVotes",
  CourtId = "court__id",
  CourtJurorsForCourtJump = "court__jurorsForCourtJump",
  CourtMinStake = "court__minStake",
  CourtName = "court__name",
  CourtNumberDisputes = "court__numberDisputes",
  CourtNumberStakedJurors = "court__numberStakedJurors",
  CourtPaidEth = "court__paidETH",
  CourtPaidPnk = "court__paidPNK",
  CourtPolicy = "court__policy",
  CourtStake = "court__stake",
  Delayed = "delayed",
  Id = "id",
  Juror = "juror",
  JurorActiveDisputes = "juror__activeDisputes",
  JurorId = "juror__id",
  JurorTotalCoherent = "juror__totalCoherent",
  JurorTotalDelayed = "juror__totalDelayed",
  JurorTotalDisputes = "juror__totalDisputes",
  JurorTotalResolvedDisputes = "juror__totalResolvedDisputes",
  JurorTotalStake = "juror__totalStake",
  Locked = "locked",
  Staked = "staked",
}

/** Defines the order direction, either ascending or descending */
export enum OrderDirection {
  Asc = "asc",
  Desc = "desc",
}

export type Penalty = {
  __typename?: "Penalty";
  amount: Scalars["BigInt"]["output"];
  degreeOfCoherency: Scalars["BigInt"]["output"];
  dispute: Dispute;
  id: Scalars["ID"]["output"];
  juror: User;
  numberDraws: Scalars["BigInt"]["output"];
  round: Round;
};

export type Penalty_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars["BigInt"]["input"]>;
  amount_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  amount_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  amount_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  amount_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  amount_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  amount_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  amount_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  and?: InputMaybe<Array<InputMaybe<Penalty_Filter>>>;
  degreeOfCoherency?: InputMaybe<Scalars["BigInt"]["input"]>;
  degreeOfCoherency_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  degreeOfCoherency_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  degreeOfCoherency_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  degreeOfCoherency_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  degreeOfCoherency_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  degreeOfCoherency_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  degreeOfCoherency_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  dispute?: InputMaybe<Scalars["String"]["input"]>;
  dispute_?: InputMaybe<Dispute_Filter>;
  dispute_contains?: InputMaybe<Scalars["String"]["input"]>;
  dispute_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  dispute_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  dispute_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  dispute_gt?: InputMaybe<Scalars["String"]["input"]>;
  dispute_gte?: InputMaybe<Scalars["String"]["input"]>;
  dispute_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  dispute_lt?: InputMaybe<Scalars["String"]["input"]>;
  dispute_lte?: InputMaybe<Scalars["String"]["input"]>;
  dispute_not?: InputMaybe<Scalars["String"]["input"]>;
  dispute_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  dispute_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  dispute_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  dispute_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  dispute_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  dispute_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  dispute_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  dispute_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  dispute_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  id_gt?: InputMaybe<Scalars["ID"]["input"]>;
  id_gte?: InputMaybe<Scalars["ID"]["input"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  id_lt?: InputMaybe<Scalars["ID"]["input"]>;
  id_lte?: InputMaybe<Scalars["ID"]["input"]>;
  id_not?: InputMaybe<Scalars["ID"]["input"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  juror?: InputMaybe<Scalars["String"]["input"]>;
  juror_?: InputMaybe<User_Filter>;
  juror_contains?: InputMaybe<Scalars["String"]["input"]>;
  juror_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  juror_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  juror_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  juror_gt?: InputMaybe<Scalars["String"]["input"]>;
  juror_gte?: InputMaybe<Scalars["String"]["input"]>;
  juror_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  juror_lt?: InputMaybe<Scalars["String"]["input"]>;
  juror_lte?: InputMaybe<Scalars["String"]["input"]>;
  juror_not?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  juror_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  juror_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  juror_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  numberDraws?: InputMaybe<Scalars["BigInt"]["input"]>;
  numberDraws_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  numberDraws_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  numberDraws_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  numberDraws_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  numberDraws_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  numberDraws_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  numberDraws_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  or?: InputMaybe<Array<InputMaybe<Penalty_Filter>>>;
  round?: InputMaybe<Scalars["String"]["input"]>;
  round_?: InputMaybe<Round_Filter>;
  round_contains?: InputMaybe<Scalars["String"]["input"]>;
  round_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  round_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  round_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  round_gt?: InputMaybe<Scalars["String"]["input"]>;
  round_gte?: InputMaybe<Scalars["String"]["input"]>;
  round_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  round_lt?: InputMaybe<Scalars["String"]["input"]>;
  round_lte?: InputMaybe<Scalars["String"]["input"]>;
  round_not?: InputMaybe<Scalars["String"]["input"]>;
  round_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  round_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  round_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  round_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  round_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  round_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  round_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  round_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  round_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
};

export enum Penalty_OrderBy {
  Amount = "amount",
  DegreeOfCoherency = "degreeOfCoherency",
  Dispute = "dispute",
  DisputeCurrentRoundIndex = "dispute__currentRoundIndex",
  DisputeCurrentRuling = "dispute__currentRuling",
  DisputeId = "dispute__id",
  DisputeLastPeriodChange = "dispute__lastPeriodChange",
  DisputeOverridden = "dispute__overridden",
  DisputePeriod = "dispute__period",
  DisputeRuled = "dispute__ruled",
  DisputeTied = "dispute__tied",
  Id = "id",
  Juror = "juror",
  JurorActiveDisputes = "juror__activeDisputes",
  JurorId = "juror__id",
  JurorTotalCoherent = "juror__totalCoherent",
  JurorTotalDelayed = "juror__totalDelayed",
  JurorTotalDisputes = "juror__totalDisputes",
  JurorTotalResolvedDisputes = "juror__totalResolvedDisputes",
  JurorTotalStake = "juror__totalStake",
  NumberDraws = "numberDraws",
  Round = "round",
  RoundId = "round__id",
  RoundNbVotes = "round__nbVotes",
  RoundPenalties = "round__penalties",
  RoundRepartitions = "round__repartitions",
  RoundTokensAtStakePerJuror = "round__tokensAtStakePerJuror",
  RoundTotalFeesForJurors = "round__totalFeesForJurors",
}

export enum Period {
  Appeal = "appeal",
  Commit = "commit",
  Evidence = "evidence",
  Execution = "execution",
  Vote = "vote",
}

export type Query = {
  __typename?: "Query";
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  arbitrable?: Maybe<Arbitrable>;
  arbitrables: Array<Arbitrable>;
  classicContribution?: Maybe<ClassicContribution>;
  classicContributions: Array<ClassicContribution>;
  classicDispute?: Maybe<ClassicDispute>;
  classicDisputes: Array<ClassicDispute>;
  classicEvidence?: Maybe<ClassicEvidence>;
  classicEvidenceGroup?: Maybe<ClassicEvidenceGroup>;
  classicEvidenceGroups: Array<ClassicEvidenceGroup>;
  classicEvidences: Array<ClassicEvidence>;
  classicJustification?: Maybe<ClassicJustification>;
  classicJustifications: Array<ClassicJustification>;
  classicRound?: Maybe<ClassicRound>;
  classicRounds: Array<ClassicRound>;
  classicVote?: Maybe<ClassicVote>;
  classicVotes: Array<ClassicVote>;
  contribution?: Maybe<Contribution>;
  contributions: Array<Contribution>;
  counter?: Maybe<Counter>;
  counters: Array<Counter>;
  court?: Maybe<Court>;
  courts: Array<Court>;
  dispute?: Maybe<Dispute>;
  disputeKit?: Maybe<DisputeKit>;
  disputeKitDispute?: Maybe<DisputeKitDispute>;
  disputeKitDisputes: Array<DisputeKitDispute>;
  disputeKitRound?: Maybe<DisputeKitRound>;
  disputeKitRounds: Array<DisputeKitRound>;
  disputeKits: Array<DisputeKit>;
  disputeTemplate?: Maybe<DisputeTemplate>;
  disputeTemplates: Array<DisputeTemplate>;
  disputes: Array<Dispute>;
  draw?: Maybe<Draw>;
  draws: Array<Draw>;
  evidence?: Maybe<Evidence>;
  evidenceGroup?: Maybe<EvidenceGroup>;
  evidenceGroups: Array<EvidenceGroup>;
  evidences: Array<Evidence>;
  feeToken?: Maybe<FeeToken>;
  feeTokens: Array<FeeToken>;
  jurorTokensPerCourt?: Maybe<JurorTokensPerCourt>;
  jurorTokensPerCourts: Array<JurorTokensPerCourt>;
  penalties: Array<Penalty>;
  penalty?: Maybe<Penalty>;
  round?: Maybe<Round>;
  rounds: Array<Round>;
  tokenAndETHShift?: Maybe<TokenAndEthShift>;
  tokenAndETHShifts: Array<TokenAndEthShift>;
  user?: Maybe<User>;
  users: Array<User>;
  vote?: Maybe<Vote>;
  votes: Array<Vote>;
};

export type Query_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};

export type QueryArbitrableArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryArbitrablesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Arbitrable_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Arbitrable_Filter>;
};

export type QueryClassicContributionArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryClassicContributionsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ClassicContribution_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ClassicContribution_Filter>;
};

export type QueryClassicDisputeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryClassicDisputesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ClassicDispute_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ClassicDispute_Filter>;
};

export type QueryClassicEvidenceArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryClassicEvidenceGroupArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryClassicEvidenceGroupsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ClassicEvidenceGroup_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ClassicEvidenceGroup_Filter>;
};

export type QueryClassicEvidencesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ClassicEvidence_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ClassicEvidence_Filter>;
};

export type QueryClassicJustificationArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryClassicJustificationsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ClassicJustification_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ClassicJustification_Filter>;
};

export type QueryClassicRoundArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryClassicRoundsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ClassicRound_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ClassicRound_Filter>;
};

export type QueryClassicVoteArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryClassicVotesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ClassicVote_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ClassicVote_Filter>;
};

export type QueryContributionArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryContributionsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Contribution_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Contribution_Filter>;
};

export type QueryCounterArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryCountersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Counter_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Counter_Filter>;
};

export type QueryCourtArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryCourtsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Court_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Court_Filter>;
};

export type QueryDisputeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryDisputeKitArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryDisputeKitDisputeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryDisputeKitDisputesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<DisputeKitDispute_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DisputeKitDispute_Filter>;
};

export type QueryDisputeKitRoundArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryDisputeKitRoundsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<DisputeKitRound_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DisputeKitRound_Filter>;
};

export type QueryDisputeKitsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<DisputeKit_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DisputeKit_Filter>;
};

export type QueryDisputeTemplateArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryDisputeTemplatesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<DisputeTemplate_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DisputeTemplate_Filter>;
};

export type QueryDisputesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Dispute_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Dispute_Filter>;
};

export type QueryDrawArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryDrawsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Draw_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Draw_Filter>;
};

export type QueryEvidenceArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryEvidenceGroupArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryEvidenceGroupsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<EvidenceGroup_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<EvidenceGroup_Filter>;
};

export type QueryEvidencesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Evidence_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Evidence_Filter>;
};

export type QueryFeeTokenArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryFeeTokensArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<FeeToken_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<FeeToken_Filter>;
};

export type QueryJurorTokensPerCourtArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryJurorTokensPerCourtsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<JurorTokensPerCourt_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<JurorTokensPerCourt_Filter>;
};

export type QueryPenaltiesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Penalty_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Penalty_Filter>;
};

export type QueryPenaltyArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryRoundArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryRoundsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Round_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Round_Filter>;
};

export type QueryTokenAndEthShiftArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryTokenAndEthShiftsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<TokenAndEthShift_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<TokenAndEthShift_Filter>;
};

export type QueryUserArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryUsersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<User_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<User_Filter>;
};

export type QueryVoteArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryVotesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Vote_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Vote_Filter>;
};

export type Round = {
  __typename?: "Round";
  dispute: Dispute;
  disputeKit: DisputeKit;
  drawnJurors: Array<Draw>;
  feeToken?: Maybe<FeeToken>;
  id: Scalars["ID"]["output"];
  nbVotes: Scalars["BigInt"]["output"];
  penalties: Scalars["BigInt"]["output"];
  repartitions: Scalars["BigInt"]["output"];
  tokensAtStakePerJuror: Scalars["BigInt"]["output"];
  totalFeesForJurors: Scalars["BigInt"]["output"];
};

export type RoundDrawnJurorsArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Draw_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  where?: InputMaybe<Draw_Filter>;
};

export type Round_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Round_Filter>>>;
  dispute?: InputMaybe<Scalars["String"]["input"]>;
  disputeKit?: InputMaybe<Scalars["String"]["input"]>;
  disputeKit_?: InputMaybe<DisputeKit_Filter>;
  disputeKit_contains?: InputMaybe<Scalars["String"]["input"]>;
  disputeKit_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  disputeKit_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  disputeKit_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  disputeKit_gt?: InputMaybe<Scalars["String"]["input"]>;
  disputeKit_gte?: InputMaybe<Scalars["String"]["input"]>;
  disputeKit_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  disputeKit_lt?: InputMaybe<Scalars["String"]["input"]>;
  disputeKit_lte?: InputMaybe<Scalars["String"]["input"]>;
  disputeKit_not?: InputMaybe<Scalars["String"]["input"]>;
  disputeKit_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  disputeKit_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  disputeKit_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  disputeKit_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  disputeKit_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  disputeKit_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  disputeKit_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  disputeKit_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  disputeKit_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  dispute_?: InputMaybe<Dispute_Filter>;
  dispute_contains?: InputMaybe<Scalars["String"]["input"]>;
  dispute_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  dispute_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  dispute_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  dispute_gt?: InputMaybe<Scalars["String"]["input"]>;
  dispute_gte?: InputMaybe<Scalars["String"]["input"]>;
  dispute_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  dispute_lt?: InputMaybe<Scalars["String"]["input"]>;
  dispute_lte?: InputMaybe<Scalars["String"]["input"]>;
  dispute_not?: InputMaybe<Scalars["String"]["input"]>;
  dispute_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  dispute_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  dispute_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  dispute_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  dispute_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  dispute_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  dispute_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  dispute_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  dispute_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  drawnJurors_?: InputMaybe<Draw_Filter>;
  feeToken?: InputMaybe<Scalars["String"]["input"]>;
  feeToken_?: InputMaybe<FeeToken_Filter>;
  feeToken_contains?: InputMaybe<Scalars["String"]["input"]>;
  feeToken_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  feeToken_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  feeToken_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  feeToken_gt?: InputMaybe<Scalars["String"]["input"]>;
  feeToken_gte?: InputMaybe<Scalars["String"]["input"]>;
  feeToken_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  feeToken_lt?: InputMaybe<Scalars["String"]["input"]>;
  feeToken_lte?: InputMaybe<Scalars["String"]["input"]>;
  feeToken_not?: InputMaybe<Scalars["String"]["input"]>;
  feeToken_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  feeToken_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  feeToken_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  feeToken_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  feeToken_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  feeToken_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  feeToken_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  feeToken_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  feeToken_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  id_gt?: InputMaybe<Scalars["ID"]["input"]>;
  id_gte?: InputMaybe<Scalars["ID"]["input"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  id_lt?: InputMaybe<Scalars["ID"]["input"]>;
  id_lte?: InputMaybe<Scalars["ID"]["input"]>;
  id_not?: InputMaybe<Scalars["ID"]["input"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  nbVotes?: InputMaybe<Scalars["BigInt"]["input"]>;
  nbVotes_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  nbVotes_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  nbVotes_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  nbVotes_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  nbVotes_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  nbVotes_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  nbVotes_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  or?: InputMaybe<Array<InputMaybe<Round_Filter>>>;
  penalties?: InputMaybe<Scalars["BigInt"]["input"]>;
  penalties_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  penalties_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  penalties_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  penalties_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  penalties_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  penalties_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  penalties_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  repartitions?: InputMaybe<Scalars["BigInt"]["input"]>;
  repartitions_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  repartitions_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  repartitions_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  repartitions_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  repartitions_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  repartitions_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  repartitions_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  tokensAtStakePerJuror?: InputMaybe<Scalars["BigInt"]["input"]>;
  tokensAtStakePerJuror_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  tokensAtStakePerJuror_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  tokensAtStakePerJuror_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  tokensAtStakePerJuror_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  tokensAtStakePerJuror_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  tokensAtStakePerJuror_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  tokensAtStakePerJuror_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  totalFeesForJurors?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalFeesForJurors_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalFeesForJurors_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalFeesForJurors_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  totalFeesForJurors_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalFeesForJurors_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalFeesForJurors_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalFeesForJurors_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
};

export enum Round_OrderBy {
  Dispute = "dispute",
  DisputeKit = "disputeKit",
  DisputeKitAddress = "disputeKit__address",
  DisputeKitDepthLevel = "disputeKit__depthLevel",
  DisputeKitId = "disputeKit__id",
  DisputeKitNeedsFreezing = "disputeKit__needsFreezing",
  DisputeCurrentRoundIndex = "dispute__currentRoundIndex",
  DisputeCurrentRuling = "dispute__currentRuling",
  DisputeId = "dispute__id",
  DisputeLastPeriodChange = "dispute__lastPeriodChange",
  DisputeOverridden = "dispute__overridden",
  DisputePeriod = "dispute__period",
  DisputeRuled = "dispute__ruled",
  DisputeTied = "dispute__tied",
  DrawnJurors = "drawnJurors",
  FeeToken = "feeToken",
  FeeTokenAccepted = "feeToken__accepted",
  FeeTokenId = "feeToken__id",
  FeeTokenRateDecimals = "feeToken__rateDecimals",
  FeeTokenRateInEth = "feeToken__rateInEth",
  FeeTokenTotalPaid = "feeToken__totalPaid",
  FeeTokenTotalPaidInEth = "feeToken__totalPaidInETH",
  Id = "id",
  NbVotes = "nbVotes",
  Penalties = "penalties",
  Repartitions = "repartitions",
  TokensAtStakePerJuror = "tokensAtStakePerJuror",
  TotalFeesForJurors = "totalFeesForJurors",
}

export type Subscription = {
  __typename?: "Subscription";
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  arbitrable?: Maybe<Arbitrable>;
  arbitrables: Array<Arbitrable>;
  classicContribution?: Maybe<ClassicContribution>;
  classicContributions: Array<ClassicContribution>;
  classicDispute?: Maybe<ClassicDispute>;
  classicDisputes: Array<ClassicDispute>;
  classicEvidence?: Maybe<ClassicEvidence>;
  classicEvidenceGroup?: Maybe<ClassicEvidenceGroup>;
  classicEvidenceGroups: Array<ClassicEvidenceGroup>;
  classicEvidences: Array<ClassicEvidence>;
  classicJustification?: Maybe<ClassicJustification>;
  classicJustifications: Array<ClassicJustification>;
  classicRound?: Maybe<ClassicRound>;
  classicRounds: Array<ClassicRound>;
  classicVote?: Maybe<ClassicVote>;
  classicVotes: Array<ClassicVote>;
  contribution?: Maybe<Contribution>;
  contributions: Array<Contribution>;
  counter?: Maybe<Counter>;
  counters: Array<Counter>;
  court?: Maybe<Court>;
  courts: Array<Court>;
  dispute?: Maybe<Dispute>;
  disputeKit?: Maybe<DisputeKit>;
  disputeKitDispute?: Maybe<DisputeKitDispute>;
  disputeKitDisputes: Array<DisputeKitDispute>;
  disputeKitRound?: Maybe<DisputeKitRound>;
  disputeKitRounds: Array<DisputeKitRound>;
  disputeKits: Array<DisputeKit>;
  disputeTemplate?: Maybe<DisputeTemplate>;
  disputeTemplates: Array<DisputeTemplate>;
  disputes: Array<Dispute>;
  draw?: Maybe<Draw>;
  draws: Array<Draw>;
  evidence?: Maybe<Evidence>;
  evidenceGroup?: Maybe<EvidenceGroup>;
  evidenceGroups: Array<EvidenceGroup>;
  evidences: Array<Evidence>;
  feeToken?: Maybe<FeeToken>;
  feeTokens: Array<FeeToken>;
  jurorTokensPerCourt?: Maybe<JurorTokensPerCourt>;
  jurorTokensPerCourts: Array<JurorTokensPerCourt>;
  penalties: Array<Penalty>;
  penalty?: Maybe<Penalty>;
  round?: Maybe<Round>;
  rounds: Array<Round>;
  tokenAndETHShift?: Maybe<TokenAndEthShift>;
  tokenAndETHShifts: Array<TokenAndEthShift>;
  user?: Maybe<User>;
  users: Array<User>;
  vote?: Maybe<Vote>;
  votes: Array<Vote>;
};

export type Subscription_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};

export type SubscriptionArbitrableArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionArbitrablesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Arbitrable_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Arbitrable_Filter>;
};

export type SubscriptionClassicContributionArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionClassicContributionsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ClassicContribution_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ClassicContribution_Filter>;
};

export type SubscriptionClassicDisputeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionClassicDisputesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ClassicDispute_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ClassicDispute_Filter>;
};

export type SubscriptionClassicEvidenceArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionClassicEvidenceGroupArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionClassicEvidenceGroupsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ClassicEvidenceGroup_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ClassicEvidenceGroup_Filter>;
};

export type SubscriptionClassicEvidencesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ClassicEvidence_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ClassicEvidence_Filter>;
};

export type SubscriptionClassicJustificationArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionClassicJustificationsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ClassicJustification_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ClassicJustification_Filter>;
};

export type SubscriptionClassicRoundArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionClassicRoundsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ClassicRound_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ClassicRound_Filter>;
};

export type SubscriptionClassicVoteArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionClassicVotesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ClassicVote_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ClassicVote_Filter>;
};

export type SubscriptionContributionArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionContributionsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Contribution_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Contribution_Filter>;
};

export type SubscriptionCounterArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionCountersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Counter_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Counter_Filter>;
};

export type SubscriptionCourtArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionCourtsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Court_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Court_Filter>;
};

export type SubscriptionDisputeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionDisputeKitArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionDisputeKitDisputeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionDisputeKitDisputesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<DisputeKitDispute_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DisputeKitDispute_Filter>;
};

export type SubscriptionDisputeKitRoundArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionDisputeKitRoundsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<DisputeKitRound_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DisputeKitRound_Filter>;
};

export type SubscriptionDisputeKitsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<DisputeKit_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DisputeKit_Filter>;
};

export type SubscriptionDisputeTemplateArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionDisputeTemplatesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<DisputeTemplate_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DisputeTemplate_Filter>;
};

export type SubscriptionDisputesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Dispute_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Dispute_Filter>;
};

export type SubscriptionDrawArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionDrawsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Draw_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Draw_Filter>;
};

export type SubscriptionEvidenceArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionEvidenceGroupArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionEvidenceGroupsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<EvidenceGroup_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<EvidenceGroup_Filter>;
};

export type SubscriptionEvidencesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Evidence_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Evidence_Filter>;
};

export type SubscriptionFeeTokenArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionFeeTokensArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<FeeToken_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<FeeToken_Filter>;
};

export type SubscriptionJurorTokensPerCourtArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionJurorTokensPerCourtsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<JurorTokensPerCourt_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<JurorTokensPerCourt_Filter>;
};

export type SubscriptionPenaltiesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Penalty_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Penalty_Filter>;
};

export type SubscriptionPenaltyArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionRoundArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionRoundsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Round_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Round_Filter>;
};

export type SubscriptionTokenAndEthShiftArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionTokenAndEthShiftsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<TokenAndEthShift_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<TokenAndEthShift_Filter>;
};

export type SubscriptionUserArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionUsersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<User_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<User_Filter>;
};

export type SubscriptionVoteArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"]["input"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionVotesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Vote_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Vote_Filter>;
};

export type TokenAndEthShift = {
  __typename?: "TokenAndETHShift";
  dispute: Dispute;
  ethAmount: Scalars["BigInt"]["output"];
  feeToken?: Maybe<FeeToken>;
  feeTokenAmount: Scalars["BigInt"]["output"];
  id: Scalars["ID"]["output"];
  isNativeCurrency: Scalars["Boolean"]["output"];
  juror: User;
  pnkAmount: Scalars["BigInt"]["output"];
};

export type TokenAndEthShift_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<TokenAndEthShift_Filter>>>;
  dispute?: InputMaybe<Scalars["String"]["input"]>;
  dispute_?: InputMaybe<Dispute_Filter>;
  dispute_contains?: InputMaybe<Scalars["String"]["input"]>;
  dispute_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  dispute_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  dispute_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  dispute_gt?: InputMaybe<Scalars["String"]["input"]>;
  dispute_gte?: InputMaybe<Scalars["String"]["input"]>;
  dispute_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  dispute_lt?: InputMaybe<Scalars["String"]["input"]>;
  dispute_lte?: InputMaybe<Scalars["String"]["input"]>;
  dispute_not?: InputMaybe<Scalars["String"]["input"]>;
  dispute_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  dispute_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  dispute_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  dispute_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  dispute_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  dispute_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  dispute_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  dispute_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  dispute_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  ethAmount?: InputMaybe<Scalars["BigInt"]["input"]>;
  ethAmount_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  ethAmount_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  ethAmount_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  ethAmount_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  ethAmount_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  ethAmount_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  ethAmount_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  feeToken?: InputMaybe<Scalars["String"]["input"]>;
  feeTokenAmount?: InputMaybe<Scalars["BigInt"]["input"]>;
  feeTokenAmount_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  feeTokenAmount_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  feeTokenAmount_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  feeTokenAmount_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  feeTokenAmount_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  feeTokenAmount_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  feeTokenAmount_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  feeToken_?: InputMaybe<FeeToken_Filter>;
  feeToken_contains?: InputMaybe<Scalars["String"]["input"]>;
  feeToken_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  feeToken_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  feeToken_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  feeToken_gt?: InputMaybe<Scalars["String"]["input"]>;
  feeToken_gte?: InputMaybe<Scalars["String"]["input"]>;
  feeToken_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  feeToken_lt?: InputMaybe<Scalars["String"]["input"]>;
  feeToken_lte?: InputMaybe<Scalars["String"]["input"]>;
  feeToken_not?: InputMaybe<Scalars["String"]["input"]>;
  feeToken_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  feeToken_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  feeToken_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  feeToken_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  feeToken_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  feeToken_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  feeToken_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  feeToken_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  feeToken_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  id_gt?: InputMaybe<Scalars["ID"]["input"]>;
  id_gte?: InputMaybe<Scalars["ID"]["input"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  id_lt?: InputMaybe<Scalars["ID"]["input"]>;
  id_lte?: InputMaybe<Scalars["ID"]["input"]>;
  id_not?: InputMaybe<Scalars["ID"]["input"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  isNativeCurrency?: InputMaybe<Scalars["Boolean"]["input"]>;
  isNativeCurrency_in?: InputMaybe<Array<Scalars["Boolean"]["input"]>>;
  isNativeCurrency_not?: InputMaybe<Scalars["Boolean"]["input"]>;
  isNativeCurrency_not_in?: InputMaybe<Array<Scalars["Boolean"]["input"]>>;
  juror?: InputMaybe<Scalars["String"]["input"]>;
  juror_?: InputMaybe<User_Filter>;
  juror_contains?: InputMaybe<Scalars["String"]["input"]>;
  juror_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  juror_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  juror_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  juror_gt?: InputMaybe<Scalars["String"]["input"]>;
  juror_gte?: InputMaybe<Scalars["String"]["input"]>;
  juror_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  juror_lt?: InputMaybe<Scalars["String"]["input"]>;
  juror_lte?: InputMaybe<Scalars["String"]["input"]>;
  juror_not?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  juror_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  juror_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  juror_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  or?: InputMaybe<Array<InputMaybe<TokenAndEthShift_Filter>>>;
  pnkAmount?: InputMaybe<Scalars["BigInt"]["input"]>;
  pnkAmount_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  pnkAmount_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  pnkAmount_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  pnkAmount_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  pnkAmount_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  pnkAmount_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  pnkAmount_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
};

export enum TokenAndEthShift_OrderBy {
  Dispute = "dispute",
  DisputeCurrentRoundIndex = "dispute__currentRoundIndex",
  DisputeCurrentRuling = "dispute__currentRuling",
  DisputeId = "dispute__id",
  DisputeLastPeriodChange = "dispute__lastPeriodChange",
  DisputeOverridden = "dispute__overridden",
  DisputePeriod = "dispute__period",
  DisputeRuled = "dispute__ruled",
  DisputeTied = "dispute__tied",
  EthAmount = "ethAmount",
  FeeToken = "feeToken",
  FeeTokenAmount = "feeTokenAmount",
  FeeTokenAccepted = "feeToken__accepted",
  FeeTokenId = "feeToken__id",
  FeeTokenRateDecimals = "feeToken__rateDecimals",
  FeeTokenRateInEth = "feeToken__rateInEth",
  FeeTokenTotalPaid = "feeToken__totalPaid",
  FeeTokenTotalPaidInEth = "feeToken__totalPaidInETH",
  Id = "id",
  IsNativeCurrency = "isNativeCurrency",
  Juror = "juror",
  JurorActiveDisputes = "juror__activeDisputes",
  JurorId = "juror__id",
  JurorTotalCoherent = "juror__totalCoherent",
  JurorTotalDelayed = "juror__totalDelayed",
  JurorTotalDisputes = "juror__totalDisputes",
  JurorTotalResolvedDisputes = "juror__totalResolvedDisputes",
  JurorTotalStake = "juror__totalStake",
  PnkAmount = "pnkAmount",
}

export type User = {
  __typename?: "User";
  activeDisputes: Scalars["BigInt"]["output"];
  contributions: Array<Contribution>;
  disputes: Array<Dispute>;
  draws: Array<Draw>;
  evidences: Array<Evidence>;
  id: Scalars["ID"]["output"];
  penalties: Array<Penalty>;
  resolvedDisputes: Array<Dispute>;
  shifts: Array<TokenAndEthShift>;
  tokens: Array<JurorTokensPerCourt>;
  totalCoherent: Scalars["BigInt"]["output"];
  totalDelayed: Scalars["BigInt"]["output"];
  totalDisputes: Scalars["BigInt"]["output"];
  totalResolvedDisputes: Scalars["BigInt"]["output"];
  totalStake: Scalars["BigInt"]["output"];
  votes: Array<Vote>;
};

export type UserContributionsArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Contribution_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  where?: InputMaybe<Contribution_Filter>;
};

export type UserDisputesArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Dispute_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  where?: InputMaybe<Dispute_Filter>;
};

export type UserDrawsArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Draw_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  where?: InputMaybe<Draw_Filter>;
};

export type UserEvidencesArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Evidence_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  where?: InputMaybe<Evidence_Filter>;
};

export type UserPenaltiesArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Penalty_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  where?: InputMaybe<Penalty_Filter>;
};

export type UserResolvedDisputesArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Dispute_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  where?: InputMaybe<Dispute_Filter>;
};

export type UserShiftsArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<TokenAndEthShift_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  where?: InputMaybe<TokenAndEthShift_Filter>;
};

export type UserTokensArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<JurorTokensPerCourt_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  where?: InputMaybe<JurorTokensPerCourt_Filter>;
};

export type UserVotesArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Vote_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  where?: InputMaybe<Vote_Filter>;
};

export type User_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  activeDisputes?: InputMaybe<Scalars["BigInt"]["input"]>;
  activeDisputes_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  activeDisputes_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  activeDisputes_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  activeDisputes_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  activeDisputes_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  activeDisputes_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  activeDisputes_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  and?: InputMaybe<Array<InputMaybe<User_Filter>>>;
  contributions_?: InputMaybe<Contribution_Filter>;
  disputes?: InputMaybe<Array<Scalars["String"]["input"]>>;
  disputes_?: InputMaybe<Dispute_Filter>;
  disputes_contains?: InputMaybe<Array<Scalars["String"]["input"]>>;
  disputes_contains_nocase?: InputMaybe<Array<Scalars["String"]["input"]>>;
  disputes_not?: InputMaybe<Array<Scalars["String"]["input"]>>;
  disputes_not_contains?: InputMaybe<Array<Scalars["String"]["input"]>>;
  disputes_not_contains_nocase?: InputMaybe<Array<Scalars["String"]["input"]>>;
  draws_?: InputMaybe<Draw_Filter>;
  evidences_?: InputMaybe<Evidence_Filter>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  id_gt?: InputMaybe<Scalars["ID"]["input"]>;
  id_gte?: InputMaybe<Scalars["ID"]["input"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  id_lt?: InputMaybe<Scalars["ID"]["input"]>;
  id_lte?: InputMaybe<Scalars["ID"]["input"]>;
  id_not?: InputMaybe<Scalars["ID"]["input"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  or?: InputMaybe<Array<InputMaybe<User_Filter>>>;
  penalties_?: InputMaybe<Penalty_Filter>;
  resolvedDisputes?: InputMaybe<Array<Scalars["String"]["input"]>>;
  resolvedDisputes_?: InputMaybe<Dispute_Filter>;
  resolvedDisputes_contains?: InputMaybe<Array<Scalars["String"]["input"]>>;
  resolvedDisputes_contains_nocase?: InputMaybe<Array<Scalars["String"]["input"]>>;
  resolvedDisputes_not?: InputMaybe<Array<Scalars["String"]["input"]>>;
  resolvedDisputes_not_contains?: InputMaybe<Array<Scalars["String"]["input"]>>;
  resolvedDisputes_not_contains_nocase?: InputMaybe<Array<Scalars["String"]["input"]>>;
  shifts_?: InputMaybe<TokenAndEthShift_Filter>;
  tokens_?: InputMaybe<JurorTokensPerCourt_Filter>;
  totalCoherent?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalCoherent_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalCoherent_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalCoherent_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  totalCoherent_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalCoherent_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalCoherent_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalCoherent_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  totalDelayed?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalDelayed_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalDelayed_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalDelayed_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  totalDelayed_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalDelayed_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalDelayed_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalDelayed_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  totalDisputes?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalDisputes_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalDisputes_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalDisputes_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  totalDisputes_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalDisputes_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalDisputes_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalDisputes_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  totalResolvedDisputes?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalResolvedDisputes_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalResolvedDisputes_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalResolvedDisputes_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  totalResolvedDisputes_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalResolvedDisputes_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalResolvedDisputes_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalResolvedDisputes_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  totalStake?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalStake_gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalStake_gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalStake_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  totalStake_lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalStake_lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalStake_not?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalStake_not_in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  votes_?: InputMaybe<Vote_Filter>;
};

export enum User_OrderBy {
  ActiveDisputes = "activeDisputes",
  Contributions = "contributions",
  Disputes = "disputes",
  Draws = "draws",
  Evidences = "evidences",
  Id = "id",
  Penalties = "penalties",
  ResolvedDisputes = "resolvedDisputes",
  Shifts = "shifts",
  Tokens = "tokens",
  TotalCoherent = "totalCoherent",
  TotalDelayed = "totalDelayed",
  TotalDisputes = "totalDisputes",
  TotalResolvedDisputes = "totalResolvedDisputes",
  TotalStake = "totalStake",
  Votes = "votes",
}

export type Vote = {
  coreDispute: Dispute;
  draw?: Maybe<Draw>;
  id: Scalars["ID"]["output"];
  juror: User;
  localRound: DisputeKitRound;
};

export type Vote_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Vote_Filter>>>;
  coreDispute?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_?: InputMaybe<Dispute_Filter>;
  coreDispute_contains?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_gt?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_gte?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  coreDispute_lt?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_lte?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  coreDispute_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  coreDispute_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  draw?: InputMaybe<Scalars["String"]["input"]>;
  draw_?: InputMaybe<Draw_Filter>;
  draw_contains?: InputMaybe<Scalars["String"]["input"]>;
  draw_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  draw_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  draw_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  draw_gt?: InputMaybe<Scalars["String"]["input"]>;
  draw_gte?: InputMaybe<Scalars["String"]["input"]>;
  draw_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  draw_lt?: InputMaybe<Scalars["String"]["input"]>;
  draw_lte?: InputMaybe<Scalars["String"]["input"]>;
  draw_not?: InputMaybe<Scalars["String"]["input"]>;
  draw_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  draw_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  draw_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  draw_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  draw_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  draw_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  draw_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  draw_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  draw_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  id_gt?: InputMaybe<Scalars["ID"]["input"]>;
  id_gte?: InputMaybe<Scalars["ID"]["input"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  id_lt?: InputMaybe<Scalars["ID"]["input"]>;
  id_lte?: InputMaybe<Scalars["ID"]["input"]>;
  id_not?: InputMaybe<Scalars["ID"]["input"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  juror?: InputMaybe<Scalars["String"]["input"]>;
  juror_?: InputMaybe<User_Filter>;
  juror_contains?: InputMaybe<Scalars["String"]["input"]>;
  juror_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  juror_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  juror_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  juror_gt?: InputMaybe<Scalars["String"]["input"]>;
  juror_gte?: InputMaybe<Scalars["String"]["input"]>;
  juror_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  juror_lt?: InputMaybe<Scalars["String"]["input"]>;
  juror_lte?: InputMaybe<Scalars["String"]["input"]>;
  juror_not?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  juror_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  juror_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  juror_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  juror_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  localRound?: InputMaybe<Scalars["String"]["input"]>;
  localRound_?: InputMaybe<DisputeKitRound_Filter>;
  localRound_contains?: InputMaybe<Scalars["String"]["input"]>;
  localRound_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  localRound_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  localRound_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  localRound_gt?: InputMaybe<Scalars["String"]["input"]>;
  localRound_gte?: InputMaybe<Scalars["String"]["input"]>;
  localRound_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  localRound_lt?: InputMaybe<Scalars["String"]["input"]>;
  localRound_lte?: InputMaybe<Scalars["String"]["input"]>;
  localRound_not?: InputMaybe<Scalars["String"]["input"]>;
  localRound_not_contains?: InputMaybe<Scalars["String"]["input"]>;
  localRound_not_contains_nocase?: InputMaybe<Scalars["String"]["input"]>;
  localRound_not_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  localRound_not_ends_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  localRound_not_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  localRound_not_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  localRound_not_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  localRound_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  localRound_starts_with_nocase?: InputMaybe<Scalars["String"]["input"]>;
  or?: InputMaybe<Array<InputMaybe<Vote_Filter>>>;
};

export enum Vote_OrderBy {
  CoreDispute = "coreDispute",
  CoreDisputeCurrentRoundIndex = "coreDispute__currentRoundIndex",
  CoreDisputeCurrentRuling = "coreDispute__currentRuling",
  CoreDisputeId = "coreDispute__id",
  CoreDisputeLastPeriodChange = "coreDispute__lastPeriodChange",
  CoreDisputeOverridden = "coreDispute__overridden",
  CoreDisputePeriod = "coreDispute__period",
  CoreDisputeRuled = "coreDispute__ruled",
  CoreDisputeTied = "coreDispute__tied",
  Draw = "draw",
  DrawId = "draw__id",
  DrawVoteId = "draw__voteID",
  Id = "id",
  Juror = "juror",
  JurorActiveDisputes = "juror__activeDisputes",
  JurorId = "juror__id",
  JurorTotalCoherent = "juror__totalCoherent",
  JurorTotalDelayed = "juror__totalDelayed",
  JurorTotalDisputes = "juror__totalDisputes",
  JurorTotalResolvedDisputes = "juror__totalResolvedDisputes",
  JurorTotalStake = "juror__totalStake",
  LocalRound = "localRound",
  LocalRoundId = "localRound__id",
}

export type _Block_ = {
  __typename?: "_Block_";
  /** The hash of the block */
  hash?: Maybe<Scalars["Bytes"]["output"]>;
  /** The block number */
  number: Scalars["Int"]["output"];
  /** Integer representation of the timestamp stored in blocks for the chain */
  timestamp?: Maybe<Scalars["Int"]["output"]>;
};

/** The type for the top-level _meta field */
export type _Meta_ = {
  __typename?: "_Meta_";
  /**
   * Information about a specific subgraph block. The hash of the block
   * will be null if the _meta field has a block constraint that asks for
   * a block number. It will be filled if the _meta field has no block constraint
   * and therefore asks for the latest  block
   *
   */
  block: _Block_;
  /** The deployment ID */
  deployment: Scalars["String"]["output"];
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars["Boolean"]["output"];
};

export enum _SubgraphErrorPolicy_ {
  /** Data will be returned even if the subgraph has indexing errors */
  Allow = "allow",
  /** If the subgraph has indexing errors, data will be omitted. The default. */
  Deny = "deny",
}

export type CasesPageQueryVariables = Exact<{
  skip?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type CasesPageQuery = {
  __typename?: "Query";
  disputes: Array<{
    __typename?: "Dispute";
    id: string;
    period: Period;
    lastPeriodChange: any;
    arbitrated: { __typename?: "Arbitrable"; id: string };
    court: { __typename?: "Court"; id: string; policy?: string | null; feeForJuror: any; timesPerPeriod: Array<any> };
  }>;
  counter?: { __typename?: "Counter"; cases: any } | null;
};

export type ClassicAppealQueryVariables = Exact<{
  disputeID: Scalars["ID"]["input"];
}>;

export type ClassicAppealQuery = {
  __typename?: "Query";
  dispute?: {
    __typename?: "Dispute";
    lastPeriodChange: any;
    court: { __typename?: "Court"; id: string; timesPerPeriod: Array<any> };
    arbitrated: { __typename?: "Arbitrable"; id: string };
    disputeKitDispute?: {
      __typename?: "ClassicDispute";
      id: string;
      currentLocalRoundIndex: any;
      localRounds: Array<{
        __typename?: "ClassicRound";
        winningChoice: any;
        paidFees: Array<any>;
        fundedChoices: Array<any>;
      }>;
    } | null;
  } | null;
};

export type CourtDetailsQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type CourtDetailsQuery = {
  __typename?: "Query";
  court?: {
    __typename?: "Court";
    policy?: string | null;
    minStake: any;
    alpha: any;
    numberDisputes: any;
    numberStakedJurors: any;
    stake: any;
    paidETH: any;
    paidPNK: any;
  } | null;
};

export type CourtPolicyUriQueryVariables = Exact<{
  courtID: Scalars["ID"]["input"];
}>;

export type CourtPolicyUriQuery = {
  __typename?: "Query";
  court?: { __typename?: "Court"; policy?: string | null } | null;
};

export type CourtTreeQueryVariables = Exact<{ [key: string]: never }>;

export type CourtTreeQuery = {
  __typename?: "Query";
  court?: {
    __typename?: "Court";
    name?: string | null;
    id: string;
    children: Array<{
      __typename?: "Court";
      name?: string | null;
      id: string;
      children: Array<{
        __typename?: "Court";
        name?: string | null;
        id: string;
        children: Array<{
          __typename?: "Court";
          name?: string | null;
          id: string;
          children: Array<{
            __typename?: "Court";
            name?: string | null;
            id: string;
            children: Array<{ __typename?: "Court"; name?: string | null; id: string }>;
          }>;
        }>;
      }>;
    }>;
  } | null;
};

export type DisputeDetailsQueryVariables = Exact<{
  disputeID: Scalars["ID"]["input"];
}>;

export type DisputeDetailsQuery = {
  __typename?: "Query";
  dispute?: {
    __typename?: "Dispute";
    period: Period;
    ruled: boolean;
    lastPeriodChange: any;
    currentRuling: any;
    overridden: boolean;
    tied: boolean;
    currentRoundIndex: any;
    court: { __typename?: "Court"; id: string; timesPerPeriod: Array<any>; hiddenVotes: boolean; feeForJuror: any };
    arbitrated: { __typename?: "Arbitrable"; id: string };
    currentRound: { __typename?: "Round"; id: string };
  } | null;
};

export type DisputeTemplateQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DisputeTemplateQuery = {
  __typename?: "Query";
  disputeTemplate?: {
    __typename?: "DisputeTemplate";
    id: string;
    templateTag?: string | null;
    templateData: string;
    templateDataMappings: string;
  } | null;
};

export type DrawQueryVariables = Exact<{
  address?: InputMaybe<Scalars["String"]["input"]>;
  disputeID?: InputMaybe<Scalars["String"]["input"]>;
  roundID?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type DrawQuery = { __typename?: "Query"; draws: Array<{ __typename?: "Draw"; voteID: any }> };

export type EvidencesQueryVariables = Exact<{
  evidenceGroupID?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type EvidencesQuery = {
  __typename?: "Query";
  evidences: Array<{
    __typename?: "ClassicEvidence";
    id: string;
    evidence: string;
    sender: { __typename?: "User"; id: string };
  }>;
};

export type HomePageQueryVariables = Exact<{
  timeframe?: InputMaybe<Scalars["ID"]["input"]>;
}>;

export type HomePageQuery = {
  __typename?: "Query";
  disputes: Array<{ __typename?: "Dispute"; id: string }>;
  counters: Array<{
    __typename?: "Counter";
    id: string;
    stakedPNK: any;
    paidETH: any;
    redistributedPNK: any;
    activeJurors: any;
    cases: any;
  }>;
};

export type UserQueryVariables = Exact<{
  address: Scalars["ID"]["input"];
}>;

export type UserQuery = {
  __typename?: "Query";
  user?: {
    __typename?: "User";
    totalDisputes: any;
    totalResolvedDisputes: any;
    totalCoherent: any;
    tokens: Array<{
      __typename?: "JurorTokensPerCourt";
      court: { __typename?: "Court"; id: string; name?: string | null };
    }>;
    shifts: Array<{ __typename?: "TokenAndETHShift"; pnkAmount: any; ethAmount: any }>;
  } | null;
};

export type VotingHistoryQueryVariables = Exact<{
  disputeID: Scalars["ID"]["input"];
}>;

export type VotingHistoryQuery = {
  __typename?: "Query";
  dispute?: {
    __typename?: "Dispute";
    id: string;
    rounds: Array<{ __typename?: "Round"; nbVotes: any }>;
    disputeKitDispute?: {
      __typename?: "ClassicDispute";
      localRounds: Array<{
        __typename?: "ClassicRound";
        winningChoice: any;
        totalVoted: any;
        justifications?: Array<{
          __typename?: "ClassicJustification";
          id: string;
          choice: any;
          reference: string;
          juror: { __typename?: "User"; id: string };
        }> | null;
      }>;
    } | null;
  } | null;
};

export const CasesPageDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "CasesPage" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "skip" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "disputes" },
            arguments: [
              { kind: "Argument", name: { kind: "Name", value: "first" }, value: { kind: "IntValue", value: "3" } },
              {
                kind: "Argument",
                name: { kind: "Name", value: "skip" },
                value: { kind: "Variable", name: { kind: "Name", value: "skip" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "orderBy" },
                value: { kind: "EnumValue", value: "lastPeriodChange" },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "orderDirection" },
                value: { kind: "EnumValue", value: "desc" },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "arbitrated" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "court" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "policy" } },
                      { kind: "Field", name: { kind: "Name", value: "feeForJuror" } },
                      { kind: "Field", name: { kind: "Name", value: "timesPerPeriod" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "period" } },
                { kind: "Field", name: { kind: "Name", value: "lastPeriodChange" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "counter" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "StringValue", value: "0", block: false },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "cases" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CasesPageQuery, CasesPageQueryVariables>;
export const ClassicAppealDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ClassicAppeal" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "disputeID" } },
          type: { kind: "NonNullType", type: { kind: "NamedType", name: { kind: "Name", value: "ID" } } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "dispute" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "disputeID" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "court" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "timesPerPeriod" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "arbitrated" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "lastPeriodChange" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "disputeKitDispute" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "currentLocalRoundIndex" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "localRounds" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "InlineFragment",
                              typeCondition: { kind: "NamedType", name: { kind: "Name", value: "ClassicRound" } },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "winningChoice" } },
                                  { kind: "Field", name: { kind: "Name", value: "paidFees" } },
                                  { kind: "Field", name: { kind: "Name", value: "fundedChoices" } },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ClassicAppealQuery, ClassicAppealQueryVariables>;
export const CourtDetailsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "CourtDetails" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: { kind: "NonNullType", type: { kind: "NamedType", name: { kind: "Name", value: "ID" } } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "court" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "policy" } },
                { kind: "Field", name: { kind: "Name", value: "minStake" } },
                { kind: "Field", name: { kind: "Name", value: "alpha" } },
                { kind: "Field", name: { kind: "Name", value: "numberDisputes" } },
                { kind: "Field", name: { kind: "Name", value: "numberStakedJurors" } },
                { kind: "Field", name: { kind: "Name", value: "stake" } },
                { kind: "Field", name: { kind: "Name", value: "paidETH" } },
                { kind: "Field", name: { kind: "Name", value: "paidPNK" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CourtDetailsQuery, CourtDetailsQueryVariables>;
export const CourtPolicyUriDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "CourtPolicyURI" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "courtID" } },
          type: { kind: "NonNullType", type: { kind: "NamedType", name: { kind: "Name", value: "ID" } } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "court" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "courtID" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "policy" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CourtPolicyUriQuery, CourtPolicyUriQueryVariables>;
export const CourtTreeDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "CourtTree" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "court" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "StringValue", value: "1", block: false },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "children" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "orderBy" },
                      value: { kind: "EnumValue", value: "name" },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "children" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "children" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "name" } },
                                  { kind: "Field", name: { kind: "Name", value: "id" } },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "children" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        { kind: "Field", name: { kind: "Name", value: "name" } },
                                        { kind: "Field", name: { kind: "Name", value: "id" } },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "children" },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              { kind: "Field", name: { kind: "Name", value: "name" } },
                                              { kind: "Field", name: { kind: "Name", value: "id" } },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CourtTreeQuery, CourtTreeQueryVariables>;
export const DisputeDetailsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "DisputeDetails" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "disputeID" } },
          type: { kind: "NonNullType", type: { kind: "NamedType", name: { kind: "Name", value: "ID" } } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "dispute" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "disputeID" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "court" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "timesPerPeriod" } },
                      { kind: "Field", name: { kind: "Name", value: "hiddenVotes" } },
                      { kind: "Field", name: { kind: "Name", value: "feeForJuror" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "arbitrated" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "period" } },
                { kind: "Field", name: { kind: "Name", value: "ruled" } },
                { kind: "Field", name: { kind: "Name", value: "lastPeriodChange" } },
                { kind: "Field", name: { kind: "Name", value: "currentRuling" } },
                { kind: "Field", name: { kind: "Name", value: "overridden" } },
                { kind: "Field", name: { kind: "Name", value: "tied" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "currentRound" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "currentRoundIndex" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DisputeDetailsQuery, DisputeDetailsQueryVariables>;
export const DisputeTemplateDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "DisputeTemplate" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: { kind: "NonNullType", type: { kind: "NamedType", name: { kind: "Name", value: "ID" } } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "disputeTemplate" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "templateTag" } },
                { kind: "Field", name: { kind: "Name", value: "templateData" } },
                { kind: "Field", name: { kind: "Name", value: "templateDataMappings" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DisputeTemplateQuery, DisputeTemplateQueryVariables>;
export const DrawDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Draw" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "address" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "disputeID" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "roundID" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "draws" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "where" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "dispute" },
                      value: { kind: "Variable", name: { kind: "Name", value: "disputeID" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "juror" },
                      value: { kind: "Variable", name: { kind: "Name", value: "address" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "round" },
                      value: { kind: "Variable", name: { kind: "Name", value: "roundID" } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "voteID" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DrawQuery, DrawQueryVariables>;
export const EvidencesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Evidences" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "evidenceGroupID" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "evidences" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "where" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "evidenceGroup" },
                      value: { kind: "Variable", name: { kind: "Name", value: "evidenceGroupID" } },
                    },
                  ],
                },
              },
              { kind: "Argument", name: { kind: "Name", value: "orderBy" }, value: { kind: "EnumValue", value: "id" } },
              {
                kind: "Argument",
                name: { kind: "Name", value: "orderDirection" },
                value: { kind: "EnumValue", value: "asc" },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "evidence" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "sender" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<EvidencesQuery, EvidencesQueryVariables>;
export const HomePageDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "HomePage" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "timeframe" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "disputes" },
            arguments: [
              { kind: "Argument", name: { kind: "Name", value: "first" }, value: { kind: "IntValue", value: "3" } },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "counters" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "where" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "id_gt" },
                      value: { kind: "Variable", name: { kind: "Name", value: "timeframe" } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "stakedPNK" } },
                { kind: "Field", name: { kind: "Name", value: "paidETH" } },
                { kind: "Field", name: { kind: "Name", value: "redistributedPNK" } },
                { kind: "Field", name: { kind: "Name", value: "activeJurors" } },
                { kind: "Field", name: { kind: "Name", value: "cases" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<HomePageQuery, HomePageQueryVariables>;
export const UserDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "User" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "address" } },
          type: { kind: "NonNullType", type: { kind: "NamedType", name: { kind: "Name", value: "ID" } } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "user" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "address" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "totalDisputes" } },
                { kind: "Field", name: { kind: "Name", value: "totalResolvedDisputes" } },
                { kind: "Field", name: { kind: "Name", value: "totalCoherent" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "tokens" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "court" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "shifts" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "pnkAmount" } },
                      { kind: "Field", name: { kind: "Name", value: "ethAmount" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UserQuery, UserQueryVariables>;
export const VotingHistoryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "VotingHistory" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "disputeID" } },
          type: { kind: "NonNullType", type: { kind: "NamedType", name: { kind: "Name", value: "ID" } } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "dispute" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "disputeID" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "rounds" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "nbVotes" } }],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "disputeKitDispute" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "localRounds" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "InlineFragment",
                              typeCondition: { kind: "NamedType", name: { kind: "Name", value: "ClassicRound" } },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "winningChoice" } },
                                  { kind: "Field", name: { kind: "Name", value: "totalVoted" } },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "justifications" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        { kind: "Field", name: { kind: "Name", value: "id" } },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "juror" },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
                                          },
                                        },
                                        { kind: "Field", name: { kind: "Name", value: "choice" } },
                                        { kind: "Field", name: { kind: "Name", value: "reference" } },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<VotingHistoryQuery, VotingHistoryQueryVariables>;
