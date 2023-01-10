export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  BigDecimal: any;
  BigInt: any;
  Bytes: any;
};

export type Arbitrated = {
  __typename?: "Arbitrated";
  disputes: Array<Dispute>;
  id: Scalars["ID"];
  totalDisputes: Scalars["BigInt"];
};

export type ArbitratedDisputesArgs = {
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Dispute_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  where?: InputMaybe<Dispute_Filter>;
};

export type Arbitrated_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  disputes_?: InputMaybe<Dispute_Filter>;
  id?: InputMaybe<Scalars["ID"]>;
  id_gt?: InputMaybe<Scalars["ID"]>;
  id_gte?: InputMaybe<Scalars["ID"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]>>;
  id_lt?: InputMaybe<Scalars["ID"]>;
  id_lte?: InputMaybe<Scalars["ID"]>;
  id_not?: InputMaybe<Scalars["ID"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]>>;
  totalDisputes?: InputMaybe<Scalars["BigInt"]>;
  totalDisputes_gt?: InputMaybe<Scalars["BigInt"]>;
  totalDisputes_gte?: InputMaybe<Scalars["BigInt"]>;
  totalDisputes_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  totalDisputes_lt?: InputMaybe<Scalars["BigInt"]>;
  totalDisputes_lte?: InputMaybe<Scalars["BigInt"]>;
  totalDisputes_not?: InputMaybe<Scalars["BigInt"]>;
  totalDisputes_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
};

export enum Arbitrated_OrderBy {
  Disputes = "disputes",
  Id = "id",
  TotalDisputes = "totalDisputes",
}

export type BlockChangedFilter = {
  number_gte: Scalars["Int"];
};

export type Block_Height = {
  hash?: InputMaybe<Scalars["Bytes"]>;
  number?: InputMaybe<Scalars["Int"]>;
  number_gte?: InputMaybe<Scalars["Int"]>;
};

export type ClassicContribution = Contribution & {
  __typename?: "ClassicContribution";
  amount: Scalars["BigInt"];
  choice: Scalars["BigInt"];
  contributor: User;
  coreDispute: Dispute;
  id: Scalars["ID"];
  localRound: ClassicRound;
  rewardWithdrawn: Scalars["Boolean"];
};

export type ClassicContribution_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars["BigInt"]>;
  amount_gt?: InputMaybe<Scalars["BigInt"]>;
  amount_gte?: InputMaybe<Scalars["BigInt"]>;
  amount_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  amount_lt?: InputMaybe<Scalars["BigInt"]>;
  amount_lte?: InputMaybe<Scalars["BigInt"]>;
  amount_not?: InputMaybe<Scalars["BigInt"]>;
  amount_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  choice?: InputMaybe<Scalars["BigInt"]>;
  choice_gt?: InputMaybe<Scalars["BigInt"]>;
  choice_gte?: InputMaybe<Scalars["BigInt"]>;
  choice_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  choice_lt?: InputMaybe<Scalars["BigInt"]>;
  choice_lte?: InputMaybe<Scalars["BigInt"]>;
  choice_not?: InputMaybe<Scalars["BigInt"]>;
  choice_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  contributor?: InputMaybe<Scalars["String"]>;
  contributor_?: InputMaybe<User_Filter>;
  contributor_contains?: InputMaybe<Scalars["String"]>;
  contributor_contains_nocase?: InputMaybe<Scalars["String"]>;
  contributor_ends_with?: InputMaybe<Scalars["String"]>;
  contributor_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  contributor_gt?: InputMaybe<Scalars["String"]>;
  contributor_gte?: InputMaybe<Scalars["String"]>;
  contributor_in?: InputMaybe<Array<Scalars["String"]>>;
  contributor_lt?: InputMaybe<Scalars["String"]>;
  contributor_lte?: InputMaybe<Scalars["String"]>;
  contributor_not?: InputMaybe<Scalars["String"]>;
  contributor_not_contains?: InputMaybe<Scalars["String"]>;
  contributor_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  contributor_not_ends_with?: InputMaybe<Scalars["String"]>;
  contributor_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  contributor_not_in?: InputMaybe<Array<Scalars["String"]>>;
  contributor_not_starts_with?: InputMaybe<Scalars["String"]>;
  contributor_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  contributor_starts_with?: InputMaybe<Scalars["String"]>;
  contributor_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  coreDispute?: InputMaybe<Scalars["String"]>;
  coreDispute_?: InputMaybe<Dispute_Filter>;
  coreDispute_contains?: InputMaybe<Scalars["String"]>;
  coreDispute_contains_nocase?: InputMaybe<Scalars["String"]>;
  coreDispute_ends_with?: InputMaybe<Scalars["String"]>;
  coreDispute_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  coreDispute_gt?: InputMaybe<Scalars["String"]>;
  coreDispute_gte?: InputMaybe<Scalars["String"]>;
  coreDispute_in?: InputMaybe<Array<Scalars["String"]>>;
  coreDispute_lt?: InputMaybe<Scalars["String"]>;
  coreDispute_lte?: InputMaybe<Scalars["String"]>;
  coreDispute_not?: InputMaybe<Scalars["String"]>;
  coreDispute_not_contains?: InputMaybe<Scalars["String"]>;
  coreDispute_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  coreDispute_not_ends_with?: InputMaybe<Scalars["String"]>;
  coreDispute_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  coreDispute_not_in?: InputMaybe<Array<Scalars["String"]>>;
  coreDispute_not_starts_with?: InputMaybe<Scalars["String"]>;
  coreDispute_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  coreDispute_starts_with?: InputMaybe<Scalars["String"]>;
  coreDispute_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  id?: InputMaybe<Scalars["ID"]>;
  id_gt?: InputMaybe<Scalars["ID"]>;
  id_gte?: InputMaybe<Scalars["ID"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]>>;
  id_lt?: InputMaybe<Scalars["ID"]>;
  id_lte?: InputMaybe<Scalars["ID"]>;
  id_not?: InputMaybe<Scalars["ID"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]>>;
  localRound?: InputMaybe<Scalars["String"]>;
  localRound_?: InputMaybe<ClassicRound_Filter>;
  localRound_contains?: InputMaybe<Scalars["String"]>;
  localRound_contains_nocase?: InputMaybe<Scalars["String"]>;
  localRound_ends_with?: InputMaybe<Scalars["String"]>;
  localRound_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  localRound_gt?: InputMaybe<Scalars["String"]>;
  localRound_gte?: InputMaybe<Scalars["String"]>;
  localRound_in?: InputMaybe<Array<Scalars["String"]>>;
  localRound_lt?: InputMaybe<Scalars["String"]>;
  localRound_lte?: InputMaybe<Scalars["String"]>;
  localRound_not?: InputMaybe<Scalars["String"]>;
  localRound_not_contains?: InputMaybe<Scalars["String"]>;
  localRound_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  localRound_not_ends_with?: InputMaybe<Scalars["String"]>;
  localRound_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  localRound_not_in?: InputMaybe<Array<Scalars["String"]>>;
  localRound_not_starts_with?: InputMaybe<Scalars["String"]>;
  localRound_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  localRound_starts_with?: InputMaybe<Scalars["String"]>;
  localRound_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  rewardWithdrawn?: InputMaybe<Scalars["Boolean"]>;
  rewardWithdrawn_in?: InputMaybe<Array<Scalars["Boolean"]>>;
  rewardWithdrawn_not?: InputMaybe<Scalars["Boolean"]>;
  rewardWithdrawn_not_in?: InputMaybe<Array<Scalars["Boolean"]>>;
};

export enum ClassicContribution_OrderBy {
  Amount = "amount",
  Choice = "choice",
  Contributor = "contributor",
  CoreDispute = "coreDispute",
  Id = "id",
  LocalRound = "localRound",
  RewardWithdrawn = "rewardWithdrawn",
}

export type ClassicDispute = DisputeKitDispute & {
  __typename?: "ClassicDispute";
  coreDispute: Dispute;
  currentLocalRoundIndex: Scalars["BigInt"];
  extraData: Scalars["Bytes"];
  id: Scalars["ID"];
  jumped: Scalars["Boolean"];
  localRounds: Array<DisputeKitRound>;
  numberOfChoices: Scalars["BigInt"];
};

export type ClassicDisputeLocalRoundsArgs = {
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<DisputeKitRound_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  where?: InputMaybe<DisputeKitRound_Filter>;
};

export type ClassicDispute_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  coreDispute?: InputMaybe<Scalars["String"]>;
  coreDispute_?: InputMaybe<Dispute_Filter>;
  coreDispute_contains?: InputMaybe<Scalars["String"]>;
  coreDispute_contains_nocase?: InputMaybe<Scalars["String"]>;
  coreDispute_ends_with?: InputMaybe<Scalars["String"]>;
  coreDispute_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  coreDispute_gt?: InputMaybe<Scalars["String"]>;
  coreDispute_gte?: InputMaybe<Scalars["String"]>;
  coreDispute_in?: InputMaybe<Array<Scalars["String"]>>;
  coreDispute_lt?: InputMaybe<Scalars["String"]>;
  coreDispute_lte?: InputMaybe<Scalars["String"]>;
  coreDispute_not?: InputMaybe<Scalars["String"]>;
  coreDispute_not_contains?: InputMaybe<Scalars["String"]>;
  coreDispute_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  coreDispute_not_ends_with?: InputMaybe<Scalars["String"]>;
  coreDispute_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  coreDispute_not_in?: InputMaybe<Array<Scalars["String"]>>;
  coreDispute_not_starts_with?: InputMaybe<Scalars["String"]>;
  coreDispute_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  coreDispute_starts_with?: InputMaybe<Scalars["String"]>;
  coreDispute_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  currentLocalRoundIndex?: InputMaybe<Scalars["BigInt"]>;
  currentLocalRoundIndex_gt?: InputMaybe<Scalars["BigInt"]>;
  currentLocalRoundIndex_gte?: InputMaybe<Scalars["BigInt"]>;
  currentLocalRoundIndex_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  currentLocalRoundIndex_lt?: InputMaybe<Scalars["BigInt"]>;
  currentLocalRoundIndex_lte?: InputMaybe<Scalars["BigInt"]>;
  currentLocalRoundIndex_not?: InputMaybe<Scalars["BigInt"]>;
  currentLocalRoundIndex_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  extraData?: InputMaybe<Scalars["Bytes"]>;
  extraData_contains?: InputMaybe<Scalars["Bytes"]>;
  extraData_in?: InputMaybe<Array<Scalars["Bytes"]>>;
  extraData_not?: InputMaybe<Scalars["Bytes"]>;
  extraData_not_contains?: InputMaybe<Scalars["Bytes"]>;
  extraData_not_in?: InputMaybe<Array<Scalars["Bytes"]>>;
  id?: InputMaybe<Scalars["ID"]>;
  id_gt?: InputMaybe<Scalars["ID"]>;
  id_gte?: InputMaybe<Scalars["ID"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]>>;
  id_lt?: InputMaybe<Scalars["ID"]>;
  id_lte?: InputMaybe<Scalars["ID"]>;
  id_not?: InputMaybe<Scalars["ID"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]>>;
  jumped?: InputMaybe<Scalars["Boolean"]>;
  jumped_in?: InputMaybe<Array<Scalars["Boolean"]>>;
  jumped_not?: InputMaybe<Scalars["Boolean"]>;
  jumped_not_in?: InputMaybe<Array<Scalars["Boolean"]>>;
  localRounds_?: InputMaybe<DisputeKitRound_Filter>;
  numberOfChoices?: InputMaybe<Scalars["BigInt"]>;
  numberOfChoices_gt?: InputMaybe<Scalars["BigInt"]>;
  numberOfChoices_gte?: InputMaybe<Scalars["BigInt"]>;
  numberOfChoices_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  numberOfChoices_lt?: InputMaybe<Scalars["BigInt"]>;
  numberOfChoices_lte?: InputMaybe<Scalars["BigInt"]>;
  numberOfChoices_not?: InputMaybe<Scalars["BigInt"]>;
  numberOfChoices_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
};

export enum ClassicDispute_OrderBy {
  CoreDispute = "coreDispute",
  CurrentLocalRoundIndex = "currentLocalRoundIndex",
  ExtraData = "extraData",
  Id = "id",
  Jumped = "jumped",
  LocalRounds = "localRounds",
  NumberOfChoices = "numberOfChoices",
}

export type ClassicEvidence = Evidence & {
  __typename?: "ClassicEvidence";
  evidence: Scalars["String"];
  evidenceGroup: EvidenceGroup;
  id: Scalars["ID"];
  sender: User;
};

export type ClassicEvidenceGroup = EvidenceGroup & {
  __typename?: "ClassicEvidenceGroup";
  evidences: Array<Evidence>;
  id: Scalars["ID"];
  nextEvidenceIndex: Scalars["BigInt"];
};

export type ClassicEvidenceGroupEvidencesArgs = {
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Evidence_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  where?: InputMaybe<Evidence_Filter>;
};

export type ClassicEvidenceGroup_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  evidences_?: InputMaybe<Evidence_Filter>;
  id?: InputMaybe<Scalars["ID"]>;
  id_gt?: InputMaybe<Scalars["ID"]>;
  id_gte?: InputMaybe<Scalars["ID"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]>>;
  id_lt?: InputMaybe<Scalars["ID"]>;
  id_lte?: InputMaybe<Scalars["ID"]>;
  id_not?: InputMaybe<Scalars["ID"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]>>;
  nextEvidenceIndex?: InputMaybe<Scalars["BigInt"]>;
  nextEvidenceIndex_gt?: InputMaybe<Scalars["BigInt"]>;
  nextEvidenceIndex_gte?: InputMaybe<Scalars["BigInt"]>;
  nextEvidenceIndex_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  nextEvidenceIndex_lt?: InputMaybe<Scalars["BigInt"]>;
  nextEvidenceIndex_lte?: InputMaybe<Scalars["BigInt"]>;
  nextEvidenceIndex_not?: InputMaybe<Scalars["BigInt"]>;
  nextEvidenceIndex_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
};

export enum ClassicEvidenceGroup_OrderBy {
  Evidences = "evidences",
  Id = "id",
  NextEvidenceIndex = "nextEvidenceIndex",
}

export type ClassicEvidence_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  evidence?: InputMaybe<Scalars["String"]>;
  evidenceGroup?: InputMaybe<Scalars["String"]>;
  evidenceGroup_?: InputMaybe<EvidenceGroup_Filter>;
  evidenceGroup_contains?: InputMaybe<Scalars["String"]>;
  evidenceGroup_contains_nocase?: InputMaybe<Scalars["String"]>;
  evidenceGroup_ends_with?: InputMaybe<Scalars["String"]>;
  evidenceGroup_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  evidenceGroup_gt?: InputMaybe<Scalars["String"]>;
  evidenceGroup_gte?: InputMaybe<Scalars["String"]>;
  evidenceGroup_in?: InputMaybe<Array<Scalars["String"]>>;
  evidenceGroup_lt?: InputMaybe<Scalars["String"]>;
  evidenceGroup_lte?: InputMaybe<Scalars["String"]>;
  evidenceGroup_not?: InputMaybe<Scalars["String"]>;
  evidenceGroup_not_contains?: InputMaybe<Scalars["String"]>;
  evidenceGroup_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  evidenceGroup_not_ends_with?: InputMaybe<Scalars["String"]>;
  evidenceGroup_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  evidenceGroup_not_in?: InputMaybe<Array<Scalars["String"]>>;
  evidenceGroup_not_starts_with?: InputMaybe<Scalars["String"]>;
  evidenceGroup_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  evidenceGroup_starts_with?: InputMaybe<Scalars["String"]>;
  evidenceGroup_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  evidence_contains?: InputMaybe<Scalars["String"]>;
  evidence_contains_nocase?: InputMaybe<Scalars["String"]>;
  evidence_ends_with?: InputMaybe<Scalars["String"]>;
  evidence_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  evidence_gt?: InputMaybe<Scalars["String"]>;
  evidence_gte?: InputMaybe<Scalars["String"]>;
  evidence_in?: InputMaybe<Array<Scalars["String"]>>;
  evidence_lt?: InputMaybe<Scalars["String"]>;
  evidence_lte?: InputMaybe<Scalars["String"]>;
  evidence_not?: InputMaybe<Scalars["String"]>;
  evidence_not_contains?: InputMaybe<Scalars["String"]>;
  evidence_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  evidence_not_ends_with?: InputMaybe<Scalars["String"]>;
  evidence_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  evidence_not_in?: InputMaybe<Array<Scalars["String"]>>;
  evidence_not_starts_with?: InputMaybe<Scalars["String"]>;
  evidence_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  evidence_starts_with?: InputMaybe<Scalars["String"]>;
  evidence_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  id?: InputMaybe<Scalars["ID"]>;
  id_gt?: InputMaybe<Scalars["ID"]>;
  id_gte?: InputMaybe<Scalars["ID"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]>>;
  id_lt?: InputMaybe<Scalars["ID"]>;
  id_lte?: InputMaybe<Scalars["ID"]>;
  id_not?: InputMaybe<Scalars["ID"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]>>;
  sender?: InputMaybe<Scalars["String"]>;
  sender_?: InputMaybe<User_Filter>;
  sender_contains?: InputMaybe<Scalars["String"]>;
  sender_contains_nocase?: InputMaybe<Scalars["String"]>;
  sender_ends_with?: InputMaybe<Scalars["String"]>;
  sender_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  sender_gt?: InputMaybe<Scalars["String"]>;
  sender_gte?: InputMaybe<Scalars["String"]>;
  sender_in?: InputMaybe<Array<Scalars["String"]>>;
  sender_lt?: InputMaybe<Scalars["String"]>;
  sender_lte?: InputMaybe<Scalars["String"]>;
  sender_not?: InputMaybe<Scalars["String"]>;
  sender_not_contains?: InputMaybe<Scalars["String"]>;
  sender_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  sender_not_ends_with?: InputMaybe<Scalars["String"]>;
  sender_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  sender_not_in?: InputMaybe<Array<Scalars["String"]>>;
  sender_not_starts_with?: InputMaybe<Scalars["String"]>;
  sender_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  sender_starts_with?: InputMaybe<Scalars["String"]>;
  sender_starts_with_nocase?: InputMaybe<Scalars["String"]>;
};

export enum ClassicEvidence_OrderBy {
  Evidence = "evidence",
  EvidenceGroup = "evidenceGroup",
  Id = "id",
  Sender = "sender",
}

export type ClassicRound = DisputeKitRound & {
  __typename?: "ClassicRound";
  contributions: Array<ClassicContribution>;
  counts: Array<Scalars["BigInt"]>;
  feeRewards: Scalars["BigInt"];
  fundedChoices: Array<Scalars["BigInt"]>;
  id: Scalars["ID"];
  localDispute: DisputeKitDispute;
  paidFees: Array<Scalars["BigInt"]>;
  tied: Scalars["Boolean"];
  totalCommited: Scalars["BigInt"];
  totalVoted: Scalars["BigInt"];
  votes: Array<ClassicVote>;
  winningChoice: Scalars["BigInt"];
};

export type ClassicRoundContributionsArgs = {
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<ClassicContribution_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  where?: InputMaybe<ClassicContribution_Filter>;
};

export type ClassicRoundVotesArgs = {
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<ClassicVote_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  where?: InputMaybe<ClassicVote_Filter>;
};

export type ClassicRound_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  contributions_?: InputMaybe<ClassicContribution_Filter>;
  counts?: InputMaybe<Array<Scalars["BigInt"]>>;
  counts_contains?: InputMaybe<Array<Scalars["BigInt"]>>;
  counts_contains_nocase?: InputMaybe<Array<Scalars["BigInt"]>>;
  counts_not?: InputMaybe<Array<Scalars["BigInt"]>>;
  counts_not_contains?: InputMaybe<Array<Scalars["BigInt"]>>;
  counts_not_contains_nocase?: InputMaybe<Array<Scalars["BigInt"]>>;
  feeRewards?: InputMaybe<Scalars["BigInt"]>;
  feeRewards_gt?: InputMaybe<Scalars["BigInt"]>;
  feeRewards_gte?: InputMaybe<Scalars["BigInt"]>;
  feeRewards_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  feeRewards_lt?: InputMaybe<Scalars["BigInt"]>;
  feeRewards_lte?: InputMaybe<Scalars["BigInt"]>;
  feeRewards_not?: InputMaybe<Scalars["BigInt"]>;
  feeRewards_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  fundedChoices?: InputMaybe<Array<Scalars["BigInt"]>>;
  fundedChoices_contains?: InputMaybe<Array<Scalars["BigInt"]>>;
  fundedChoices_contains_nocase?: InputMaybe<Array<Scalars["BigInt"]>>;
  fundedChoices_not?: InputMaybe<Array<Scalars["BigInt"]>>;
  fundedChoices_not_contains?: InputMaybe<Array<Scalars["BigInt"]>>;
  fundedChoices_not_contains_nocase?: InputMaybe<Array<Scalars["BigInt"]>>;
  id?: InputMaybe<Scalars["ID"]>;
  id_gt?: InputMaybe<Scalars["ID"]>;
  id_gte?: InputMaybe<Scalars["ID"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]>>;
  id_lt?: InputMaybe<Scalars["ID"]>;
  id_lte?: InputMaybe<Scalars["ID"]>;
  id_not?: InputMaybe<Scalars["ID"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]>>;
  localDispute?: InputMaybe<Scalars["String"]>;
  localDispute_?: InputMaybe<DisputeKitDispute_Filter>;
  localDispute_contains?: InputMaybe<Scalars["String"]>;
  localDispute_contains_nocase?: InputMaybe<Scalars["String"]>;
  localDispute_ends_with?: InputMaybe<Scalars["String"]>;
  localDispute_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  localDispute_gt?: InputMaybe<Scalars["String"]>;
  localDispute_gte?: InputMaybe<Scalars["String"]>;
  localDispute_in?: InputMaybe<Array<Scalars["String"]>>;
  localDispute_lt?: InputMaybe<Scalars["String"]>;
  localDispute_lte?: InputMaybe<Scalars["String"]>;
  localDispute_not?: InputMaybe<Scalars["String"]>;
  localDispute_not_contains?: InputMaybe<Scalars["String"]>;
  localDispute_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  localDispute_not_ends_with?: InputMaybe<Scalars["String"]>;
  localDispute_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  localDispute_not_in?: InputMaybe<Array<Scalars["String"]>>;
  localDispute_not_starts_with?: InputMaybe<Scalars["String"]>;
  localDispute_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  localDispute_starts_with?: InputMaybe<Scalars["String"]>;
  localDispute_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  paidFees?: InputMaybe<Array<Scalars["BigInt"]>>;
  paidFees_contains?: InputMaybe<Array<Scalars["BigInt"]>>;
  paidFees_contains_nocase?: InputMaybe<Array<Scalars["BigInt"]>>;
  paidFees_not?: InputMaybe<Array<Scalars["BigInt"]>>;
  paidFees_not_contains?: InputMaybe<Array<Scalars["BigInt"]>>;
  paidFees_not_contains_nocase?: InputMaybe<Array<Scalars["BigInt"]>>;
  tied?: InputMaybe<Scalars["Boolean"]>;
  tied_in?: InputMaybe<Array<Scalars["Boolean"]>>;
  tied_not?: InputMaybe<Scalars["Boolean"]>;
  tied_not_in?: InputMaybe<Array<Scalars["Boolean"]>>;
  totalCommited?: InputMaybe<Scalars["BigInt"]>;
  totalCommited_gt?: InputMaybe<Scalars["BigInt"]>;
  totalCommited_gte?: InputMaybe<Scalars["BigInt"]>;
  totalCommited_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  totalCommited_lt?: InputMaybe<Scalars["BigInt"]>;
  totalCommited_lte?: InputMaybe<Scalars["BigInt"]>;
  totalCommited_not?: InputMaybe<Scalars["BigInt"]>;
  totalCommited_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  totalVoted?: InputMaybe<Scalars["BigInt"]>;
  totalVoted_gt?: InputMaybe<Scalars["BigInt"]>;
  totalVoted_gte?: InputMaybe<Scalars["BigInt"]>;
  totalVoted_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  totalVoted_lt?: InputMaybe<Scalars["BigInt"]>;
  totalVoted_lte?: InputMaybe<Scalars["BigInt"]>;
  totalVoted_not?: InputMaybe<Scalars["BigInt"]>;
  totalVoted_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  votes?: InputMaybe<Array<Scalars["String"]>>;
  votes_?: InputMaybe<ClassicVote_Filter>;
  votes_contains?: InputMaybe<Array<Scalars["String"]>>;
  votes_contains_nocase?: InputMaybe<Array<Scalars["String"]>>;
  votes_not?: InputMaybe<Array<Scalars["String"]>>;
  votes_not_contains?: InputMaybe<Array<Scalars["String"]>>;
  votes_not_contains_nocase?: InputMaybe<Array<Scalars["String"]>>;
  winningChoice?: InputMaybe<Scalars["BigInt"]>;
  winningChoice_gt?: InputMaybe<Scalars["BigInt"]>;
  winningChoice_gte?: InputMaybe<Scalars["BigInt"]>;
  winningChoice_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  winningChoice_lt?: InputMaybe<Scalars["BigInt"]>;
  winningChoice_lte?: InputMaybe<Scalars["BigInt"]>;
  winningChoice_not?: InputMaybe<Scalars["BigInt"]>;
  winningChoice_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
};

export enum ClassicRound_OrderBy {
  Contributions = "contributions",
  Counts = "counts",
  FeeRewards = "feeRewards",
  FundedChoices = "fundedChoices",
  Id = "id",
  LocalDispute = "localDispute",
  PaidFees = "paidFees",
  Tied = "tied",
  TotalCommited = "totalCommited",
  TotalVoted = "totalVoted",
  Votes = "votes",
  WinningChoice = "winningChoice",
}

export type ClassicVote = Vote & {
  __typename?: "ClassicVote";
  choice: Scalars["BigInt"];
  coreDispute: Dispute;
  id: Scalars["ID"];
  juror: User;
  justification: Scalars["String"];
  localRound: DisputeKitRound;
};

export type ClassicVote_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  choice?: InputMaybe<Scalars["BigInt"]>;
  choice_gt?: InputMaybe<Scalars["BigInt"]>;
  choice_gte?: InputMaybe<Scalars["BigInt"]>;
  choice_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  choice_lt?: InputMaybe<Scalars["BigInt"]>;
  choice_lte?: InputMaybe<Scalars["BigInt"]>;
  choice_not?: InputMaybe<Scalars["BigInt"]>;
  choice_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  coreDispute?: InputMaybe<Scalars["String"]>;
  coreDispute_?: InputMaybe<Dispute_Filter>;
  coreDispute_contains?: InputMaybe<Scalars["String"]>;
  coreDispute_contains_nocase?: InputMaybe<Scalars["String"]>;
  coreDispute_ends_with?: InputMaybe<Scalars["String"]>;
  coreDispute_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  coreDispute_gt?: InputMaybe<Scalars["String"]>;
  coreDispute_gte?: InputMaybe<Scalars["String"]>;
  coreDispute_in?: InputMaybe<Array<Scalars["String"]>>;
  coreDispute_lt?: InputMaybe<Scalars["String"]>;
  coreDispute_lte?: InputMaybe<Scalars["String"]>;
  coreDispute_not?: InputMaybe<Scalars["String"]>;
  coreDispute_not_contains?: InputMaybe<Scalars["String"]>;
  coreDispute_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  coreDispute_not_ends_with?: InputMaybe<Scalars["String"]>;
  coreDispute_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  coreDispute_not_in?: InputMaybe<Array<Scalars["String"]>>;
  coreDispute_not_starts_with?: InputMaybe<Scalars["String"]>;
  coreDispute_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  coreDispute_starts_with?: InputMaybe<Scalars["String"]>;
  coreDispute_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  id?: InputMaybe<Scalars["ID"]>;
  id_gt?: InputMaybe<Scalars["ID"]>;
  id_gte?: InputMaybe<Scalars["ID"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]>>;
  id_lt?: InputMaybe<Scalars["ID"]>;
  id_lte?: InputMaybe<Scalars["ID"]>;
  id_not?: InputMaybe<Scalars["ID"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]>>;
  juror?: InputMaybe<Scalars["String"]>;
  juror_?: InputMaybe<User_Filter>;
  juror_contains?: InputMaybe<Scalars["String"]>;
  juror_contains_nocase?: InputMaybe<Scalars["String"]>;
  juror_ends_with?: InputMaybe<Scalars["String"]>;
  juror_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  juror_gt?: InputMaybe<Scalars["String"]>;
  juror_gte?: InputMaybe<Scalars["String"]>;
  juror_in?: InputMaybe<Array<Scalars["String"]>>;
  juror_lt?: InputMaybe<Scalars["String"]>;
  juror_lte?: InputMaybe<Scalars["String"]>;
  juror_not?: InputMaybe<Scalars["String"]>;
  juror_not_contains?: InputMaybe<Scalars["String"]>;
  juror_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  juror_not_ends_with?: InputMaybe<Scalars["String"]>;
  juror_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  juror_not_in?: InputMaybe<Array<Scalars["String"]>>;
  juror_not_starts_with?: InputMaybe<Scalars["String"]>;
  juror_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  juror_starts_with?: InputMaybe<Scalars["String"]>;
  juror_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  justification?: InputMaybe<Scalars["String"]>;
  justification_contains?: InputMaybe<Scalars["String"]>;
  justification_contains_nocase?: InputMaybe<Scalars["String"]>;
  justification_ends_with?: InputMaybe<Scalars["String"]>;
  justification_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  justification_gt?: InputMaybe<Scalars["String"]>;
  justification_gte?: InputMaybe<Scalars["String"]>;
  justification_in?: InputMaybe<Array<Scalars["String"]>>;
  justification_lt?: InputMaybe<Scalars["String"]>;
  justification_lte?: InputMaybe<Scalars["String"]>;
  justification_not?: InputMaybe<Scalars["String"]>;
  justification_not_contains?: InputMaybe<Scalars["String"]>;
  justification_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  justification_not_ends_with?: InputMaybe<Scalars["String"]>;
  justification_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  justification_not_in?: InputMaybe<Array<Scalars["String"]>>;
  justification_not_starts_with?: InputMaybe<Scalars["String"]>;
  justification_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  justification_starts_with?: InputMaybe<Scalars["String"]>;
  justification_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  localRound?: InputMaybe<Scalars["String"]>;
  localRound_?: InputMaybe<DisputeKitRound_Filter>;
  localRound_contains?: InputMaybe<Scalars["String"]>;
  localRound_contains_nocase?: InputMaybe<Scalars["String"]>;
  localRound_ends_with?: InputMaybe<Scalars["String"]>;
  localRound_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  localRound_gt?: InputMaybe<Scalars["String"]>;
  localRound_gte?: InputMaybe<Scalars["String"]>;
  localRound_in?: InputMaybe<Array<Scalars["String"]>>;
  localRound_lt?: InputMaybe<Scalars["String"]>;
  localRound_lte?: InputMaybe<Scalars["String"]>;
  localRound_not?: InputMaybe<Scalars["String"]>;
  localRound_not_contains?: InputMaybe<Scalars["String"]>;
  localRound_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  localRound_not_ends_with?: InputMaybe<Scalars["String"]>;
  localRound_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  localRound_not_in?: InputMaybe<Array<Scalars["String"]>>;
  localRound_not_starts_with?: InputMaybe<Scalars["String"]>;
  localRound_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  localRound_starts_with?: InputMaybe<Scalars["String"]>;
  localRound_starts_with_nocase?: InputMaybe<Scalars["String"]>;
};

export enum ClassicVote_OrderBy {
  Choice = "choice",
  CoreDispute = "coreDispute",
  Id = "id",
  Juror = "juror",
  Justification = "justification",
  LocalRound = "localRound",
}

export type Contribution = {
  contributor: User;
  coreDispute: Dispute;
  id: Scalars["ID"];
};

export type Contribution_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  contributor?: InputMaybe<Scalars["String"]>;
  contributor_?: InputMaybe<User_Filter>;
  contributor_contains?: InputMaybe<Scalars["String"]>;
  contributor_contains_nocase?: InputMaybe<Scalars["String"]>;
  contributor_ends_with?: InputMaybe<Scalars["String"]>;
  contributor_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  contributor_gt?: InputMaybe<Scalars["String"]>;
  contributor_gte?: InputMaybe<Scalars["String"]>;
  contributor_in?: InputMaybe<Array<Scalars["String"]>>;
  contributor_lt?: InputMaybe<Scalars["String"]>;
  contributor_lte?: InputMaybe<Scalars["String"]>;
  contributor_not?: InputMaybe<Scalars["String"]>;
  contributor_not_contains?: InputMaybe<Scalars["String"]>;
  contributor_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  contributor_not_ends_with?: InputMaybe<Scalars["String"]>;
  contributor_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  contributor_not_in?: InputMaybe<Array<Scalars["String"]>>;
  contributor_not_starts_with?: InputMaybe<Scalars["String"]>;
  contributor_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  contributor_starts_with?: InputMaybe<Scalars["String"]>;
  contributor_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  coreDispute?: InputMaybe<Scalars["String"]>;
  coreDispute_?: InputMaybe<Dispute_Filter>;
  coreDispute_contains?: InputMaybe<Scalars["String"]>;
  coreDispute_contains_nocase?: InputMaybe<Scalars["String"]>;
  coreDispute_ends_with?: InputMaybe<Scalars["String"]>;
  coreDispute_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  coreDispute_gt?: InputMaybe<Scalars["String"]>;
  coreDispute_gte?: InputMaybe<Scalars["String"]>;
  coreDispute_in?: InputMaybe<Array<Scalars["String"]>>;
  coreDispute_lt?: InputMaybe<Scalars["String"]>;
  coreDispute_lte?: InputMaybe<Scalars["String"]>;
  coreDispute_not?: InputMaybe<Scalars["String"]>;
  coreDispute_not_contains?: InputMaybe<Scalars["String"]>;
  coreDispute_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  coreDispute_not_ends_with?: InputMaybe<Scalars["String"]>;
  coreDispute_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  coreDispute_not_in?: InputMaybe<Array<Scalars["String"]>>;
  coreDispute_not_starts_with?: InputMaybe<Scalars["String"]>;
  coreDispute_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  coreDispute_starts_with?: InputMaybe<Scalars["String"]>;
  coreDispute_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  id?: InputMaybe<Scalars["ID"]>;
  id_gt?: InputMaybe<Scalars["ID"]>;
  id_gte?: InputMaybe<Scalars["ID"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]>>;
  id_lt?: InputMaybe<Scalars["ID"]>;
  id_lte?: InputMaybe<Scalars["ID"]>;
  id_not?: InputMaybe<Scalars["ID"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]>>;
};

export enum Contribution_OrderBy {
  Contributor = "contributor",
  CoreDispute = "coreDispute",
  Id = "id",
}

export type Counter = {
  __typename?: "Counter";
  activeJurors: Scalars["BigInt"];
  cases: Scalars["BigInt"];
  casesRuled: Scalars["BigInt"];
  casesVoting: Scalars["BigInt"];
  id: Scalars["ID"];
  paidETH: Scalars["BigInt"];
  redistributedPNK: Scalars["BigInt"];
  stakedPNK: Scalars["BigInt"];
};

export type Counter_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  activeJurors?: InputMaybe<Scalars["BigInt"]>;
  activeJurors_gt?: InputMaybe<Scalars["BigInt"]>;
  activeJurors_gte?: InputMaybe<Scalars["BigInt"]>;
  activeJurors_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  activeJurors_lt?: InputMaybe<Scalars["BigInt"]>;
  activeJurors_lte?: InputMaybe<Scalars["BigInt"]>;
  activeJurors_not?: InputMaybe<Scalars["BigInt"]>;
  activeJurors_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  cases?: InputMaybe<Scalars["BigInt"]>;
  casesRuled?: InputMaybe<Scalars["BigInt"]>;
  casesRuled_gt?: InputMaybe<Scalars["BigInt"]>;
  casesRuled_gte?: InputMaybe<Scalars["BigInt"]>;
  casesRuled_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  casesRuled_lt?: InputMaybe<Scalars["BigInt"]>;
  casesRuled_lte?: InputMaybe<Scalars["BigInt"]>;
  casesRuled_not?: InputMaybe<Scalars["BigInt"]>;
  casesRuled_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  casesVoting?: InputMaybe<Scalars["BigInt"]>;
  casesVoting_gt?: InputMaybe<Scalars["BigInt"]>;
  casesVoting_gte?: InputMaybe<Scalars["BigInt"]>;
  casesVoting_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  casesVoting_lt?: InputMaybe<Scalars["BigInt"]>;
  casesVoting_lte?: InputMaybe<Scalars["BigInt"]>;
  casesVoting_not?: InputMaybe<Scalars["BigInt"]>;
  casesVoting_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  cases_gt?: InputMaybe<Scalars["BigInt"]>;
  cases_gte?: InputMaybe<Scalars["BigInt"]>;
  cases_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  cases_lt?: InputMaybe<Scalars["BigInt"]>;
  cases_lte?: InputMaybe<Scalars["BigInt"]>;
  cases_not?: InputMaybe<Scalars["BigInt"]>;
  cases_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  id?: InputMaybe<Scalars["ID"]>;
  id_gt?: InputMaybe<Scalars["ID"]>;
  id_gte?: InputMaybe<Scalars["ID"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]>>;
  id_lt?: InputMaybe<Scalars["ID"]>;
  id_lte?: InputMaybe<Scalars["ID"]>;
  id_not?: InputMaybe<Scalars["ID"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]>>;
  paidETH?: InputMaybe<Scalars["BigInt"]>;
  paidETH_gt?: InputMaybe<Scalars["BigInt"]>;
  paidETH_gte?: InputMaybe<Scalars["BigInt"]>;
  paidETH_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  paidETH_lt?: InputMaybe<Scalars["BigInt"]>;
  paidETH_lte?: InputMaybe<Scalars["BigInt"]>;
  paidETH_not?: InputMaybe<Scalars["BigInt"]>;
  paidETH_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  redistributedPNK?: InputMaybe<Scalars["BigInt"]>;
  redistributedPNK_gt?: InputMaybe<Scalars["BigInt"]>;
  redistributedPNK_gte?: InputMaybe<Scalars["BigInt"]>;
  redistributedPNK_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  redistributedPNK_lt?: InputMaybe<Scalars["BigInt"]>;
  redistributedPNK_lte?: InputMaybe<Scalars["BigInt"]>;
  redistributedPNK_not?: InputMaybe<Scalars["BigInt"]>;
  redistributedPNK_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  stakedPNK?: InputMaybe<Scalars["BigInt"]>;
  stakedPNK_gt?: InputMaybe<Scalars["BigInt"]>;
  stakedPNK_gte?: InputMaybe<Scalars["BigInt"]>;
  stakedPNK_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  stakedPNK_lt?: InputMaybe<Scalars["BigInt"]>;
  stakedPNK_lte?: InputMaybe<Scalars["BigInt"]>;
  stakedPNK_not?: InputMaybe<Scalars["BigInt"]>;
  stakedPNK_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
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
  alpha: Scalars["BigInt"];
  children: Array<Court>;
  disputes: Array<Dispute>;
  feeForJuror: Scalars["BigInt"];
  hiddenVotes: Scalars["Boolean"];
  id: Scalars["ID"];
  jurorsForCourtJump: Scalars["BigInt"];
  minStake: Scalars["BigInt"];
  name?: Maybe<Scalars["String"]>;
  numberDisputes: Scalars["BigInt"];
  numberStakedJurors: Scalars["BigInt"];
  paidETH: Scalars["BigInt"];
  paidPNK: Scalars["BigInt"];
  parent?: Maybe<Court>;
  policy?: Maybe<Scalars["String"]>;
  stake: Scalars["BigInt"];
  stakedJurors: Array<JurorTokensPerCourt>;
  supportedDisputeKits: Array<DisputeKit>;
  timesPerPeriod: Array<Scalars["BigInt"]>;
};

export type CourtChildrenArgs = {
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Court_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  where?: InputMaybe<Court_Filter>;
};

export type CourtDisputesArgs = {
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Dispute_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  where?: InputMaybe<Dispute_Filter>;
};

export type CourtStakedJurorsArgs = {
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<JurorTokensPerCourt_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  where?: InputMaybe<JurorTokensPerCourt_Filter>;
};

export type CourtSupportedDisputeKitsArgs = {
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<DisputeKit_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  where?: InputMaybe<DisputeKit_Filter>;
};

export type Court_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  alpha?: InputMaybe<Scalars["BigInt"]>;
  alpha_gt?: InputMaybe<Scalars["BigInt"]>;
  alpha_gte?: InputMaybe<Scalars["BigInt"]>;
  alpha_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  alpha_lt?: InputMaybe<Scalars["BigInt"]>;
  alpha_lte?: InputMaybe<Scalars["BigInt"]>;
  alpha_not?: InputMaybe<Scalars["BigInt"]>;
  alpha_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  children_?: InputMaybe<Court_Filter>;
  disputes_?: InputMaybe<Dispute_Filter>;
  feeForJuror?: InputMaybe<Scalars["BigInt"]>;
  feeForJuror_gt?: InputMaybe<Scalars["BigInt"]>;
  feeForJuror_gte?: InputMaybe<Scalars["BigInt"]>;
  feeForJuror_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  feeForJuror_lt?: InputMaybe<Scalars["BigInt"]>;
  feeForJuror_lte?: InputMaybe<Scalars["BigInt"]>;
  feeForJuror_not?: InputMaybe<Scalars["BigInt"]>;
  feeForJuror_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  hiddenVotes?: InputMaybe<Scalars["Boolean"]>;
  hiddenVotes_in?: InputMaybe<Array<Scalars["Boolean"]>>;
  hiddenVotes_not?: InputMaybe<Scalars["Boolean"]>;
  hiddenVotes_not_in?: InputMaybe<Array<Scalars["Boolean"]>>;
  id?: InputMaybe<Scalars["ID"]>;
  id_gt?: InputMaybe<Scalars["ID"]>;
  id_gte?: InputMaybe<Scalars["ID"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]>>;
  id_lt?: InputMaybe<Scalars["ID"]>;
  id_lte?: InputMaybe<Scalars["ID"]>;
  id_not?: InputMaybe<Scalars["ID"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]>>;
  jurorsForCourtJump?: InputMaybe<Scalars["BigInt"]>;
  jurorsForCourtJump_gt?: InputMaybe<Scalars["BigInt"]>;
  jurorsForCourtJump_gte?: InputMaybe<Scalars["BigInt"]>;
  jurorsForCourtJump_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  jurorsForCourtJump_lt?: InputMaybe<Scalars["BigInt"]>;
  jurorsForCourtJump_lte?: InputMaybe<Scalars["BigInt"]>;
  jurorsForCourtJump_not?: InputMaybe<Scalars["BigInt"]>;
  jurorsForCourtJump_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  minStake?: InputMaybe<Scalars["BigInt"]>;
  minStake_gt?: InputMaybe<Scalars["BigInt"]>;
  minStake_gte?: InputMaybe<Scalars["BigInt"]>;
  minStake_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  minStake_lt?: InputMaybe<Scalars["BigInt"]>;
  minStake_lte?: InputMaybe<Scalars["BigInt"]>;
  minStake_not?: InputMaybe<Scalars["BigInt"]>;
  minStake_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  name?: InputMaybe<Scalars["String"]>;
  name_contains?: InputMaybe<Scalars["String"]>;
  name_contains_nocase?: InputMaybe<Scalars["String"]>;
  name_ends_with?: InputMaybe<Scalars["String"]>;
  name_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  name_gt?: InputMaybe<Scalars["String"]>;
  name_gte?: InputMaybe<Scalars["String"]>;
  name_in?: InputMaybe<Array<Scalars["String"]>>;
  name_lt?: InputMaybe<Scalars["String"]>;
  name_lte?: InputMaybe<Scalars["String"]>;
  name_not?: InputMaybe<Scalars["String"]>;
  name_not_contains?: InputMaybe<Scalars["String"]>;
  name_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  name_not_ends_with?: InputMaybe<Scalars["String"]>;
  name_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  name_not_in?: InputMaybe<Array<Scalars["String"]>>;
  name_not_starts_with?: InputMaybe<Scalars["String"]>;
  name_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  name_starts_with?: InputMaybe<Scalars["String"]>;
  name_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  numberDisputes?: InputMaybe<Scalars["BigInt"]>;
  numberDisputes_gt?: InputMaybe<Scalars["BigInt"]>;
  numberDisputes_gte?: InputMaybe<Scalars["BigInt"]>;
  numberDisputes_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  numberDisputes_lt?: InputMaybe<Scalars["BigInt"]>;
  numberDisputes_lte?: InputMaybe<Scalars["BigInt"]>;
  numberDisputes_not?: InputMaybe<Scalars["BigInt"]>;
  numberDisputes_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  numberStakedJurors?: InputMaybe<Scalars["BigInt"]>;
  numberStakedJurors_gt?: InputMaybe<Scalars["BigInt"]>;
  numberStakedJurors_gte?: InputMaybe<Scalars["BigInt"]>;
  numberStakedJurors_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  numberStakedJurors_lt?: InputMaybe<Scalars["BigInt"]>;
  numberStakedJurors_lte?: InputMaybe<Scalars["BigInt"]>;
  numberStakedJurors_not?: InputMaybe<Scalars["BigInt"]>;
  numberStakedJurors_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  paidETH?: InputMaybe<Scalars["BigInt"]>;
  paidETH_gt?: InputMaybe<Scalars["BigInt"]>;
  paidETH_gte?: InputMaybe<Scalars["BigInt"]>;
  paidETH_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  paidETH_lt?: InputMaybe<Scalars["BigInt"]>;
  paidETH_lte?: InputMaybe<Scalars["BigInt"]>;
  paidETH_not?: InputMaybe<Scalars["BigInt"]>;
  paidETH_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  paidPNK?: InputMaybe<Scalars["BigInt"]>;
  paidPNK_gt?: InputMaybe<Scalars["BigInt"]>;
  paidPNK_gte?: InputMaybe<Scalars["BigInt"]>;
  paidPNK_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  paidPNK_lt?: InputMaybe<Scalars["BigInt"]>;
  paidPNK_lte?: InputMaybe<Scalars["BigInt"]>;
  paidPNK_not?: InputMaybe<Scalars["BigInt"]>;
  paidPNK_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  parent?: InputMaybe<Scalars["String"]>;
  parent_?: InputMaybe<Court_Filter>;
  parent_contains?: InputMaybe<Scalars["String"]>;
  parent_contains_nocase?: InputMaybe<Scalars["String"]>;
  parent_ends_with?: InputMaybe<Scalars["String"]>;
  parent_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  parent_gt?: InputMaybe<Scalars["String"]>;
  parent_gte?: InputMaybe<Scalars["String"]>;
  parent_in?: InputMaybe<Array<Scalars["String"]>>;
  parent_lt?: InputMaybe<Scalars["String"]>;
  parent_lte?: InputMaybe<Scalars["String"]>;
  parent_not?: InputMaybe<Scalars["String"]>;
  parent_not_contains?: InputMaybe<Scalars["String"]>;
  parent_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  parent_not_ends_with?: InputMaybe<Scalars["String"]>;
  parent_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  parent_not_in?: InputMaybe<Array<Scalars["String"]>>;
  parent_not_starts_with?: InputMaybe<Scalars["String"]>;
  parent_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  parent_starts_with?: InputMaybe<Scalars["String"]>;
  parent_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  policy?: InputMaybe<Scalars["String"]>;
  policy_contains?: InputMaybe<Scalars["String"]>;
  policy_contains_nocase?: InputMaybe<Scalars["String"]>;
  policy_ends_with?: InputMaybe<Scalars["String"]>;
  policy_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  policy_gt?: InputMaybe<Scalars["String"]>;
  policy_gte?: InputMaybe<Scalars["String"]>;
  policy_in?: InputMaybe<Array<Scalars["String"]>>;
  policy_lt?: InputMaybe<Scalars["String"]>;
  policy_lte?: InputMaybe<Scalars["String"]>;
  policy_not?: InputMaybe<Scalars["String"]>;
  policy_not_contains?: InputMaybe<Scalars["String"]>;
  policy_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  policy_not_ends_with?: InputMaybe<Scalars["String"]>;
  policy_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  policy_not_in?: InputMaybe<Array<Scalars["String"]>>;
  policy_not_starts_with?: InputMaybe<Scalars["String"]>;
  policy_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  policy_starts_with?: InputMaybe<Scalars["String"]>;
  policy_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  stake?: InputMaybe<Scalars["BigInt"]>;
  stake_gt?: InputMaybe<Scalars["BigInt"]>;
  stake_gte?: InputMaybe<Scalars["BigInt"]>;
  stake_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  stake_lt?: InputMaybe<Scalars["BigInt"]>;
  stake_lte?: InputMaybe<Scalars["BigInt"]>;
  stake_not?: InputMaybe<Scalars["BigInt"]>;
  stake_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  stakedJurors_?: InputMaybe<JurorTokensPerCourt_Filter>;
  supportedDisputeKits?: InputMaybe<Array<Scalars["String"]>>;
  supportedDisputeKits_?: InputMaybe<DisputeKit_Filter>;
  supportedDisputeKits_contains?: InputMaybe<Array<Scalars["String"]>>;
  supportedDisputeKits_contains_nocase?: InputMaybe<Array<Scalars["String"]>>;
  supportedDisputeKits_not?: InputMaybe<Array<Scalars["String"]>>;
  supportedDisputeKits_not_contains?: InputMaybe<Array<Scalars["String"]>>;
  supportedDisputeKits_not_contains_nocase?: InputMaybe<
    Array<Scalars["String"]>
  >;
  timesPerPeriod?: InputMaybe<Array<Scalars["BigInt"]>>;
  timesPerPeriod_contains?: InputMaybe<Array<Scalars["BigInt"]>>;
  timesPerPeriod_contains_nocase?: InputMaybe<Array<Scalars["BigInt"]>>;
  timesPerPeriod_not?: InputMaybe<Array<Scalars["BigInt"]>>;
  timesPerPeriod_not_contains?: InputMaybe<Array<Scalars["BigInt"]>>;
  timesPerPeriod_not_contains_nocase?: InputMaybe<Array<Scalars["BigInt"]>>;
};

export enum Court_OrderBy {
  Alpha = "alpha",
  Children = "children",
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
  Policy = "policy",
  Stake = "stake",
  StakedJurors = "stakedJurors",
  SupportedDisputeKits = "supportedDisputeKits",
  TimesPerPeriod = "timesPerPeriod",
}

export type Dispute = {
  __typename?: "Dispute";
  arbitrated: Arbitrated;
  court: Court;
  currentRound: Round;
  currentRoundIndex: Scalars["BigInt"];
  disputeKitDispute?: Maybe<DisputeKitDispute>;
  id: Scalars["ID"];
  lastPeriodChange: Scalars["BigInt"];
  period: Period;
  rounds: Array<Round>;
  ruled: Scalars["Boolean"];
  shifts: Array<TokenAndEthShift>;
};

export type DisputeRoundsArgs = {
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Round_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  where?: InputMaybe<Round_Filter>;
};

export type DisputeShiftsArgs = {
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<TokenAndEthShift_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  where?: InputMaybe<TokenAndEthShift_Filter>;
};

export type DisputeKit = {
  __typename?: "DisputeKit";
  address?: Maybe<Scalars["Bytes"]>;
  children: Array<DisputeKit>;
  courts: Array<Court>;
  depthLevel: Scalars["BigInt"];
  id: Scalars["ID"];
  needsFreezing: Scalars["Boolean"];
  parent?: Maybe<DisputeKit>;
  rounds: Array<Round>;
};

export type DisputeKitChildrenArgs = {
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<DisputeKit_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  where?: InputMaybe<DisputeKit_Filter>;
};

export type DisputeKitCourtsArgs = {
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Court_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  where?: InputMaybe<Court_Filter>;
};

export type DisputeKitRoundsArgs = {
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Round_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  where?: InputMaybe<Round_Filter>;
};

export type DisputeKitDispute = {
  coreDispute: Dispute;
  currentLocalRoundIndex: Scalars["BigInt"];
  id: Scalars["ID"];
  localRounds: Array<DisputeKitRound>;
};

export type DisputeKitDisputeLocalRoundsArgs = {
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<DisputeKitRound_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  where?: InputMaybe<DisputeKitRound_Filter>;
};

export type DisputeKitDispute_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  coreDispute?: InputMaybe<Scalars["String"]>;
  coreDispute_?: InputMaybe<Dispute_Filter>;
  coreDispute_contains?: InputMaybe<Scalars["String"]>;
  coreDispute_contains_nocase?: InputMaybe<Scalars["String"]>;
  coreDispute_ends_with?: InputMaybe<Scalars["String"]>;
  coreDispute_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  coreDispute_gt?: InputMaybe<Scalars["String"]>;
  coreDispute_gte?: InputMaybe<Scalars["String"]>;
  coreDispute_in?: InputMaybe<Array<Scalars["String"]>>;
  coreDispute_lt?: InputMaybe<Scalars["String"]>;
  coreDispute_lte?: InputMaybe<Scalars["String"]>;
  coreDispute_not?: InputMaybe<Scalars["String"]>;
  coreDispute_not_contains?: InputMaybe<Scalars["String"]>;
  coreDispute_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  coreDispute_not_ends_with?: InputMaybe<Scalars["String"]>;
  coreDispute_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  coreDispute_not_in?: InputMaybe<Array<Scalars["String"]>>;
  coreDispute_not_starts_with?: InputMaybe<Scalars["String"]>;
  coreDispute_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  coreDispute_starts_with?: InputMaybe<Scalars["String"]>;
  coreDispute_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  currentLocalRoundIndex?: InputMaybe<Scalars["BigInt"]>;
  currentLocalRoundIndex_gt?: InputMaybe<Scalars["BigInt"]>;
  currentLocalRoundIndex_gte?: InputMaybe<Scalars["BigInt"]>;
  currentLocalRoundIndex_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  currentLocalRoundIndex_lt?: InputMaybe<Scalars["BigInt"]>;
  currentLocalRoundIndex_lte?: InputMaybe<Scalars["BigInt"]>;
  currentLocalRoundIndex_not?: InputMaybe<Scalars["BigInt"]>;
  currentLocalRoundIndex_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  id?: InputMaybe<Scalars["ID"]>;
  id_gt?: InputMaybe<Scalars["ID"]>;
  id_gte?: InputMaybe<Scalars["ID"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]>>;
  id_lt?: InputMaybe<Scalars["ID"]>;
  id_lte?: InputMaybe<Scalars["ID"]>;
  id_not?: InputMaybe<Scalars["ID"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]>>;
  localRounds_?: InputMaybe<DisputeKitRound_Filter>;
};

export enum DisputeKitDispute_OrderBy {
  CoreDispute = "coreDispute",
  CurrentLocalRoundIndex = "currentLocalRoundIndex",
  Id = "id",
  LocalRounds = "localRounds",
}

export type DisputeKitRound = {
  id: Scalars["ID"];
  localDispute: DisputeKitDispute;
};

export type DisputeKitRound_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  id?: InputMaybe<Scalars["ID"]>;
  id_gt?: InputMaybe<Scalars["ID"]>;
  id_gte?: InputMaybe<Scalars["ID"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]>>;
  id_lt?: InputMaybe<Scalars["ID"]>;
  id_lte?: InputMaybe<Scalars["ID"]>;
  id_not?: InputMaybe<Scalars["ID"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]>>;
  localDispute?: InputMaybe<Scalars["String"]>;
  localDispute_?: InputMaybe<DisputeKitDispute_Filter>;
  localDispute_contains?: InputMaybe<Scalars["String"]>;
  localDispute_contains_nocase?: InputMaybe<Scalars["String"]>;
  localDispute_ends_with?: InputMaybe<Scalars["String"]>;
  localDispute_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  localDispute_gt?: InputMaybe<Scalars["String"]>;
  localDispute_gte?: InputMaybe<Scalars["String"]>;
  localDispute_in?: InputMaybe<Array<Scalars["String"]>>;
  localDispute_lt?: InputMaybe<Scalars["String"]>;
  localDispute_lte?: InputMaybe<Scalars["String"]>;
  localDispute_not?: InputMaybe<Scalars["String"]>;
  localDispute_not_contains?: InputMaybe<Scalars["String"]>;
  localDispute_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  localDispute_not_ends_with?: InputMaybe<Scalars["String"]>;
  localDispute_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  localDispute_not_in?: InputMaybe<Array<Scalars["String"]>>;
  localDispute_not_starts_with?: InputMaybe<Scalars["String"]>;
  localDispute_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  localDispute_starts_with?: InputMaybe<Scalars["String"]>;
  localDispute_starts_with_nocase?: InputMaybe<Scalars["String"]>;
};

export enum DisputeKitRound_OrderBy {
  Id = "id",
  LocalDispute = "localDispute",
}

export type DisputeKit_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  address?: InputMaybe<Scalars["Bytes"]>;
  address_contains?: InputMaybe<Scalars["Bytes"]>;
  address_in?: InputMaybe<Array<Scalars["Bytes"]>>;
  address_not?: InputMaybe<Scalars["Bytes"]>;
  address_not_contains?: InputMaybe<Scalars["Bytes"]>;
  address_not_in?: InputMaybe<Array<Scalars["Bytes"]>>;
  children_?: InputMaybe<DisputeKit_Filter>;
  courts_?: InputMaybe<Court_Filter>;
  depthLevel?: InputMaybe<Scalars["BigInt"]>;
  depthLevel_gt?: InputMaybe<Scalars["BigInt"]>;
  depthLevel_gte?: InputMaybe<Scalars["BigInt"]>;
  depthLevel_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  depthLevel_lt?: InputMaybe<Scalars["BigInt"]>;
  depthLevel_lte?: InputMaybe<Scalars["BigInt"]>;
  depthLevel_not?: InputMaybe<Scalars["BigInt"]>;
  depthLevel_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  id?: InputMaybe<Scalars["ID"]>;
  id_gt?: InputMaybe<Scalars["ID"]>;
  id_gte?: InputMaybe<Scalars["ID"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]>>;
  id_lt?: InputMaybe<Scalars["ID"]>;
  id_lte?: InputMaybe<Scalars["ID"]>;
  id_not?: InputMaybe<Scalars["ID"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]>>;
  needsFreezing?: InputMaybe<Scalars["Boolean"]>;
  needsFreezing_in?: InputMaybe<Array<Scalars["Boolean"]>>;
  needsFreezing_not?: InputMaybe<Scalars["Boolean"]>;
  needsFreezing_not_in?: InputMaybe<Array<Scalars["Boolean"]>>;
  parent?: InputMaybe<Scalars["String"]>;
  parent_?: InputMaybe<DisputeKit_Filter>;
  parent_contains?: InputMaybe<Scalars["String"]>;
  parent_contains_nocase?: InputMaybe<Scalars["String"]>;
  parent_ends_with?: InputMaybe<Scalars["String"]>;
  parent_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  parent_gt?: InputMaybe<Scalars["String"]>;
  parent_gte?: InputMaybe<Scalars["String"]>;
  parent_in?: InputMaybe<Array<Scalars["String"]>>;
  parent_lt?: InputMaybe<Scalars["String"]>;
  parent_lte?: InputMaybe<Scalars["String"]>;
  parent_not?: InputMaybe<Scalars["String"]>;
  parent_not_contains?: InputMaybe<Scalars["String"]>;
  parent_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  parent_not_ends_with?: InputMaybe<Scalars["String"]>;
  parent_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  parent_not_in?: InputMaybe<Array<Scalars["String"]>>;
  parent_not_starts_with?: InputMaybe<Scalars["String"]>;
  parent_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  parent_starts_with?: InputMaybe<Scalars["String"]>;
  parent_starts_with_nocase?: InputMaybe<Scalars["String"]>;
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
  Rounds = "rounds",
}

export type Dispute_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  arbitrated?: InputMaybe<Scalars["String"]>;
  arbitrated_?: InputMaybe<Arbitrated_Filter>;
  arbitrated_contains?: InputMaybe<Scalars["String"]>;
  arbitrated_contains_nocase?: InputMaybe<Scalars["String"]>;
  arbitrated_ends_with?: InputMaybe<Scalars["String"]>;
  arbitrated_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  arbitrated_gt?: InputMaybe<Scalars["String"]>;
  arbitrated_gte?: InputMaybe<Scalars["String"]>;
  arbitrated_in?: InputMaybe<Array<Scalars["String"]>>;
  arbitrated_lt?: InputMaybe<Scalars["String"]>;
  arbitrated_lte?: InputMaybe<Scalars["String"]>;
  arbitrated_not?: InputMaybe<Scalars["String"]>;
  arbitrated_not_contains?: InputMaybe<Scalars["String"]>;
  arbitrated_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  arbitrated_not_ends_with?: InputMaybe<Scalars["String"]>;
  arbitrated_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  arbitrated_not_in?: InputMaybe<Array<Scalars["String"]>>;
  arbitrated_not_starts_with?: InputMaybe<Scalars["String"]>;
  arbitrated_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  arbitrated_starts_with?: InputMaybe<Scalars["String"]>;
  arbitrated_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  court?: InputMaybe<Scalars["String"]>;
  court_?: InputMaybe<Court_Filter>;
  court_contains?: InputMaybe<Scalars["String"]>;
  court_contains_nocase?: InputMaybe<Scalars["String"]>;
  court_ends_with?: InputMaybe<Scalars["String"]>;
  court_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  court_gt?: InputMaybe<Scalars["String"]>;
  court_gte?: InputMaybe<Scalars["String"]>;
  court_in?: InputMaybe<Array<Scalars["String"]>>;
  court_lt?: InputMaybe<Scalars["String"]>;
  court_lte?: InputMaybe<Scalars["String"]>;
  court_not?: InputMaybe<Scalars["String"]>;
  court_not_contains?: InputMaybe<Scalars["String"]>;
  court_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  court_not_ends_with?: InputMaybe<Scalars["String"]>;
  court_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  court_not_in?: InputMaybe<Array<Scalars["String"]>>;
  court_not_starts_with?: InputMaybe<Scalars["String"]>;
  court_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  court_starts_with?: InputMaybe<Scalars["String"]>;
  court_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  currentRound?: InputMaybe<Scalars["String"]>;
  currentRoundIndex?: InputMaybe<Scalars["BigInt"]>;
  currentRoundIndex_gt?: InputMaybe<Scalars["BigInt"]>;
  currentRoundIndex_gte?: InputMaybe<Scalars["BigInt"]>;
  currentRoundIndex_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  currentRoundIndex_lt?: InputMaybe<Scalars["BigInt"]>;
  currentRoundIndex_lte?: InputMaybe<Scalars["BigInt"]>;
  currentRoundIndex_not?: InputMaybe<Scalars["BigInt"]>;
  currentRoundIndex_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  currentRound_?: InputMaybe<Round_Filter>;
  currentRound_contains?: InputMaybe<Scalars["String"]>;
  currentRound_contains_nocase?: InputMaybe<Scalars["String"]>;
  currentRound_ends_with?: InputMaybe<Scalars["String"]>;
  currentRound_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  currentRound_gt?: InputMaybe<Scalars["String"]>;
  currentRound_gte?: InputMaybe<Scalars["String"]>;
  currentRound_in?: InputMaybe<Array<Scalars["String"]>>;
  currentRound_lt?: InputMaybe<Scalars["String"]>;
  currentRound_lte?: InputMaybe<Scalars["String"]>;
  currentRound_not?: InputMaybe<Scalars["String"]>;
  currentRound_not_contains?: InputMaybe<Scalars["String"]>;
  currentRound_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  currentRound_not_ends_with?: InputMaybe<Scalars["String"]>;
  currentRound_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  currentRound_not_in?: InputMaybe<Array<Scalars["String"]>>;
  currentRound_not_starts_with?: InputMaybe<Scalars["String"]>;
  currentRound_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  currentRound_starts_with?: InputMaybe<Scalars["String"]>;
  currentRound_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  disputeKitDispute_?: InputMaybe<DisputeKitDispute_Filter>;
  id?: InputMaybe<Scalars["ID"]>;
  id_gt?: InputMaybe<Scalars["ID"]>;
  id_gte?: InputMaybe<Scalars["ID"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]>>;
  id_lt?: InputMaybe<Scalars["ID"]>;
  id_lte?: InputMaybe<Scalars["ID"]>;
  id_not?: InputMaybe<Scalars["ID"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]>>;
  lastPeriodChange?: InputMaybe<Scalars["BigInt"]>;
  lastPeriodChange_gt?: InputMaybe<Scalars["BigInt"]>;
  lastPeriodChange_gte?: InputMaybe<Scalars["BigInt"]>;
  lastPeriodChange_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  lastPeriodChange_lt?: InputMaybe<Scalars["BigInt"]>;
  lastPeriodChange_lte?: InputMaybe<Scalars["BigInt"]>;
  lastPeriodChange_not?: InputMaybe<Scalars["BigInt"]>;
  lastPeriodChange_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  period?: InputMaybe<Period>;
  period_in?: InputMaybe<Array<Period>>;
  period_not?: InputMaybe<Period>;
  period_not_in?: InputMaybe<Array<Period>>;
  rounds_?: InputMaybe<Round_Filter>;
  ruled?: InputMaybe<Scalars["Boolean"]>;
  ruled_in?: InputMaybe<Array<Scalars["Boolean"]>>;
  ruled_not?: InputMaybe<Scalars["Boolean"]>;
  ruled_not_in?: InputMaybe<Array<Scalars["Boolean"]>>;
  shifts_?: InputMaybe<TokenAndEthShift_Filter>;
};

export enum Dispute_OrderBy {
  Arbitrated = "arbitrated",
  Court = "court",
  CurrentRound = "currentRound",
  CurrentRoundIndex = "currentRoundIndex",
  DisputeKitDispute = "disputeKitDispute",
  Id = "id",
  LastPeriodChange = "lastPeriodChange",
  Period = "period",
  Rounds = "rounds",
  Ruled = "ruled",
  Shifts = "shifts",
}

export type Draw = {
  __typename?: "Draw";
  dispute: Dispute;
  id: Scalars["ID"];
  juror: User;
  round: Round;
  voteID: Scalars["BigInt"];
};

export type Draw_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  dispute?: InputMaybe<Scalars["String"]>;
  dispute_?: InputMaybe<Dispute_Filter>;
  dispute_contains?: InputMaybe<Scalars["String"]>;
  dispute_contains_nocase?: InputMaybe<Scalars["String"]>;
  dispute_ends_with?: InputMaybe<Scalars["String"]>;
  dispute_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  dispute_gt?: InputMaybe<Scalars["String"]>;
  dispute_gte?: InputMaybe<Scalars["String"]>;
  dispute_in?: InputMaybe<Array<Scalars["String"]>>;
  dispute_lt?: InputMaybe<Scalars["String"]>;
  dispute_lte?: InputMaybe<Scalars["String"]>;
  dispute_not?: InputMaybe<Scalars["String"]>;
  dispute_not_contains?: InputMaybe<Scalars["String"]>;
  dispute_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  dispute_not_ends_with?: InputMaybe<Scalars["String"]>;
  dispute_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  dispute_not_in?: InputMaybe<Array<Scalars["String"]>>;
  dispute_not_starts_with?: InputMaybe<Scalars["String"]>;
  dispute_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  dispute_starts_with?: InputMaybe<Scalars["String"]>;
  dispute_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  id?: InputMaybe<Scalars["ID"]>;
  id_gt?: InputMaybe<Scalars["ID"]>;
  id_gte?: InputMaybe<Scalars["ID"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]>>;
  id_lt?: InputMaybe<Scalars["ID"]>;
  id_lte?: InputMaybe<Scalars["ID"]>;
  id_not?: InputMaybe<Scalars["ID"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]>>;
  juror?: InputMaybe<Scalars["String"]>;
  juror_?: InputMaybe<User_Filter>;
  juror_contains?: InputMaybe<Scalars["String"]>;
  juror_contains_nocase?: InputMaybe<Scalars["String"]>;
  juror_ends_with?: InputMaybe<Scalars["String"]>;
  juror_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  juror_gt?: InputMaybe<Scalars["String"]>;
  juror_gte?: InputMaybe<Scalars["String"]>;
  juror_in?: InputMaybe<Array<Scalars["String"]>>;
  juror_lt?: InputMaybe<Scalars["String"]>;
  juror_lte?: InputMaybe<Scalars["String"]>;
  juror_not?: InputMaybe<Scalars["String"]>;
  juror_not_contains?: InputMaybe<Scalars["String"]>;
  juror_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  juror_not_ends_with?: InputMaybe<Scalars["String"]>;
  juror_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  juror_not_in?: InputMaybe<Array<Scalars["String"]>>;
  juror_not_starts_with?: InputMaybe<Scalars["String"]>;
  juror_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  juror_starts_with?: InputMaybe<Scalars["String"]>;
  juror_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  round?: InputMaybe<Scalars["String"]>;
  round_?: InputMaybe<Round_Filter>;
  round_contains?: InputMaybe<Scalars["String"]>;
  round_contains_nocase?: InputMaybe<Scalars["String"]>;
  round_ends_with?: InputMaybe<Scalars["String"]>;
  round_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  round_gt?: InputMaybe<Scalars["String"]>;
  round_gte?: InputMaybe<Scalars["String"]>;
  round_in?: InputMaybe<Array<Scalars["String"]>>;
  round_lt?: InputMaybe<Scalars["String"]>;
  round_lte?: InputMaybe<Scalars["String"]>;
  round_not?: InputMaybe<Scalars["String"]>;
  round_not_contains?: InputMaybe<Scalars["String"]>;
  round_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  round_not_ends_with?: InputMaybe<Scalars["String"]>;
  round_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  round_not_in?: InputMaybe<Array<Scalars["String"]>>;
  round_not_starts_with?: InputMaybe<Scalars["String"]>;
  round_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  round_starts_with?: InputMaybe<Scalars["String"]>;
  round_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  voteID?: InputMaybe<Scalars["BigInt"]>;
  voteID_gt?: InputMaybe<Scalars["BigInt"]>;
  voteID_gte?: InputMaybe<Scalars["BigInt"]>;
  voteID_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  voteID_lt?: InputMaybe<Scalars["BigInt"]>;
  voteID_lte?: InputMaybe<Scalars["BigInt"]>;
  voteID_not?: InputMaybe<Scalars["BigInt"]>;
  voteID_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
};

export enum Draw_OrderBy {
  Dispute = "dispute",
  Id = "id",
  Juror = "juror",
  Round = "round",
  VoteId = "voteID",
}

export type Evidence = {
  evidence: Scalars["String"];
  evidenceGroup: EvidenceGroup;
  id: Scalars["ID"];
  sender: User;
};

export type EvidenceGroup = {
  evidences: Array<Evidence>;
  id: Scalars["ID"];
  nextEvidenceIndex: Scalars["BigInt"];
};

export type EvidenceGroupEvidencesArgs = {
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Evidence_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  where?: InputMaybe<Evidence_Filter>;
};

export type EvidenceGroup_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  evidences_?: InputMaybe<Evidence_Filter>;
  id?: InputMaybe<Scalars["ID"]>;
  id_gt?: InputMaybe<Scalars["ID"]>;
  id_gte?: InputMaybe<Scalars["ID"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]>>;
  id_lt?: InputMaybe<Scalars["ID"]>;
  id_lte?: InputMaybe<Scalars["ID"]>;
  id_not?: InputMaybe<Scalars["ID"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]>>;
  nextEvidenceIndex?: InputMaybe<Scalars["BigInt"]>;
  nextEvidenceIndex_gt?: InputMaybe<Scalars["BigInt"]>;
  nextEvidenceIndex_gte?: InputMaybe<Scalars["BigInt"]>;
  nextEvidenceIndex_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  nextEvidenceIndex_lt?: InputMaybe<Scalars["BigInt"]>;
  nextEvidenceIndex_lte?: InputMaybe<Scalars["BigInt"]>;
  nextEvidenceIndex_not?: InputMaybe<Scalars["BigInt"]>;
  nextEvidenceIndex_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
};

export enum EvidenceGroup_OrderBy {
  Evidences = "evidences",
  Id = "id",
  NextEvidenceIndex = "nextEvidenceIndex",
}

export type Evidence_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  evidence?: InputMaybe<Scalars["String"]>;
  evidenceGroup?: InputMaybe<Scalars["String"]>;
  evidenceGroup_?: InputMaybe<EvidenceGroup_Filter>;
  evidenceGroup_contains?: InputMaybe<Scalars["String"]>;
  evidenceGroup_contains_nocase?: InputMaybe<Scalars["String"]>;
  evidenceGroup_ends_with?: InputMaybe<Scalars["String"]>;
  evidenceGroup_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  evidenceGroup_gt?: InputMaybe<Scalars["String"]>;
  evidenceGroup_gte?: InputMaybe<Scalars["String"]>;
  evidenceGroup_in?: InputMaybe<Array<Scalars["String"]>>;
  evidenceGroup_lt?: InputMaybe<Scalars["String"]>;
  evidenceGroup_lte?: InputMaybe<Scalars["String"]>;
  evidenceGroup_not?: InputMaybe<Scalars["String"]>;
  evidenceGroup_not_contains?: InputMaybe<Scalars["String"]>;
  evidenceGroup_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  evidenceGroup_not_ends_with?: InputMaybe<Scalars["String"]>;
  evidenceGroup_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  evidenceGroup_not_in?: InputMaybe<Array<Scalars["String"]>>;
  evidenceGroup_not_starts_with?: InputMaybe<Scalars["String"]>;
  evidenceGroup_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  evidenceGroup_starts_with?: InputMaybe<Scalars["String"]>;
  evidenceGroup_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  evidence_contains?: InputMaybe<Scalars["String"]>;
  evidence_contains_nocase?: InputMaybe<Scalars["String"]>;
  evidence_ends_with?: InputMaybe<Scalars["String"]>;
  evidence_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  evidence_gt?: InputMaybe<Scalars["String"]>;
  evidence_gte?: InputMaybe<Scalars["String"]>;
  evidence_in?: InputMaybe<Array<Scalars["String"]>>;
  evidence_lt?: InputMaybe<Scalars["String"]>;
  evidence_lte?: InputMaybe<Scalars["String"]>;
  evidence_not?: InputMaybe<Scalars["String"]>;
  evidence_not_contains?: InputMaybe<Scalars["String"]>;
  evidence_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  evidence_not_ends_with?: InputMaybe<Scalars["String"]>;
  evidence_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  evidence_not_in?: InputMaybe<Array<Scalars["String"]>>;
  evidence_not_starts_with?: InputMaybe<Scalars["String"]>;
  evidence_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  evidence_starts_with?: InputMaybe<Scalars["String"]>;
  evidence_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  id?: InputMaybe<Scalars["ID"]>;
  id_gt?: InputMaybe<Scalars["ID"]>;
  id_gte?: InputMaybe<Scalars["ID"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]>>;
  id_lt?: InputMaybe<Scalars["ID"]>;
  id_lte?: InputMaybe<Scalars["ID"]>;
  id_not?: InputMaybe<Scalars["ID"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]>>;
  sender?: InputMaybe<Scalars["String"]>;
  sender_?: InputMaybe<User_Filter>;
  sender_contains?: InputMaybe<Scalars["String"]>;
  sender_contains_nocase?: InputMaybe<Scalars["String"]>;
  sender_ends_with?: InputMaybe<Scalars["String"]>;
  sender_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  sender_gt?: InputMaybe<Scalars["String"]>;
  sender_gte?: InputMaybe<Scalars["String"]>;
  sender_in?: InputMaybe<Array<Scalars["String"]>>;
  sender_lt?: InputMaybe<Scalars["String"]>;
  sender_lte?: InputMaybe<Scalars["String"]>;
  sender_not?: InputMaybe<Scalars["String"]>;
  sender_not_contains?: InputMaybe<Scalars["String"]>;
  sender_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  sender_not_ends_with?: InputMaybe<Scalars["String"]>;
  sender_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  sender_not_in?: InputMaybe<Array<Scalars["String"]>>;
  sender_not_starts_with?: InputMaybe<Scalars["String"]>;
  sender_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  sender_starts_with?: InputMaybe<Scalars["String"]>;
  sender_starts_with_nocase?: InputMaybe<Scalars["String"]>;
};

export enum Evidence_OrderBy {
  Evidence = "evidence",
  EvidenceGroup = "evidenceGroup",
  Id = "id",
  Sender = "sender",
}

export type GatewayDispute = {
  __typename?: "GatewayDispute";
  arbitrationCost: Scalars["BigInt"];
  arbitrator: Scalars["Bytes"];
  disputeHash: Scalars["Bytes"];
  homeDispute: Dispute;
  id: Scalars["ID"];
  relayer: Scalars["Bytes"];
};

export type GatewayDispute_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  arbitrationCost?: InputMaybe<Scalars["BigInt"]>;
  arbitrationCost_gt?: InputMaybe<Scalars["BigInt"]>;
  arbitrationCost_gte?: InputMaybe<Scalars["BigInt"]>;
  arbitrationCost_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  arbitrationCost_lt?: InputMaybe<Scalars["BigInt"]>;
  arbitrationCost_lte?: InputMaybe<Scalars["BigInt"]>;
  arbitrationCost_not?: InputMaybe<Scalars["BigInt"]>;
  arbitrationCost_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  arbitrator?: InputMaybe<Scalars["Bytes"]>;
  arbitrator_contains?: InputMaybe<Scalars["Bytes"]>;
  arbitrator_in?: InputMaybe<Array<Scalars["Bytes"]>>;
  arbitrator_not?: InputMaybe<Scalars["Bytes"]>;
  arbitrator_not_contains?: InputMaybe<Scalars["Bytes"]>;
  arbitrator_not_in?: InputMaybe<Array<Scalars["Bytes"]>>;
  disputeHash?: InputMaybe<Scalars["Bytes"]>;
  disputeHash_contains?: InputMaybe<Scalars["Bytes"]>;
  disputeHash_in?: InputMaybe<Array<Scalars["Bytes"]>>;
  disputeHash_not?: InputMaybe<Scalars["Bytes"]>;
  disputeHash_not_contains?: InputMaybe<Scalars["Bytes"]>;
  disputeHash_not_in?: InputMaybe<Array<Scalars["Bytes"]>>;
  homeDispute?: InputMaybe<Scalars["String"]>;
  homeDispute_?: InputMaybe<Dispute_Filter>;
  homeDispute_contains?: InputMaybe<Scalars["String"]>;
  homeDispute_contains_nocase?: InputMaybe<Scalars["String"]>;
  homeDispute_ends_with?: InputMaybe<Scalars["String"]>;
  homeDispute_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  homeDispute_gt?: InputMaybe<Scalars["String"]>;
  homeDispute_gte?: InputMaybe<Scalars["String"]>;
  homeDispute_in?: InputMaybe<Array<Scalars["String"]>>;
  homeDispute_lt?: InputMaybe<Scalars["String"]>;
  homeDispute_lte?: InputMaybe<Scalars["String"]>;
  homeDispute_not?: InputMaybe<Scalars["String"]>;
  homeDispute_not_contains?: InputMaybe<Scalars["String"]>;
  homeDispute_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  homeDispute_not_ends_with?: InputMaybe<Scalars["String"]>;
  homeDispute_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  homeDispute_not_in?: InputMaybe<Array<Scalars["String"]>>;
  homeDispute_not_starts_with?: InputMaybe<Scalars["String"]>;
  homeDispute_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  homeDispute_starts_with?: InputMaybe<Scalars["String"]>;
  homeDispute_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  id?: InputMaybe<Scalars["ID"]>;
  id_gt?: InputMaybe<Scalars["ID"]>;
  id_gte?: InputMaybe<Scalars["ID"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]>>;
  id_lt?: InputMaybe<Scalars["ID"]>;
  id_lte?: InputMaybe<Scalars["ID"]>;
  id_not?: InputMaybe<Scalars["ID"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]>>;
  relayer?: InputMaybe<Scalars["Bytes"]>;
  relayer_contains?: InputMaybe<Scalars["Bytes"]>;
  relayer_in?: InputMaybe<Array<Scalars["Bytes"]>>;
  relayer_not?: InputMaybe<Scalars["Bytes"]>;
  relayer_not_contains?: InputMaybe<Scalars["Bytes"]>;
  relayer_not_in?: InputMaybe<Array<Scalars["Bytes"]>>;
};

export enum GatewayDispute_OrderBy {
  ArbitrationCost = "arbitrationCost",
  Arbitrator = "arbitrator",
  DisputeHash = "disputeHash",
  HomeDispute = "homeDispute",
  Id = "id",
  Relayer = "relayer",
}

export type JurorTokensPerCourt = {
  __typename?: "JurorTokensPerCourt";
  court: Court;
  id: Scalars["ID"];
  juror: User;
  locked: Scalars["BigInt"];
  staked: Scalars["BigInt"];
};

export type JurorTokensPerCourt_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  court?: InputMaybe<Scalars["String"]>;
  court_?: InputMaybe<Court_Filter>;
  court_contains?: InputMaybe<Scalars["String"]>;
  court_contains_nocase?: InputMaybe<Scalars["String"]>;
  court_ends_with?: InputMaybe<Scalars["String"]>;
  court_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  court_gt?: InputMaybe<Scalars["String"]>;
  court_gte?: InputMaybe<Scalars["String"]>;
  court_in?: InputMaybe<Array<Scalars["String"]>>;
  court_lt?: InputMaybe<Scalars["String"]>;
  court_lte?: InputMaybe<Scalars["String"]>;
  court_not?: InputMaybe<Scalars["String"]>;
  court_not_contains?: InputMaybe<Scalars["String"]>;
  court_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  court_not_ends_with?: InputMaybe<Scalars["String"]>;
  court_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  court_not_in?: InputMaybe<Array<Scalars["String"]>>;
  court_not_starts_with?: InputMaybe<Scalars["String"]>;
  court_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  court_starts_with?: InputMaybe<Scalars["String"]>;
  court_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  id?: InputMaybe<Scalars["ID"]>;
  id_gt?: InputMaybe<Scalars["ID"]>;
  id_gte?: InputMaybe<Scalars["ID"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]>>;
  id_lt?: InputMaybe<Scalars["ID"]>;
  id_lte?: InputMaybe<Scalars["ID"]>;
  id_not?: InputMaybe<Scalars["ID"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]>>;
  juror?: InputMaybe<Scalars["String"]>;
  juror_?: InputMaybe<User_Filter>;
  juror_contains?: InputMaybe<Scalars["String"]>;
  juror_contains_nocase?: InputMaybe<Scalars["String"]>;
  juror_ends_with?: InputMaybe<Scalars["String"]>;
  juror_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  juror_gt?: InputMaybe<Scalars["String"]>;
  juror_gte?: InputMaybe<Scalars["String"]>;
  juror_in?: InputMaybe<Array<Scalars["String"]>>;
  juror_lt?: InputMaybe<Scalars["String"]>;
  juror_lte?: InputMaybe<Scalars["String"]>;
  juror_not?: InputMaybe<Scalars["String"]>;
  juror_not_contains?: InputMaybe<Scalars["String"]>;
  juror_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  juror_not_ends_with?: InputMaybe<Scalars["String"]>;
  juror_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  juror_not_in?: InputMaybe<Array<Scalars["String"]>>;
  juror_not_starts_with?: InputMaybe<Scalars["String"]>;
  juror_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  juror_starts_with?: InputMaybe<Scalars["String"]>;
  juror_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  locked?: InputMaybe<Scalars["BigInt"]>;
  locked_gt?: InputMaybe<Scalars["BigInt"]>;
  locked_gte?: InputMaybe<Scalars["BigInt"]>;
  locked_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  locked_lt?: InputMaybe<Scalars["BigInt"]>;
  locked_lte?: InputMaybe<Scalars["BigInt"]>;
  locked_not?: InputMaybe<Scalars["BigInt"]>;
  locked_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  staked?: InputMaybe<Scalars["BigInt"]>;
  staked_gt?: InputMaybe<Scalars["BigInt"]>;
  staked_gte?: InputMaybe<Scalars["BigInt"]>;
  staked_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  staked_lt?: InputMaybe<Scalars["BigInt"]>;
  staked_lte?: InputMaybe<Scalars["BigInt"]>;
  staked_not?: InputMaybe<Scalars["BigInt"]>;
  staked_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
};

export enum JurorTokensPerCourt_OrderBy {
  Court = "court",
  Id = "id",
  Juror = "juror",
  Locked = "locked",
  Staked = "staked",
}

/** Defines the order direction, either ascending or descending */
export enum OrderDirection {
  Asc = "asc",
  Desc = "desc",
}

export type OutgoingBatch = {
  __typename?: "OutgoingBatch";
  batchMerkleRoot: Scalars["String"];
  epoch: Scalars["BigInt"];
  id: Scalars["ID"];
  size: Scalars["BigInt"];
};

export type OutgoingBatch_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  batchMerkleRoot?: InputMaybe<Scalars["String"]>;
  batchMerkleRoot_contains?: InputMaybe<Scalars["String"]>;
  batchMerkleRoot_contains_nocase?: InputMaybe<Scalars["String"]>;
  batchMerkleRoot_ends_with?: InputMaybe<Scalars["String"]>;
  batchMerkleRoot_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  batchMerkleRoot_gt?: InputMaybe<Scalars["String"]>;
  batchMerkleRoot_gte?: InputMaybe<Scalars["String"]>;
  batchMerkleRoot_in?: InputMaybe<Array<Scalars["String"]>>;
  batchMerkleRoot_lt?: InputMaybe<Scalars["String"]>;
  batchMerkleRoot_lte?: InputMaybe<Scalars["String"]>;
  batchMerkleRoot_not?: InputMaybe<Scalars["String"]>;
  batchMerkleRoot_not_contains?: InputMaybe<Scalars["String"]>;
  batchMerkleRoot_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  batchMerkleRoot_not_ends_with?: InputMaybe<Scalars["String"]>;
  batchMerkleRoot_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  batchMerkleRoot_not_in?: InputMaybe<Array<Scalars["String"]>>;
  batchMerkleRoot_not_starts_with?: InputMaybe<Scalars["String"]>;
  batchMerkleRoot_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  batchMerkleRoot_starts_with?: InputMaybe<Scalars["String"]>;
  batchMerkleRoot_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  epoch?: InputMaybe<Scalars["BigInt"]>;
  epoch_gt?: InputMaybe<Scalars["BigInt"]>;
  epoch_gte?: InputMaybe<Scalars["BigInt"]>;
  epoch_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  epoch_lt?: InputMaybe<Scalars["BigInt"]>;
  epoch_lte?: InputMaybe<Scalars["BigInt"]>;
  epoch_not?: InputMaybe<Scalars["BigInt"]>;
  epoch_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  id?: InputMaybe<Scalars["ID"]>;
  id_gt?: InputMaybe<Scalars["ID"]>;
  id_gte?: InputMaybe<Scalars["ID"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]>>;
  id_lt?: InputMaybe<Scalars["ID"]>;
  id_lte?: InputMaybe<Scalars["ID"]>;
  id_not?: InputMaybe<Scalars["ID"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]>>;
  size?: InputMaybe<Scalars["BigInt"]>;
  size_gt?: InputMaybe<Scalars["BigInt"]>;
  size_gte?: InputMaybe<Scalars["BigInt"]>;
  size_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  size_lt?: InputMaybe<Scalars["BigInt"]>;
  size_lte?: InputMaybe<Scalars["BigInt"]>;
  size_not?: InputMaybe<Scalars["BigInt"]>;
  size_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
};

export enum OutgoingBatch_OrderBy {
  BatchMerkleRoot = "batchMerkleRoot",
  Epoch = "epoch",
  Id = "id",
  Size = "size",
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
  arbitrated?: Maybe<Arbitrated>;
  arbitrateds: Array<Arbitrated>;
  classicContribution?: Maybe<ClassicContribution>;
  classicContributions: Array<ClassicContribution>;
  classicDispute?: Maybe<ClassicDispute>;
  classicDisputes: Array<ClassicDispute>;
  classicEvidence?: Maybe<ClassicEvidence>;
  classicEvidenceGroup?: Maybe<ClassicEvidenceGroup>;
  classicEvidenceGroups: Array<ClassicEvidenceGroup>;
  classicEvidences: Array<ClassicEvidence>;
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
  disputes: Array<Dispute>;
  draw?: Maybe<Draw>;
  draws: Array<Draw>;
  evidence?: Maybe<Evidence>;
  evidenceGroup?: Maybe<EvidenceGroup>;
  evidenceGroups: Array<EvidenceGroup>;
  evidences: Array<Evidence>;
  gatewayDispute?: Maybe<GatewayDispute>;
  gatewayDisputes: Array<GatewayDispute>;
  jurorTokensPerCourt?: Maybe<JurorTokensPerCourt>;
  jurorTokensPerCourts: Array<JurorTokensPerCourt>;
  outgoingBatch?: Maybe<OutgoingBatch>;
  outgoingBatches: Array<OutgoingBatch>;
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

export type QueryArbitratedArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryArbitratedsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Arbitrated_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Arbitrated_Filter>;
};

export type QueryClassicContributionArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryClassicContributionsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<ClassicContribution_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ClassicContribution_Filter>;
};

export type QueryClassicDisputeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryClassicDisputesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<ClassicDispute_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ClassicDispute_Filter>;
};

export type QueryClassicEvidenceArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryClassicEvidenceGroupArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryClassicEvidenceGroupsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<ClassicEvidenceGroup_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ClassicEvidenceGroup_Filter>;
};

export type QueryClassicEvidencesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<ClassicEvidence_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ClassicEvidence_Filter>;
};

export type QueryClassicRoundArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryClassicRoundsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<ClassicRound_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ClassicRound_Filter>;
};

export type QueryClassicVoteArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryClassicVotesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<ClassicVote_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ClassicVote_Filter>;
};

export type QueryContributionArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryContributionsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Contribution_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Contribution_Filter>;
};

export type QueryCounterArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryCountersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Counter_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Counter_Filter>;
};

export type QueryCourtArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryCourtsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Court_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Court_Filter>;
};

export type QueryDisputeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryDisputeKitArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryDisputeKitDisputeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryDisputeKitDisputesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<DisputeKitDispute_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DisputeKitDispute_Filter>;
};

export type QueryDisputeKitRoundArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryDisputeKitRoundsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<DisputeKitRound_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DisputeKitRound_Filter>;
};

export type QueryDisputeKitsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<DisputeKit_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DisputeKit_Filter>;
};

export type QueryDisputesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Dispute_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Dispute_Filter>;
};

export type QueryDrawArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryDrawsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Draw_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Draw_Filter>;
};

export type QueryEvidenceArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryEvidenceGroupArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryEvidenceGroupsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<EvidenceGroup_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<EvidenceGroup_Filter>;
};

export type QueryEvidencesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Evidence_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Evidence_Filter>;
};

export type QueryGatewayDisputeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryGatewayDisputesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<GatewayDispute_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<GatewayDispute_Filter>;
};

export type QueryJurorTokensPerCourtArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryJurorTokensPerCourtsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<JurorTokensPerCourt_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<JurorTokensPerCourt_Filter>;
};

export type QueryOutgoingBatchArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryOutgoingBatchesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<OutgoingBatch_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<OutgoingBatch_Filter>;
};

export type QueryRoundArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryRoundsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Round_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Round_Filter>;
};

export type QueryTokenAndEthShiftArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryTokenAndEthShiftsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<TokenAndEthShift_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<TokenAndEthShift_Filter>;
};

export type QueryUserArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryUsersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<User_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<User_Filter>;
};

export type QueryVoteArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryVotesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Vote_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Vote_Filter>;
};

export type Round = {
  __typename?: "Round";
  dispute: Dispute;
  disputeKit: DisputeKit;
  drawnJurors: Array<Draw>;
  id: Scalars["ID"];
  nbVotes: Scalars["BigInt"];
  penalties: Scalars["BigInt"];
  repartitions: Scalars["BigInt"];
  tokensAtStakePerJuror: Scalars["BigInt"];
  totalFeesForJurors: Scalars["BigInt"];
};

export type RoundDrawnJurorsArgs = {
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Draw_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  where?: InputMaybe<Draw_Filter>;
};

export type Round_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  dispute?: InputMaybe<Scalars["String"]>;
  disputeKit?: InputMaybe<Scalars["String"]>;
  disputeKit_?: InputMaybe<DisputeKit_Filter>;
  disputeKit_contains?: InputMaybe<Scalars["String"]>;
  disputeKit_contains_nocase?: InputMaybe<Scalars["String"]>;
  disputeKit_ends_with?: InputMaybe<Scalars["String"]>;
  disputeKit_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  disputeKit_gt?: InputMaybe<Scalars["String"]>;
  disputeKit_gte?: InputMaybe<Scalars["String"]>;
  disputeKit_in?: InputMaybe<Array<Scalars["String"]>>;
  disputeKit_lt?: InputMaybe<Scalars["String"]>;
  disputeKit_lte?: InputMaybe<Scalars["String"]>;
  disputeKit_not?: InputMaybe<Scalars["String"]>;
  disputeKit_not_contains?: InputMaybe<Scalars["String"]>;
  disputeKit_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  disputeKit_not_ends_with?: InputMaybe<Scalars["String"]>;
  disputeKit_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  disputeKit_not_in?: InputMaybe<Array<Scalars["String"]>>;
  disputeKit_not_starts_with?: InputMaybe<Scalars["String"]>;
  disputeKit_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  disputeKit_starts_with?: InputMaybe<Scalars["String"]>;
  disputeKit_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  dispute_?: InputMaybe<Dispute_Filter>;
  dispute_contains?: InputMaybe<Scalars["String"]>;
  dispute_contains_nocase?: InputMaybe<Scalars["String"]>;
  dispute_ends_with?: InputMaybe<Scalars["String"]>;
  dispute_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  dispute_gt?: InputMaybe<Scalars["String"]>;
  dispute_gte?: InputMaybe<Scalars["String"]>;
  dispute_in?: InputMaybe<Array<Scalars["String"]>>;
  dispute_lt?: InputMaybe<Scalars["String"]>;
  dispute_lte?: InputMaybe<Scalars["String"]>;
  dispute_not?: InputMaybe<Scalars["String"]>;
  dispute_not_contains?: InputMaybe<Scalars["String"]>;
  dispute_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  dispute_not_ends_with?: InputMaybe<Scalars["String"]>;
  dispute_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  dispute_not_in?: InputMaybe<Array<Scalars["String"]>>;
  dispute_not_starts_with?: InputMaybe<Scalars["String"]>;
  dispute_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  dispute_starts_with?: InputMaybe<Scalars["String"]>;
  dispute_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  drawnJurors_?: InputMaybe<Draw_Filter>;
  id?: InputMaybe<Scalars["ID"]>;
  id_gt?: InputMaybe<Scalars["ID"]>;
  id_gte?: InputMaybe<Scalars["ID"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]>>;
  id_lt?: InputMaybe<Scalars["ID"]>;
  id_lte?: InputMaybe<Scalars["ID"]>;
  id_not?: InputMaybe<Scalars["ID"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]>>;
  nbVotes?: InputMaybe<Scalars["BigInt"]>;
  nbVotes_gt?: InputMaybe<Scalars["BigInt"]>;
  nbVotes_gte?: InputMaybe<Scalars["BigInt"]>;
  nbVotes_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  nbVotes_lt?: InputMaybe<Scalars["BigInt"]>;
  nbVotes_lte?: InputMaybe<Scalars["BigInt"]>;
  nbVotes_not?: InputMaybe<Scalars["BigInt"]>;
  nbVotes_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  penalties?: InputMaybe<Scalars["BigInt"]>;
  penalties_gt?: InputMaybe<Scalars["BigInt"]>;
  penalties_gte?: InputMaybe<Scalars["BigInt"]>;
  penalties_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  penalties_lt?: InputMaybe<Scalars["BigInt"]>;
  penalties_lte?: InputMaybe<Scalars["BigInt"]>;
  penalties_not?: InputMaybe<Scalars["BigInt"]>;
  penalties_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  repartitions?: InputMaybe<Scalars["BigInt"]>;
  repartitions_gt?: InputMaybe<Scalars["BigInt"]>;
  repartitions_gte?: InputMaybe<Scalars["BigInt"]>;
  repartitions_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  repartitions_lt?: InputMaybe<Scalars["BigInt"]>;
  repartitions_lte?: InputMaybe<Scalars["BigInt"]>;
  repartitions_not?: InputMaybe<Scalars["BigInt"]>;
  repartitions_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  tokensAtStakePerJuror?: InputMaybe<Scalars["BigInt"]>;
  tokensAtStakePerJuror_gt?: InputMaybe<Scalars["BigInt"]>;
  tokensAtStakePerJuror_gte?: InputMaybe<Scalars["BigInt"]>;
  tokensAtStakePerJuror_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  tokensAtStakePerJuror_lt?: InputMaybe<Scalars["BigInt"]>;
  tokensAtStakePerJuror_lte?: InputMaybe<Scalars["BigInt"]>;
  tokensAtStakePerJuror_not?: InputMaybe<Scalars["BigInt"]>;
  tokensAtStakePerJuror_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  totalFeesForJurors?: InputMaybe<Scalars["BigInt"]>;
  totalFeesForJurors_gt?: InputMaybe<Scalars["BigInt"]>;
  totalFeesForJurors_gte?: InputMaybe<Scalars["BigInt"]>;
  totalFeesForJurors_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  totalFeesForJurors_lt?: InputMaybe<Scalars["BigInt"]>;
  totalFeesForJurors_lte?: InputMaybe<Scalars["BigInt"]>;
  totalFeesForJurors_not?: InputMaybe<Scalars["BigInt"]>;
  totalFeesForJurors_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
};

export enum Round_OrderBy {
  Dispute = "dispute",
  DisputeKit = "disputeKit",
  DrawnJurors = "drawnJurors",
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
  arbitrated?: Maybe<Arbitrated>;
  arbitrateds: Array<Arbitrated>;
  classicContribution?: Maybe<ClassicContribution>;
  classicContributions: Array<ClassicContribution>;
  classicDispute?: Maybe<ClassicDispute>;
  classicDisputes: Array<ClassicDispute>;
  classicEvidence?: Maybe<ClassicEvidence>;
  classicEvidenceGroup?: Maybe<ClassicEvidenceGroup>;
  classicEvidenceGroups: Array<ClassicEvidenceGroup>;
  classicEvidences: Array<ClassicEvidence>;
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
  disputes: Array<Dispute>;
  draw?: Maybe<Draw>;
  draws: Array<Draw>;
  evidence?: Maybe<Evidence>;
  evidenceGroup?: Maybe<EvidenceGroup>;
  evidenceGroups: Array<EvidenceGroup>;
  evidences: Array<Evidence>;
  gatewayDispute?: Maybe<GatewayDispute>;
  gatewayDisputes: Array<GatewayDispute>;
  jurorTokensPerCourt?: Maybe<JurorTokensPerCourt>;
  jurorTokensPerCourts: Array<JurorTokensPerCourt>;
  outgoingBatch?: Maybe<OutgoingBatch>;
  outgoingBatches: Array<OutgoingBatch>;
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

export type SubscriptionArbitratedArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionArbitratedsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Arbitrated_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Arbitrated_Filter>;
};

export type SubscriptionClassicContributionArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionClassicContributionsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<ClassicContribution_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ClassicContribution_Filter>;
};

export type SubscriptionClassicDisputeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionClassicDisputesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<ClassicDispute_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ClassicDispute_Filter>;
};

export type SubscriptionClassicEvidenceArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionClassicEvidenceGroupArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionClassicEvidenceGroupsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<ClassicEvidenceGroup_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ClassicEvidenceGroup_Filter>;
};

export type SubscriptionClassicEvidencesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<ClassicEvidence_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ClassicEvidence_Filter>;
};

export type SubscriptionClassicRoundArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionClassicRoundsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<ClassicRound_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ClassicRound_Filter>;
};

export type SubscriptionClassicVoteArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionClassicVotesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<ClassicVote_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ClassicVote_Filter>;
};

export type SubscriptionContributionArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionContributionsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Contribution_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Contribution_Filter>;
};

export type SubscriptionCounterArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionCountersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Counter_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Counter_Filter>;
};

export type SubscriptionCourtArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionCourtsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Court_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Court_Filter>;
};

export type SubscriptionDisputeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionDisputeKitArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionDisputeKitDisputeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionDisputeKitDisputesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<DisputeKitDispute_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DisputeKitDispute_Filter>;
};

export type SubscriptionDisputeKitRoundArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionDisputeKitRoundsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<DisputeKitRound_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DisputeKitRound_Filter>;
};

export type SubscriptionDisputeKitsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<DisputeKit_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DisputeKit_Filter>;
};

export type SubscriptionDisputesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Dispute_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Dispute_Filter>;
};

export type SubscriptionDrawArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionDrawsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Draw_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Draw_Filter>;
};

export type SubscriptionEvidenceArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionEvidenceGroupArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionEvidenceGroupsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<EvidenceGroup_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<EvidenceGroup_Filter>;
};

export type SubscriptionEvidencesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Evidence_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Evidence_Filter>;
};

export type SubscriptionGatewayDisputeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionGatewayDisputesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<GatewayDispute_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<GatewayDispute_Filter>;
};

export type SubscriptionJurorTokensPerCourtArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionJurorTokensPerCourtsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<JurorTokensPerCourt_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<JurorTokensPerCourt_Filter>;
};

export type SubscriptionOutgoingBatchArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionOutgoingBatchesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<OutgoingBatch_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<OutgoingBatch_Filter>;
};

export type SubscriptionRoundArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionRoundsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Round_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Round_Filter>;
};

export type SubscriptionTokenAndEthShiftArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionTokenAndEthShiftsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<TokenAndEthShift_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<TokenAndEthShift_Filter>;
};

export type SubscriptionUserArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionUsersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<User_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<User_Filter>;
};

export type SubscriptionVoteArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionVotesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Vote_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Vote_Filter>;
};

export type TokenAndEthShift = {
  __typename?: "TokenAndETHShift";
  dispute: Dispute;
  ethAmount: Scalars["BigInt"];
  id: Scalars["ID"];
  juror: User;
  tokenAmount: Scalars["BigInt"];
};

export type TokenAndEthShift_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  dispute?: InputMaybe<Scalars["String"]>;
  dispute_?: InputMaybe<Dispute_Filter>;
  dispute_contains?: InputMaybe<Scalars["String"]>;
  dispute_contains_nocase?: InputMaybe<Scalars["String"]>;
  dispute_ends_with?: InputMaybe<Scalars["String"]>;
  dispute_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  dispute_gt?: InputMaybe<Scalars["String"]>;
  dispute_gte?: InputMaybe<Scalars["String"]>;
  dispute_in?: InputMaybe<Array<Scalars["String"]>>;
  dispute_lt?: InputMaybe<Scalars["String"]>;
  dispute_lte?: InputMaybe<Scalars["String"]>;
  dispute_not?: InputMaybe<Scalars["String"]>;
  dispute_not_contains?: InputMaybe<Scalars["String"]>;
  dispute_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  dispute_not_ends_with?: InputMaybe<Scalars["String"]>;
  dispute_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  dispute_not_in?: InputMaybe<Array<Scalars["String"]>>;
  dispute_not_starts_with?: InputMaybe<Scalars["String"]>;
  dispute_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  dispute_starts_with?: InputMaybe<Scalars["String"]>;
  dispute_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  ethAmount?: InputMaybe<Scalars["BigInt"]>;
  ethAmount_gt?: InputMaybe<Scalars["BigInt"]>;
  ethAmount_gte?: InputMaybe<Scalars["BigInt"]>;
  ethAmount_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  ethAmount_lt?: InputMaybe<Scalars["BigInt"]>;
  ethAmount_lte?: InputMaybe<Scalars["BigInt"]>;
  ethAmount_not?: InputMaybe<Scalars["BigInt"]>;
  ethAmount_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  id?: InputMaybe<Scalars["ID"]>;
  id_gt?: InputMaybe<Scalars["ID"]>;
  id_gte?: InputMaybe<Scalars["ID"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]>>;
  id_lt?: InputMaybe<Scalars["ID"]>;
  id_lte?: InputMaybe<Scalars["ID"]>;
  id_not?: InputMaybe<Scalars["ID"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]>>;
  juror?: InputMaybe<Scalars["String"]>;
  juror_?: InputMaybe<User_Filter>;
  juror_contains?: InputMaybe<Scalars["String"]>;
  juror_contains_nocase?: InputMaybe<Scalars["String"]>;
  juror_ends_with?: InputMaybe<Scalars["String"]>;
  juror_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  juror_gt?: InputMaybe<Scalars["String"]>;
  juror_gte?: InputMaybe<Scalars["String"]>;
  juror_in?: InputMaybe<Array<Scalars["String"]>>;
  juror_lt?: InputMaybe<Scalars["String"]>;
  juror_lte?: InputMaybe<Scalars["String"]>;
  juror_not?: InputMaybe<Scalars["String"]>;
  juror_not_contains?: InputMaybe<Scalars["String"]>;
  juror_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  juror_not_ends_with?: InputMaybe<Scalars["String"]>;
  juror_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  juror_not_in?: InputMaybe<Array<Scalars["String"]>>;
  juror_not_starts_with?: InputMaybe<Scalars["String"]>;
  juror_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  juror_starts_with?: InputMaybe<Scalars["String"]>;
  juror_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  tokenAmount?: InputMaybe<Scalars["BigInt"]>;
  tokenAmount_gt?: InputMaybe<Scalars["BigInt"]>;
  tokenAmount_gte?: InputMaybe<Scalars["BigInt"]>;
  tokenAmount_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  tokenAmount_lt?: InputMaybe<Scalars["BigInt"]>;
  tokenAmount_lte?: InputMaybe<Scalars["BigInt"]>;
  tokenAmount_not?: InputMaybe<Scalars["BigInt"]>;
  tokenAmount_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
};

export enum TokenAndEthShift_OrderBy {
  Dispute = "dispute",
  EthAmount = "ethAmount",
  Id = "id",
  Juror = "juror",
  TokenAmount = "tokenAmount",
}

export type User = {
  __typename?: "User";
  contributions: Array<Contribution>;
  draws: Array<Draw>;
  evidences: Array<Evidence>;
  id: Scalars["ID"];
  shifts: Array<TokenAndEthShift>;
  tokens: Array<JurorTokensPerCourt>;
  totalStake: Scalars["BigInt"];
  votes: Array<Vote>;
};

export type UserContributionsArgs = {
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Contribution_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  where?: InputMaybe<Contribution_Filter>;
};

export type UserDrawsArgs = {
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Draw_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  where?: InputMaybe<Draw_Filter>;
};

export type UserEvidencesArgs = {
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Evidence_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  where?: InputMaybe<Evidence_Filter>;
};

export type UserShiftsArgs = {
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<TokenAndEthShift_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  where?: InputMaybe<TokenAndEthShift_Filter>;
};

export type UserTokensArgs = {
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<JurorTokensPerCourt_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  where?: InputMaybe<JurorTokensPerCourt_Filter>;
};

export type UserVotesArgs = {
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Vote_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  where?: InputMaybe<Vote_Filter>;
};

export type User_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  contributions_?: InputMaybe<Contribution_Filter>;
  draws_?: InputMaybe<Draw_Filter>;
  evidences_?: InputMaybe<Evidence_Filter>;
  id?: InputMaybe<Scalars["ID"]>;
  id_gt?: InputMaybe<Scalars["ID"]>;
  id_gte?: InputMaybe<Scalars["ID"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]>>;
  id_lt?: InputMaybe<Scalars["ID"]>;
  id_lte?: InputMaybe<Scalars["ID"]>;
  id_not?: InputMaybe<Scalars["ID"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]>>;
  shifts_?: InputMaybe<TokenAndEthShift_Filter>;
  tokens_?: InputMaybe<JurorTokensPerCourt_Filter>;
  totalStake?: InputMaybe<Scalars["BigInt"]>;
  totalStake_gt?: InputMaybe<Scalars["BigInt"]>;
  totalStake_gte?: InputMaybe<Scalars["BigInt"]>;
  totalStake_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  totalStake_lt?: InputMaybe<Scalars["BigInt"]>;
  totalStake_lte?: InputMaybe<Scalars["BigInt"]>;
  totalStake_not?: InputMaybe<Scalars["BigInt"]>;
  totalStake_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  votes_?: InputMaybe<Vote_Filter>;
};

export enum User_OrderBy {
  Contributions = "contributions",
  Draws = "draws",
  Evidences = "evidences",
  Id = "id",
  Shifts = "shifts",
  Tokens = "tokens",
  TotalStake = "totalStake",
  Votes = "votes",
}

export type Vote = {
  coreDispute: Dispute;
  id: Scalars["ID"];
  juror: User;
  localRound: DisputeKitRound;
};

export type Vote_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  coreDispute?: InputMaybe<Scalars["String"]>;
  coreDispute_?: InputMaybe<Dispute_Filter>;
  coreDispute_contains?: InputMaybe<Scalars["String"]>;
  coreDispute_contains_nocase?: InputMaybe<Scalars["String"]>;
  coreDispute_ends_with?: InputMaybe<Scalars["String"]>;
  coreDispute_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  coreDispute_gt?: InputMaybe<Scalars["String"]>;
  coreDispute_gte?: InputMaybe<Scalars["String"]>;
  coreDispute_in?: InputMaybe<Array<Scalars["String"]>>;
  coreDispute_lt?: InputMaybe<Scalars["String"]>;
  coreDispute_lte?: InputMaybe<Scalars["String"]>;
  coreDispute_not?: InputMaybe<Scalars["String"]>;
  coreDispute_not_contains?: InputMaybe<Scalars["String"]>;
  coreDispute_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  coreDispute_not_ends_with?: InputMaybe<Scalars["String"]>;
  coreDispute_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  coreDispute_not_in?: InputMaybe<Array<Scalars["String"]>>;
  coreDispute_not_starts_with?: InputMaybe<Scalars["String"]>;
  coreDispute_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  coreDispute_starts_with?: InputMaybe<Scalars["String"]>;
  coreDispute_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  id?: InputMaybe<Scalars["ID"]>;
  id_gt?: InputMaybe<Scalars["ID"]>;
  id_gte?: InputMaybe<Scalars["ID"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]>>;
  id_lt?: InputMaybe<Scalars["ID"]>;
  id_lte?: InputMaybe<Scalars["ID"]>;
  id_not?: InputMaybe<Scalars["ID"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]>>;
  juror?: InputMaybe<Scalars["String"]>;
  juror_?: InputMaybe<User_Filter>;
  juror_contains?: InputMaybe<Scalars["String"]>;
  juror_contains_nocase?: InputMaybe<Scalars["String"]>;
  juror_ends_with?: InputMaybe<Scalars["String"]>;
  juror_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  juror_gt?: InputMaybe<Scalars["String"]>;
  juror_gte?: InputMaybe<Scalars["String"]>;
  juror_in?: InputMaybe<Array<Scalars["String"]>>;
  juror_lt?: InputMaybe<Scalars["String"]>;
  juror_lte?: InputMaybe<Scalars["String"]>;
  juror_not?: InputMaybe<Scalars["String"]>;
  juror_not_contains?: InputMaybe<Scalars["String"]>;
  juror_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  juror_not_ends_with?: InputMaybe<Scalars["String"]>;
  juror_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  juror_not_in?: InputMaybe<Array<Scalars["String"]>>;
  juror_not_starts_with?: InputMaybe<Scalars["String"]>;
  juror_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  juror_starts_with?: InputMaybe<Scalars["String"]>;
  juror_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  localRound?: InputMaybe<Scalars["String"]>;
  localRound_?: InputMaybe<DisputeKitRound_Filter>;
  localRound_contains?: InputMaybe<Scalars["String"]>;
  localRound_contains_nocase?: InputMaybe<Scalars["String"]>;
  localRound_ends_with?: InputMaybe<Scalars["String"]>;
  localRound_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  localRound_gt?: InputMaybe<Scalars["String"]>;
  localRound_gte?: InputMaybe<Scalars["String"]>;
  localRound_in?: InputMaybe<Array<Scalars["String"]>>;
  localRound_lt?: InputMaybe<Scalars["String"]>;
  localRound_lte?: InputMaybe<Scalars["String"]>;
  localRound_not?: InputMaybe<Scalars["String"]>;
  localRound_not_contains?: InputMaybe<Scalars["String"]>;
  localRound_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  localRound_not_ends_with?: InputMaybe<Scalars["String"]>;
  localRound_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  localRound_not_in?: InputMaybe<Array<Scalars["String"]>>;
  localRound_not_starts_with?: InputMaybe<Scalars["String"]>;
  localRound_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  localRound_starts_with?: InputMaybe<Scalars["String"]>;
  localRound_starts_with_nocase?: InputMaybe<Scalars["String"]>;
};

export enum Vote_OrderBy {
  CoreDispute = "coreDispute",
  Id = "id",
  Juror = "juror",
  LocalRound = "localRound",
}

export type _Block_ = {
  __typename?: "_Block_";
  /** The hash of the block */
  hash?: Maybe<Scalars["Bytes"]>;
  /** The block number */
  number: Scalars["Int"];
  /** Integer representation of the timestamp stored in blocks for the chain */
  timestamp?: Maybe<Scalars["Int"]>;
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
  deployment: Scalars["String"];
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars["Boolean"];
};

export enum _SubgraphErrorPolicy_ {
  /** Data will be returned even if the subgraph has indexing errors */
  Allow = "allow",
  /** If the subgraph has indexing errors, data will be omitted. The default. */
  Deny = "deny",
}

export type CasesPageQueryVariables = Exact<{
  skip?: InputMaybe<Scalars["Int"]>;
}>;

export type CasesPageQuery = {
  __typename?: "Query";
  disputes: Array<{
    __typename?: "Dispute";
    id: string;
    period: Period;
    lastPeriodChange: any;
    arbitrated: { __typename?: "Arbitrated"; id: string };
    court: {
      __typename?: "Court";
      id: string;
      policy?: string | null;
      feeForJuror: any;
      timesPerPeriod: Array<any>;
    };
  }>;
  counter?: { __typename?: "Counter"; cases: any } | null;
};

export type CourtPolicyUriQueryVariables = Exact<{
  courtID: Scalars["ID"];
}>;

export type CourtPolicyUriQuery = {
  __typename?: "Query";
  court?: { __typename?: "Court"; policy?: string | null } | null;
};

export type DisputeDetailsQueryVariables = Exact<{
  disputeID: Scalars["ID"];
}>;

export type DisputeDetailsQuery = {
  __typename?: "Query";
  dispute?: {
    __typename?: "Dispute";
    period: Period;
    ruled: boolean;
    lastPeriodChange: any;
    court: {
      __typename?: "Court";
      id: string;
      timesPerPeriod: Array<any>;
      hiddenVotes: boolean;
      feeForJuror: any;
    };
    arbitrated: { __typename?: "Arbitrated"; id: string };
  } | null;
};

export type DrawQueryVariables = Exact<{
  address?: InputMaybe<Scalars["String"]>;
  disputeID?: InputMaybe<Scalars["String"]>;
}>;

export type DrawQuery = {
  __typename?: "Query";
  draws: Array<{ __typename?: "Draw"; voteID: any }>;
};

export type EvidencesQueryVariables = Exact<{
  evidenceGroup?: InputMaybe<Scalars["String"]>;
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
  timeframe?: InputMaybe<Scalars["ID"]>;
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

export type VotingHistoryQueryVariables = Exact<{
  disputeID: Scalars["ID"];
}>;

export type VotingHistoryQuery = {
  __typename?: "Query";
  dispute?: {
    __typename?: "Dispute";
    rounds: Array<{ __typename?: "Round"; nbVotes: any }>;
    disputeKitDispute?: {
      __typename?: "ClassicDispute";
      localRounds: Array<{
        __typename?: "ClassicRound";
        totalVoted: any;
        votes: Array<{
          __typename?: "ClassicVote";
          id: string;
          choice: any;
          justification: string;
          juror: { __typename?: "User"; id: string };
        }>;
      }>;
    } | null;
  } | null;
};
