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

export type ActiveJurorsDataPoint = {
  __typename?: "ActiveJurorsDataPoint";
  id: Scalars["ID"];
  value: Scalars["BigInt"];
};

export type ActiveJurorsDataPoint_Filter = {
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
  value?: InputMaybe<Scalars["BigInt"]>;
  value_gt?: InputMaybe<Scalars["BigInt"]>;
  value_gte?: InputMaybe<Scalars["BigInt"]>;
  value_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  value_lt?: InputMaybe<Scalars["BigInt"]>;
  value_lte?: InputMaybe<Scalars["BigInt"]>;
  value_not?: InputMaybe<Scalars["BigInt"]>;
  value_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
};

export enum ActiveJurorsDataPoint_OrderBy {
  Id = "id",
  Value = "value",
}

export type BlockChangedFilter = {
  number_gte: Scalars["Int"];
};

export type Block_Height = {
  hash?: InputMaybe<Scalars["Bytes"]>;
  number?: InputMaybe<Scalars["Int"]>;
  number_gte?: InputMaybe<Scalars["Int"]>;
};

export type CasesDataPoint = {
  __typename?: "CasesDataPoint";
  id: Scalars["ID"];
  value: Scalars["BigInt"];
};

export type CasesDataPoint_Filter = {
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
  value?: InputMaybe<Scalars["BigInt"]>;
  value_gt?: InputMaybe<Scalars["BigInt"]>;
  value_gte?: InputMaybe<Scalars["BigInt"]>;
  value_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  value_lt?: InputMaybe<Scalars["BigInt"]>;
  value_lte?: InputMaybe<Scalars["BigInt"]>;
  value_not?: InputMaybe<Scalars["BigInt"]>;
  value_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
};

export enum CasesDataPoint_OrderBy {
  Id = "id",
  Value = "value",
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
  parent?: Maybe<Court>;
  policy?: Maybe<Scalars["String"]>;
  stakedJurors: Array<JurorTokensPerSubcourt>;
  supportedDisputeKits: Array<DisputeKit>;
  timesPerPeriod: Array<Scalars["BigInt"]>;
  tokens: Array<JurorTokensPerSubcourt>;
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
  orderBy?: InputMaybe<JurorTokensPerSubcourt_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  where?: InputMaybe<JurorTokensPerSubcourt_Filter>;
};

export type CourtSupportedDisputeKitsArgs = {
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<DisputeKit_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  where?: InputMaybe<DisputeKit_Filter>;
};

export type CourtTokensArgs = {
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<JurorTokensPerSubcourt_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  where?: InputMaybe<JurorTokensPerSubcourt_Filter>;
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
  stakedJurors_?: InputMaybe<JurorTokensPerSubcourt_Filter>;
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
  tokens_?: InputMaybe<JurorTokensPerSubcourt_Filter>;
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
  Parent = "parent",
  Policy = "policy",
  StakedJurors = "stakedJurors",
  SupportedDisputeKits = "supportedDisputeKits",
  TimesPerPeriod = "timesPerPeriod",
  Tokens = "tokens",
}

export type Dispute = {
  __typename?: "Dispute";
  arbitrated: Scalars["Bytes"];
  currentRound: Scalars["Int"];
  draws: Array<Draw>;
  gatewayDispute: GatewayDispute;
  id: Scalars["ID"];
  lastPeriodChange: Scalars["BigInt"];
  period: Period;
  rounds: Array<Round>;
  ruled: Scalars["Boolean"];
  shifts: Array<TokenAndEthShift>;
  subcourtID: Court;
  votes: Array<Vote>;
};

export type DisputeDrawsArgs = {
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Draw_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  where?: InputMaybe<Draw_Filter>;
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

export type DisputeVotesArgs = {
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Vote_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  where?: InputMaybe<Vote_Filter>;
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
  arbitrated?: InputMaybe<Scalars["Bytes"]>;
  arbitrated_contains?: InputMaybe<Scalars["Bytes"]>;
  arbitrated_in?: InputMaybe<Array<Scalars["Bytes"]>>;
  arbitrated_not?: InputMaybe<Scalars["Bytes"]>;
  arbitrated_not_contains?: InputMaybe<Scalars["Bytes"]>;
  arbitrated_not_in?: InputMaybe<Array<Scalars["Bytes"]>>;
  currentRound?: InputMaybe<Scalars["Int"]>;
  currentRound_gt?: InputMaybe<Scalars["Int"]>;
  currentRound_gte?: InputMaybe<Scalars["Int"]>;
  currentRound_in?: InputMaybe<Array<Scalars["Int"]>>;
  currentRound_lt?: InputMaybe<Scalars["Int"]>;
  currentRound_lte?: InputMaybe<Scalars["Int"]>;
  currentRound_not?: InputMaybe<Scalars["Int"]>;
  currentRound_not_in?: InputMaybe<Array<Scalars["Int"]>>;
  draws_?: InputMaybe<Draw_Filter>;
  gatewayDispute_?: InputMaybe<GatewayDispute_Filter>;
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
  subcourtID?: InputMaybe<Scalars["String"]>;
  subcourtID_?: InputMaybe<Court_Filter>;
  subcourtID_contains?: InputMaybe<Scalars["String"]>;
  subcourtID_contains_nocase?: InputMaybe<Scalars["String"]>;
  subcourtID_ends_with?: InputMaybe<Scalars["String"]>;
  subcourtID_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  subcourtID_gt?: InputMaybe<Scalars["String"]>;
  subcourtID_gte?: InputMaybe<Scalars["String"]>;
  subcourtID_in?: InputMaybe<Array<Scalars["String"]>>;
  subcourtID_lt?: InputMaybe<Scalars["String"]>;
  subcourtID_lte?: InputMaybe<Scalars["String"]>;
  subcourtID_not?: InputMaybe<Scalars["String"]>;
  subcourtID_not_contains?: InputMaybe<Scalars["String"]>;
  subcourtID_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  subcourtID_not_ends_with?: InputMaybe<Scalars["String"]>;
  subcourtID_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  subcourtID_not_in?: InputMaybe<Array<Scalars["String"]>>;
  subcourtID_not_starts_with?: InputMaybe<Scalars["String"]>;
  subcourtID_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  subcourtID_starts_with?: InputMaybe<Scalars["String"]>;
  subcourtID_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  votes_?: InputMaybe<Vote_Filter>;
};

export enum Dispute_OrderBy {
  Arbitrated = "arbitrated",
  CurrentRound = "currentRound",
  Draws = "draws",
  GatewayDispute = "gatewayDispute",
  Id = "id",
  LastPeriodChange = "lastPeriodChange",
  Period = "period",
  Rounds = "rounds",
  Ruled = "ruled",
  Shifts = "shifts",
  SubcourtId = "subcourtID",
  Votes = "votes",
}

export type Draw = {
  __typename?: "Draw";
  dispute: Dispute;
  id: Scalars["ID"];
  juror: Juror;
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
  juror_?: InputMaybe<Juror_Filter>;
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

export type EthPaidDataPoint = {
  __typename?: "ETHPaidDataPoint";
  id: Scalars["ID"];
  value: Scalars["BigInt"];
};

export type EthPaidDataPoint_Filter = {
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
  value?: InputMaybe<Scalars["BigInt"]>;
  value_gt?: InputMaybe<Scalars["BigInt"]>;
  value_gte?: InputMaybe<Scalars["BigInt"]>;
  value_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  value_lt?: InputMaybe<Scalars["BigInt"]>;
  value_lte?: InputMaybe<Scalars["BigInt"]>;
  value_not?: InputMaybe<Scalars["BigInt"]>;
  value_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
};

export enum EthPaidDataPoint_OrderBy {
  Id = "id",
  Value = "value",
}

export type Evidence = {
  __typename?: "Evidence";
  evidence: Scalars["String"];
  evidenceGroup: EvidenceGroup;
  id: Scalars["ID"];
  sender: Scalars["Bytes"];
};

export type EvidenceGroup = {
  __typename?: "EvidenceGroup";
  evidences: Array<Evidence>;
  id: Scalars["ID"];
  lastEvidenceID: Scalars["BigInt"];
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
  lastEvidenceID?: InputMaybe<Scalars["BigInt"]>;
  lastEvidenceID_gt?: InputMaybe<Scalars["BigInt"]>;
  lastEvidenceID_gte?: InputMaybe<Scalars["BigInt"]>;
  lastEvidenceID_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  lastEvidenceID_lt?: InputMaybe<Scalars["BigInt"]>;
  lastEvidenceID_lte?: InputMaybe<Scalars["BigInt"]>;
  lastEvidenceID_not?: InputMaybe<Scalars["BigInt"]>;
  lastEvidenceID_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
};

export enum EvidenceGroup_OrderBy {
  Evidences = "evidences",
  Id = "id",
  LastEvidenceId = "lastEvidenceID",
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
  sender?: InputMaybe<Scalars["Bytes"]>;
  sender_contains?: InputMaybe<Scalars["Bytes"]>;
  sender_in?: InputMaybe<Array<Scalars["Bytes"]>>;
  sender_not?: InputMaybe<Scalars["Bytes"]>;
  sender_not_contains?: InputMaybe<Scalars["Bytes"]>;
  sender_not_in?: InputMaybe<Array<Scalars["Bytes"]>>;
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

export type Juror = {
  __typename?: "Juror";
  draws: Array<Draw>;
  id: Scalars["ID"];
  shifts: Array<TokenAndEthShift>;
  tokens: Array<JurorTokensPerSubcourt>;
  votes: Array<Vote>;
};

export type JurorDrawsArgs = {
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Draw_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  where?: InputMaybe<Draw_Filter>;
};

export type JurorShiftsArgs = {
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<TokenAndEthShift_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  where?: InputMaybe<TokenAndEthShift_Filter>;
};

export type JurorTokensArgs = {
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<JurorTokensPerSubcourt_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  where?: InputMaybe<JurorTokensPerSubcourt_Filter>;
};

export type JurorVotesArgs = {
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Vote_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  where?: InputMaybe<Vote_Filter>;
};

export type JurorTokensPerSubcourt = {
  __typename?: "JurorTokensPerSubcourt";
  id: Scalars["ID"];
  juror: Juror;
  locked: Scalars["BigInt"];
  staked: Scalars["BigInt"];
  subcourt: Court;
};

export type JurorTokensPerSubcourt_Filter = {
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
  juror?: InputMaybe<Scalars["String"]>;
  juror_?: InputMaybe<Juror_Filter>;
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
  subcourt?: InputMaybe<Scalars["String"]>;
  subcourt_?: InputMaybe<Court_Filter>;
  subcourt_contains?: InputMaybe<Scalars["String"]>;
  subcourt_contains_nocase?: InputMaybe<Scalars["String"]>;
  subcourt_ends_with?: InputMaybe<Scalars["String"]>;
  subcourt_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  subcourt_gt?: InputMaybe<Scalars["String"]>;
  subcourt_gte?: InputMaybe<Scalars["String"]>;
  subcourt_in?: InputMaybe<Array<Scalars["String"]>>;
  subcourt_lt?: InputMaybe<Scalars["String"]>;
  subcourt_lte?: InputMaybe<Scalars["String"]>;
  subcourt_not?: InputMaybe<Scalars["String"]>;
  subcourt_not_contains?: InputMaybe<Scalars["String"]>;
  subcourt_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  subcourt_not_ends_with?: InputMaybe<Scalars["String"]>;
  subcourt_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  subcourt_not_in?: InputMaybe<Array<Scalars["String"]>>;
  subcourt_not_starts_with?: InputMaybe<Scalars["String"]>;
  subcourt_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  subcourt_starts_with?: InputMaybe<Scalars["String"]>;
  subcourt_starts_with_nocase?: InputMaybe<Scalars["String"]>;
};

export enum JurorTokensPerSubcourt_OrderBy {
  Id = "id",
  Juror = "juror",
  Locked = "locked",
  Staked = "staked",
  Subcourt = "subcourt",
}

export type Juror_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  draws_?: InputMaybe<Draw_Filter>;
  id?: InputMaybe<Scalars["ID"]>;
  id_gt?: InputMaybe<Scalars["ID"]>;
  id_gte?: InputMaybe<Scalars["ID"]>;
  id_in?: InputMaybe<Array<Scalars["ID"]>>;
  id_lt?: InputMaybe<Scalars["ID"]>;
  id_lte?: InputMaybe<Scalars["ID"]>;
  id_not?: InputMaybe<Scalars["ID"]>;
  id_not_in?: InputMaybe<Array<Scalars["ID"]>>;
  shifts_?: InputMaybe<TokenAndEthShift_Filter>;
  tokens_?: InputMaybe<JurorTokensPerSubcourt_Filter>;
  votes_?: InputMaybe<Vote_Filter>;
};

export enum Juror_OrderBy {
  Draws = "draws",
  Id = "id",
  Shifts = "shifts",
  Tokens = "tokens",
  Votes = "votes",
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

export type PnkRedistributedDataPoint = {
  __typename?: "PNKRedistributedDataPoint";
  id: Scalars["ID"];
  value: Scalars["BigInt"];
};

export type PnkRedistributedDataPoint_Filter = {
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
  value?: InputMaybe<Scalars["BigInt"]>;
  value_gt?: InputMaybe<Scalars["BigInt"]>;
  value_gte?: InputMaybe<Scalars["BigInt"]>;
  value_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  value_lt?: InputMaybe<Scalars["BigInt"]>;
  value_lte?: InputMaybe<Scalars["BigInt"]>;
  value_not?: InputMaybe<Scalars["BigInt"]>;
  value_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
};

export enum PnkRedistributedDataPoint_OrderBy {
  Id = "id",
  Value = "value",
}

export type PnkStakedDataPoint = {
  __typename?: "PNKStakedDataPoint";
  id: Scalars["ID"];
  value: Scalars["BigInt"];
};

export type PnkStakedDataPoint_Filter = {
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
  value?: InputMaybe<Scalars["BigInt"]>;
  value_gt?: InputMaybe<Scalars["BigInt"]>;
  value_gte?: InputMaybe<Scalars["BigInt"]>;
  value_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  value_lt?: InputMaybe<Scalars["BigInt"]>;
  value_lte?: InputMaybe<Scalars["BigInt"]>;
  value_not?: InputMaybe<Scalars["BigInt"]>;
  value_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
};

export enum PnkStakedDataPoint_OrderBy {
  Id = "id",
  Value = "value",
}

export enum Period {
  Appeal = "Appeal",
  Commit = "Commit",
  Evidence = "Evidence",
  Execution = "Execution",
  Vote = "Vote",
}

export type Query = {
  __typename?: "Query";
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  activeJurorsDataPoint?: Maybe<ActiveJurorsDataPoint>;
  activeJurorsDataPoints: Array<ActiveJurorsDataPoint>;
  casesDataPoint?: Maybe<CasesDataPoint>;
  casesDataPoints: Array<CasesDataPoint>;
  court?: Maybe<Court>;
  courts: Array<Court>;
  dispute?: Maybe<Dispute>;
  disputeKit?: Maybe<DisputeKit>;
  disputeKits: Array<DisputeKit>;
  disputes: Array<Dispute>;
  draw?: Maybe<Draw>;
  draws: Array<Draw>;
  ethpaidDataPoint?: Maybe<EthPaidDataPoint>;
  ethpaidDataPoints: Array<EthPaidDataPoint>;
  evidence?: Maybe<Evidence>;
  evidenceGroup?: Maybe<EvidenceGroup>;
  evidenceGroups: Array<EvidenceGroup>;
  evidences: Array<Evidence>;
  gatewayDispute?: Maybe<GatewayDispute>;
  gatewayDisputes: Array<GatewayDispute>;
  juror?: Maybe<Juror>;
  jurorTokensPerSubcourt?: Maybe<JurorTokensPerSubcourt>;
  jurorTokensPerSubcourts: Array<JurorTokensPerSubcourt>;
  jurors: Array<Juror>;
  outgoingBatch?: Maybe<OutgoingBatch>;
  outgoingBatches: Array<OutgoingBatch>;
  pnkredistributedDataPoint?: Maybe<PnkRedistributedDataPoint>;
  pnkredistributedDataPoints: Array<PnkRedistributedDataPoint>;
  pnkstakedDataPoint?: Maybe<PnkStakedDataPoint>;
  pnkstakedDataPoints: Array<PnkStakedDataPoint>;
  round?: Maybe<Round>;
  rounds: Array<Round>;
  tokenAndETHShift?: Maybe<TokenAndEthShift>;
  tokenAndETHShifts: Array<TokenAndEthShift>;
  vote?: Maybe<Vote>;
  votes: Array<Vote>;
};

export type Query_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};

export type QueryActiveJurorsDataPointArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryActiveJurorsDataPointsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<ActiveJurorsDataPoint_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ActiveJurorsDataPoint_Filter>;
};

export type QueryCasesDataPointArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryCasesDataPointsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<CasesDataPoint_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<CasesDataPoint_Filter>;
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

export type QueryEthpaidDataPointArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryEthpaidDataPointsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<EthPaidDataPoint_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<EthPaidDataPoint_Filter>;
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

export type QueryJurorArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryJurorTokensPerSubcourtArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryJurorTokensPerSubcourtsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<JurorTokensPerSubcourt_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<JurorTokensPerSubcourt_Filter>;
};

export type QueryJurorsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Juror_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Juror_Filter>;
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

export type QueryPnkredistributedDataPointArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryPnkredistributedDataPointsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<PnkRedistributedDataPoint_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<PnkRedistributedDataPoint_Filter>;
};

export type QueryPnkstakedDataPointArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryPnkstakedDataPointsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<PnkStakedDataPoint_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<PnkStakedDataPoint_Filter>;
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
  disputeKitID: DisputeKit;
  drawnJurors: Array<Draw>;
  id: Scalars["ID"];
  nbVotes: Scalars["BigInt"];
  penalties: Scalars["BigInt"];
  repartitions: Scalars["BigInt"];
  tokensAtStakePerJuror: Scalars["BigInt"];
  totalFeesForJurors: Scalars["BigInt"];
  totalVoted: Scalars["BigInt"];
  votes: Array<Vote>;
};

export type RoundDrawnJurorsArgs = {
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Draw_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  where?: InputMaybe<Draw_Filter>;
};

export type RoundVotesArgs = {
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Vote_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  where?: InputMaybe<Vote_Filter>;
};

export type Round_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  dispute?: InputMaybe<Scalars["String"]>;
  disputeKitID?: InputMaybe<Scalars["String"]>;
  disputeKitID_?: InputMaybe<DisputeKit_Filter>;
  disputeKitID_contains?: InputMaybe<Scalars["String"]>;
  disputeKitID_contains_nocase?: InputMaybe<Scalars["String"]>;
  disputeKitID_ends_with?: InputMaybe<Scalars["String"]>;
  disputeKitID_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  disputeKitID_gt?: InputMaybe<Scalars["String"]>;
  disputeKitID_gte?: InputMaybe<Scalars["String"]>;
  disputeKitID_in?: InputMaybe<Array<Scalars["String"]>>;
  disputeKitID_lt?: InputMaybe<Scalars["String"]>;
  disputeKitID_lte?: InputMaybe<Scalars["String"]>;
  disputeKitID_not?: InputMaybe<Scalars["String"]>;
  disputeKitID_not_contains?: InputMaybe<Scalars["String"]>;
  disputeKitID_not_contains_nocase?: InputMaybe<Scalars["String"]>;
  disputeKitID_not_ends_with?: InputMaybe<Scalars["String"]>;
  disputeKitID_not_ends_with_nocase?: InputMaybe<Scalars["String"]>;
  disputeKitID_not_in?: InputMaybe<Array<Scalars["String"]>>;
  disputeKitID_not_starts_with?: InputMaybe<Scalars["String"]>;
  disputeKitID_not_starts_with_nocase?: InputMaybe<Scalars["String"]>;
  disputeKitID_starts_with?: InputMaybe<Scalars["String"]>;
  disputeKitID_starts_with_nocase?: InputMaybe<Scalars["String"]>;
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
  totalVoted?: InputMaybe<Scalars["BigInt"]>;
  totalVoted_gt?: InputMaybe<Scalars["BigInt"]>;
  totalVoted_gte?: InputMaybe<Scalars["BigInt"]>;
  totalVoted_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  totalVoted_lt?: InputMaybe<Scalars["BigInt"]>;
  totalVoted_lte?: InputMaybe<Scalars["BigInt"]>;
  totalVoted_not?: InputMaybe<Scalars["BigInt"]>;
  totalVoted_not_in?: InputMaybe<Array<Scalars["BigInt"]>>;
  votes_?: InputMaybe<Vote_Filter>;
};

export enum Round_OrderBy {
  Dispute = "dispute",
  DisputeKitId = "disputeKitID",
  DrawnJurors = "drawnJurors",
  Id = "id",
  NbVotes = "nbVotes",
  Penalties = "penalties",
  Repartitions = "repartitions",
  TokensAtStakePerJuror = "tokensAtStakePerJuror",
  TotalFeesForJurors = "totalFeesForJurors",
  TotalVoted = "totalVoted",
  Votes = "votes",
}

export type Subscription = {
  __typename?: "Subscription";
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  activeJurorsDataPoint?: Maybe<ActiveJurorsDataPoint>;
  activeJurorsDataPoints: Array<ActiveJurorsDataPoint>;
  casesDataPoint?: Maybe<CasesDataPoint>;
  casesDataPoints: Array<CasesDataPoint>;
  court?: Maybe<Court>;
  courts: Array<Court>;
  dispute?: Maybe<Dispute>;
  disputeKit?: Maybe<DisputeKit>;
  disputeKits: Array<DisputeKit>;
  disputes: Array<Dispute>;
  draw?: Maybe<Draw>;
  draws: Array<Draw>;
  ethpaidDataPoint?: Maybe<EthPaidDataPoint>;
  ethpaidDataPoints: Array<EthPaidDataPoint>;
  evidence?: Maybe<Evidence>;
  evidenceGroup?: Maybe<EvidenceGroup>;
  evidenceGroups: Array<EvidenceGroup>;
  evidences: Array<Evidence>;
  gatewayDispute?: Maybe<GatewayDispute>;
  gatewayDisputes: Array<GatewayDispute>;
  juror?: Maybe<Juror>;
  jurorTokensPerSubcourt?: Maybe<JurorTokensPerSubcourt>;
  jurorTokensPerSubcourts: Array<JurorTokensPerSubcourt>;
  jurors: Array<Juror>;
  outgoingBatch?: Maybe<OutgoingBatch>;
  outgoingBatches: Array<OutgoingBatch>;
  pnkredistributedDataPoint?: Maybe<PnkRedistributedDataPoint>;
  pnkredistributedDataPoints: Array<PnkRedistributedDataPoint>;
  pnkstakedDataPoint?: Maybe<PnkStakedDataPoint>;
  pnkstakedDataPoints: Array<PnkStakedDataPoint>;
  round?: Maybe<Round>;
  rounds: Array<Round>;
  tokenAndETHShift?: Maybe<TokenAndEthShift>;
  tokenAndETHShifts: Array<TokenAndEthShift>;
  vote?: Maybe<Vote>;
  votes: Array<Vote>;
};

export type Subscription_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};

export type SubscriptionActiveJurorsDataPointArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionActiveJurorsDataPointsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<ActiveJurorsDataPoint_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ActiveJurorsDataPoint_Filter>;
};

export type SubscriptionCasesDataPointArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionCasesDataPointsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<CasesDataPoint_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<CasesDataPoint_Filter>;
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

export type SubscriptionEthpaidDataPointArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionEthpaidDataPointsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<EthPaidDataPoint_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<EthPaidDataPoint_Filter>;
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

export type SubscriptionJurorArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionJurorTokensPerSubcourtArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionJurorTokensPerSubcourtsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<JurorTokensPerSubcourt_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<JurorTokensPerSubcourt_Filter>;
};

export type SubscriptionJurorsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<Juror_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Juror_Filter>;
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

export type SubscriptionPnkredistributedDataPointArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionPnkredistributedDataPointsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<PnkRedistributedDataPoint_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<PnkRedistributedDataPoint_Filter>;
};

export type SubscriptionPnkstakedDataPointArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars["ID"];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionPnkstakedDataPointsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<PnkStakedDataPoint_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars["Int"]>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<PnkStakedDataPoint_Filter>;
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
  juror: Juror;
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
  juror_?: InputMaybe<Juror_Filter>;
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

export type Vote = {
  __typename?: "Vote";
  choice?: Maybe<Scalars["BigInt"]>;
  dispute: Dispute;
  id: Scalars["ID"];
  juror: Juror;
  justification?: Maybe<Scalars["String"]>;
  round: Round;
};

export type Vote_Filter = {
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
  juror_?: InputMaybe<Juror_Filter>;
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
};

export enum Vote_OrderBy {
  Choice = "choice",
  Dispute = "dispute",
  Id = "id",
  Juror = "juror",
  Justification = "justification",
  Round = "round",
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
    arbitrated: any;
    period: Period;
    lastPeriodChange: any;
    subcourtID: {
      __typename?: "Court";
      id: string;
      policy?: string | null;
      feeForJuror: any;
      timesPerPeriod: Array<any>;
    };
  }>;
  casesDataPoint?: { __typename?: "CasesDataPoint"; value: any } | null;
};

export type DisputeDetailsQueryVariables = Exact<{
  disputeID: Scalars["ID"];
}>;

export type DisputeDetailsQuery = {
  __typename?: "Query";
  dispute?: {
    __typename?: "Dispute";
    arbitrated: any;
    period: Period;
    ruled: boolean;
    lastPeriodChange: any;
    subcourtID: {
      __typename?: "Court";
      id: string;
      timesPerPeriod: Array<any>;
      hiddenVotes: boolean;
      feeForJuror: any;
    };
  } | null;
};

export type DrawQueryVariables = Exact<{
  address?: InputMaybe<Scalars["String"]>;
  disputeID?: InputMaybe<Scalars["String"]>;
}>;

export type DrawQuery = {
  __typename?: "Query";
  draws: Array<{ __typename?: "Draw"; voteID: any }>;
  votes: Array<{ __typename?: "Vote"; id: string }>;
};

export type EvidencesQueryVariables = Exact<{
  evidenceGroup?: InputMaybe<Scalars["String"]>;
}>;

export type EvidencesQuery = {
  __typename?: "Query";
  evidences: Array<{
    __typename?: "Evidence";
    id: string;
    evidence: string;
    sender: any;
  }>;
};

export type HomePageQueryVariables = Exact<{
  timeframe?: InputMaybe<Scalars["ID"]>;
}>;

export type HomePageQuery = {
  __typename?: "Query";
  disputes: Array<{ __typename?: "Dispute"; id: string }>;
  pnkstakedDataPoints: Array<{
    __typename?: "PNKStakedDataPoint";
    id: string;
    value: any;
  }>;
  ethpaidDataPoints: Array<{
    __typename?: "ETHPaidDataPoint";
    id: string;
    value: any;
  }>;
  pnkredistributedDataPoints: Array<{
    __typename?: "PNKRedistributedDataPoint";
    id: string;
    value: any;
  }>;
  activeJurorsDataPoints: Array<{
    __typename?: "ActiveJurorsDataPoint";
    id: string;
    value: any;
  }>;
  casesDataPoints: Array<{
    __typename?: "CasesDataPoint";
    id: string;
    value: any;
  }>;
};

export type VotingHistoryQueryVariables = Exact<{
  disputeID: Scalars["ID"];
}>;

export type VotingHistoryQuery = {
  __typename?: "Query";
  dispute?: {
    __typename?: "Dispute";
    rounds: Array<{
      __typename?: "Round";
      nbVotes: any;
      totalVoted: any;
      votes: Array<{
        __typename?: "Vote";
        choice?: any | null;
        justification?: string | null;
        juror: { __typename?: "Juror"; id: string };
      }>;
    }>;
  } | null;
};
