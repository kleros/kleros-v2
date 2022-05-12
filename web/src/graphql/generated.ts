export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
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
  __typename?: 'ActiveJurorsDataPoint';
  id: Scalars['ID'];
  value: Scalars['BigInt'];
};

export type ActiveJurorsDataPoint_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  value?: InputMaybe<Scalars['BigInt']>;
  value_gt?: InputMaybe<Scalars['BigInt']>;
  value_gte?: InputMaybe<Scalars['BigInt']>;
  value_in?: InputMaybe<Array<Scalars['BigInt']>>;
  value_lt?: InputMaybe<Scalars['BigInt']>;
  value_lte?: InputMaybe<Scalars['BigInt']>;
  value_not?: InputMaybe<Scalars['BigInt']>;
  value_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum ActiveJurorsDataPoint_OrderBy {
  Id = 'id',
  Value = 'value'
}

export type BlockChangedFilter = {
  number_gte: Scalars['Int'];
};

export type Block_Height = {
  hash?: InputMaybe<Scalars['Bytes']>;
  number?: InputMaybe<Scalars['Int']>;
  number_gte?: InputMaybe<Scalars['Int']>;
};

export type CasesDataPoint = {
  __typename?: 'CasesDataPoint';
  id: Scalars['ID'];
  value: Scalars['BigInt'];
};

export type CasesDataPoint_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  value?: InputMaybe<Scalars['BigInt']>;
  value_gt?: InputMaybe<Scalars['BigInt']>;
  value_gte?: InputMaybe<Scalars['BigInt']>;
  value_in?: InputMaybe<Array<Scalars['BigInt']>>;
  value_lt?: InputMaybe<Scalars['BigInt']>;
  value_lte?: InputMaybe<Scalars['BigInt']>;
  value_not?: InputMaybe<Scalars['BigInt']>;
  value_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum CasesDataPoint_OrderBy {
  Id = 'id',
  Value = 'value'
}

export type Court = {
  __typename?: 'Court';
  alpha: Scalars['BigInt'];
  children: Array<Court>;
  childrenIDs: Array<Scalars['String']>;
  disputes: Array<Dispute>;
  feeForJuror: Scalars['BigInt'];
  hiddenVotes: Scalars['Boolean'];
  id: Scalars['ID'];
  jurorsForCourtJump: Scalars['BigInt'];
  minStake: Scalars['BigInt'];
  stakedJurors: Array<JurorTokensPerSubcourt>;
  supportedDisputeKits: Scalars['BigInt'];
  timesPerPeriod: Array<Scalars['BigInt']>;
  tokens: Array<JurorTokensPerSubcourt>;
};


export type CourtChildrenArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Court_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Court_Filter>;
};


export type CourtDisputesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Dispute_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Dispute_Filter>;
};


export type CourtStakedJurorsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<JurorTokensPerSubcourt_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<JurorTokensPerSubcourt_Filter>;
};


export type CourtTokensArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<JurorTokensPerSubcourt_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<JurorTokensPerSubcourt_Filter>;
};

export type Court_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  alpha?: InputMaybe<Scalars['BigInt']>;
  alpha_gt?: InputMaybe<Scalars['BigInt']>;
  alpha_gte?: InputMaybe<Scalars['BigInt']>;
  alpha_in?: InputMaybe<Array<Scalars['BigInt']>>;
  alpha_lt?: InputMaybe<Scalars['BigInt']>;
  alpha_lte?: InputMaybe<Scalars['BigInt']>;
  alpha_not?: InputMaybe<Scalars['BigInt']>;
  alpha_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  children?: InputMaybe<Array<Scalars['String']>>;
  childrenIDs?: InputMaybe<Array<Scalars['String']>>;
  childrenIDs_contains?: InputMaybe<Array<Scalars['String']>>;
  childrenIDs_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  childrenIDs_not?: InputMaybe<Array<Scalars['String']>>;
  childrenIDs_not_contains?: InputMaybe<Array<Scalars['String']>>;
  childrenIDs_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  children_contains?: InputMaybe<Array<Scalars['String']>>;
  children_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  children_not?: InputMaybe<Array<Scalars['String']>>;
  children_not_contains?: InputMaybe<Array<Scalars['String']>>;
  children_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  feeForJuror?: InputMaybe<Scalars['BigInt']>;
  feeForJuror_gt?: InputMaybe<Scalars['BigInt']>;
  feeForJuror_gte?: InputMaybe<Scalars['BigInt']>;
  feeForJuror_in?: InputMaybe<Array<Scalars['BigInt']>>;
  feeForJuror_lt?: InputMaybe<Scalars['BigInt']>;
  feeForJuror_lte?: InputMaybe<Scalars['BigInt']>;
  feeForJuror_not?: InputMaybe<Scalars['BigInt']>;
  feeForJuror_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  hiddenVotes?: InputMaybe<Scalars['Boolean']>;
  hiddenVotes_in?: InputMaybe<Array<Scalars['Boolean']>>;
  hiddenVotes_not?: InputMaybe<Scalars['Boolean']>;
  hiddenVotes_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  jurorsForCourtJump?: InputMaybe<Scalars['BigInt']>;
  jurorsForCourtJump_gt?: InputMaybe<Scalars['BigInt']>;
  jurorsForCourtJump_gte?: InputMaybe<Scalars['BigInt']>;
  jurorsForCourtJump_in?: InputMaybe<Array<Scalars['BigInt']>>;
  jurorsForCourtJump_lt?: InputMaybe<Scalars['BigInt']>;
  jurorsForCourtJump_lte?: InputMaybe<Scalars['BigInt']>;
  jurorsForCourtJump_not?: InputMaybe<Scalars['BigInt']>;
  jurorsForCourtJump_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  minStake?: InputMaybe<Scalars['BigInt']>;
  minStake_gt?: InputMaybe<Scalars['BigInt']>;
  minStake_gte?: InputMaybe<Scalars['BigInt']>;
  minStake_in?: InputMaybe<Array<Scalars['BigInt']>>;
  minStake_lt?: InputMaybe<Scalars['BigInt']>;
  minStake_lte?: InputMaybe<Scalars['BigInt']>;
  minStake_not?: InputMaybe<Scalars['BigInt']>;
  minStake_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  supportedDisputeKits?: InputMaybe<Scalars['BigInt']>;
  supportedDisputeKits_gt?: InputMaybe<Scalars['BigInt']>;
  supportedDisputeKits_gte?: InputMaybe<Scalars['BigInt']>;
  supportedDisputeKits_in?: InputMaybe<Array<Scalars['BigInt']>>;
  supportedDisputeKits_lt?: InputMaybe<Scalars['BigInt']>;
  supportedDisputeKits_lte?: InputMaybe<Scalars['BigInt']>;
  supportedDisputeKits_not?: InputMaybe<Scalars['BigInt']>;
  supportedDisputeKits_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timesPerPeriod?: InputMaybe<Array<Scalars['BigInt']>>;
  timesPerPeriod_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  timesPerPeriod_contains_nocase?: InputMaybe<Array<Scalars['BigInt']>>;
  timesPerPeriod_not?: InputMaybe<Array<Scalars['BigInt']>>;
  timesPerPeriod_not_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  timesPerPeriod_not_contains_nocase?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum Court_OrderBy {
  Alpha = 'alpha',
  Children = 'children',
  ChildrenIDs = 'childrenIDs',
  Disputes = 'disputes',
  FeeForJuror = 'feeForJuror',
  HiddenVotes = 'hiddenVotes',
  Id = 'id',
  JurorsForCourtJump = 'jurorsForCourtJump',
  MinStake = 'minStake',
  StakedJurors = 'stakedJurors',
  SupportedDisputeKits = 'supportedDisputeKits',
  TimesPerPeriod = 'timesPerPeriod',
  Tokens = 'tokens'
}

export type Dispute = {
  __typename?: 'Dispute';
  arbitrated: Scalars['Bytes'];
  currentRound: Scalars['Int'];
  disputeKit: Scalars['Bytes'];
  gatewayDispute: GatewayDispute;
  id: Scalars['ID'];
  lastPeriodChange: Scalars['BigInt'];
  nbVotes: Scalars['BigInt'];
  period: Period;
  rounds: Array<Round>;
  ruled: Scalars['Boolean'];
  shifts: Array<TokenAndEthShift>;
  subcourtID: Court;
};


export type DisputeRoundsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Round_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Round_Filter>;
};


export type DisputeShiftsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TokenAndEthShift_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<TokenAndEthShift_Filter>;
};

export type Dispute_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  arbitrated?: InputMaybe<Scalars['Bytes']>;
  arbitrated_contains?: InputMaybe<Scalars['Bytes']>;
  arbitrated_in?: InputMaybe<Array<Scalars['Bytes']>>;
  arbitrated_not?: InputMaybe<Scalars['Bytes']>;
  arbitrated_not_contains?: InputMaybe<Scalars['Bytes']>;
  arbitrated_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  currentRound?: InputMaybe<Scalars['Int']>;
  currentRound_gt?: InputMaybe<Scalars['Int']>;
  currentRound_gte?: InputMaybe<Scalars['Int']>;
  currentRound_in?: InputMaybe<Array<Scalars['Int']>>;
  currentRound_lt?: InputMaybe<Scalars['Int']>;
  currentRound_lte?: InputMaybe<Scalars['Int']>;
  currentRound_not?: InputMaybe<Scalars['Int']>;
  currentRound_not_in?: InputMaybe<Array<Scalars['Int']>>;
  disputeKit?: InputMaybe<Scalars['Bytes']>;
  disputeKit_contains?: InputMaybe<Scalars['Bytes']>;
  disputeKit_in?: InputMaybe<Array<Scalars['Bytes']>>;
  disputeKit_not?: InputMaybe<Scalars['Bytes']>;
  disputeKit_not_contains?: InputMaybe<Scalars['Bytes']>;
  disputeKit_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  lastPeriodChange?: InputMaybe<Scalars['BigInt']>;
  lastPeriodChange_gt?: InputMaybe<Scalars['BigInt']>;
  lastPeriodChange_gte?: InputMaybe<Scalars['BigInt']>;
  lastPeriodChange_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastPeriodChange_lt?: InputMaybe<Scalars['BigInt']>;
  lastPeriodChange_lte?: InputMaybe<Scalars['BigInt']>;
  lastPeriodChange_not?: InputMaybe<Scalars['BigInt']>;
  lastPeriodChange_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  nbVotes?: InputMaybe<Scalars['BigInt']>;
  nbVotes_gt?: InputMaybe<Scalars['BigInt']>;
  nbVotes_gte?: InputMaybe<Scalars['BigInt']>;
  nbVotes_in?: InputMaybe<Array<Scalars['BigInt']>>;
  nbVotes_lt?: InputMaybe<Scalars['BigInt']>;
  nbVotes_lte?: InputMaybe<Scalars['BigInt']>;
  nbVotes_not?: InputMaybe<Scalars['BigInt']>;
  nbVotes_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  period?: InputMaybe<Period>;
  period_in?: InputMaybe<Array<Period>>;
  period_not?: InputMaybe<Period>;
  period_not_in?: InputMaybe<Array<Period>>;
  ruled?: InputMaybe<Scalars['Boolean']>;
  ruled_in?: InputMaybe<Array<Scalars['Boolean']>>;
  ruled_not?: InputMaybe<Scalars['Boolean']>;
  ruled_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  subcourtID?: InputMaybe<Scalars['String']>;
  subcourtID_contains?: InputMaybe<Scalars['String']>;
  subcourtID_contains_nocase?: InputMaybe<Scalars['String']>;
  subcourtID_ends_with?: InputMaybe<Scalars['String']>;
  subcourtID_ends_with_nocase?: InputMaybe<Scalars['String']>;
  subcourtID_gt?: InputMaybe<Scalars['String']>;
  subcourtID_gte?: InputMaybe<Scalars['String']>;
  subcourtID_in?: InputMaybe<Array<Scalars['String']>>;
  subcourtID_lt?: InputMaybe<Scalars['String']>;
  subcourtID_lte?: InputMaybe<Scalars['String']>;
  subcourtID_not?: InputMaybe<Scalars['String']>;
  subcourtID_not_contains?: InputMaybe<Scalars['String']>;
  subcourtID_not_contains_nocase?: InputMaybe<Scalars['String']>;
  subcourtID_not_ends_with?: InputMaybe<Scalars['String']>;
  subcourtID_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  subcourtID_not_in?: InputMaybe<Array<Scalars['String']>>;
  subcourtID_not_starts_with?: InputMaybe<Scalars['String']>;
  subcourtID_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  subcourtID_starts_with?: InputMaybe<Scalars['String']>;
  subcourtID_starts_with_nocase?: InputMaybe<Scalars['String']>;
};

export enum Dispute_OrderBy {
  Arbitrated = 'arbitrated',
  CurrentRound = 'currentRound',
  DisputeKit = 'disputeKit',
  GatewayDispute = 'gatewayDispute',
  Id = 'id',
  LastPeriodChange = 'lastPeriodChange',
  NbVotes = 'nbVotes',
  Period = 'period',
  Rounds = 'rounds',
  Ruled = 'ruled',
  Shifts = 'shifts',
  SubcourtId = 'subcourtID'
}

export type Draw = {
  __typename?: 'Draw';
  id: Scalars['ID'];
  juror: Juror;
  round: Round;
  voteID: Scalars['BigInt'];
};

export type Draw_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  juror?: InputMaybe<Scalars['String']>;
  juror_contains?: InputMaybe<Scalars['String']>;
  juror_contains_nocase?: InputMaybe<Scalars['String']>;
  juror_ends_with?: InputMaybe<Scalars['String']>;
  juror_ends_with_nocase?: InputMaybe<Scalars['String']>;
  juror_gt?: InputMaybe<Scalars['String']>;
  juror_gte?: InputMaybe<Scalars['String']>;
  juror_in?: InputMaybe<Array<Scalars['String']>>;
  juror_lt?: InputMaybe<Scalars['String']>;
  juror_lte?: InputMaybe<Scalars['String']>;
  juror_not?: InputMaybe<Scalars['String']>;
  juror_not_contains?: InputMaybe<Scalars['String']>;
  juror_not_contains_nocase?: InputMaybe<Scalars['String']>;
  juror_not_ends_with?: InputMaybe<Scalars['String']>;
  juror_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  juror_not_in?: InputMaybe<Array<Scalars['String']>>;
  juror_not_starts_with?: InputMaybe<Scalars['String']>;
  juror_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  juror_starts_with?: InputMaybe<Scalars['String']>;
  juror_starts_with_nocase?: InputMaybe<Scalars['String']>;
  round?: InputMaybe<Scalars['String']>;
  round_contains?: InputMaybe<Scalars['String']>;
  round_contains_nocase?: InputMaybe<Scalars['String']>;
  round_ends_with?: InputMaybe<Scalars['String']>;
  round_ends_with_nocase?: InputMaybe<Scalars['String']>;
  round_gt?: InputMaybe<Scalars['String']>;
  round_gte?: InputMaybe<Scalars['String']>;
  round_in?: InputMaybe<Array<Scalars['String']>>;
  round_lt?: InputMaybe<Scalars['String']>;
  round_lte?: InputMaybe<Scalars['String']>;
  round_not?: InputMaybe<Scalars['String']>;
  round_not_contains?: InputMaybe<Scalars['String']>;
  round_not_contains_nocase?: InputMaybe<Scalars['String']>;
  round_not_ends_with?: InputMaybe<Scalars['String']>;
  round_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  round_not_in?: InputMaybe<Array<Scalars['String']>>;
  round_not_starts_with?: InputMaybe<Scalars['String']>;
  round_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  round_starts_with?: InputMaybe<Scalars['String']>;
  round_starts_with_nocase?: InputMaybe<Scalars['String']>;
  voteID?: InputMaybe<Scalars['BigInt']>;
  voteID_gt?: InputMaybe<Scalars['BigInt']>;
  voteID_gte?: InputMaybe<Scalars['BigInt']>;
  voteID_in?: InputMaybe<Array<Scalars['BigInt']>>;
  voteID_lt?: InputMaybe<Scalars['BigInt']>;
  voteID_lte?: InputMaybe<Scalars['BigInt']>;
  voteID_not?: InputMaybe<Scalars['BigInt']>;
  voteID_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum Draw_OrderBy {
  Id = 'id',
  Juror = 'juror',
  Round = 'round',
  VoteId = 'voteID'
}

export type EthPaidDataPoint = {
  __typename?: 'ETHPaidDataPoint';
  id: Scalars['ID'];
  value: Scalars['BigInt'];
};

export type EthPaidDataPoint_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  value?: InputMaybe<Scalars['BigInt']>;
  value_gt?: InputMaybe<Scalars['BigInt']>;
  value_gte?: InputMaybe<Scalars['BigInt']>;
  value_in?: InputMaybe<Array<Scalars['BigInt']>>;
  value_lt?: InputMaybe<Scalars['BigInt']>;
  value_lte?: InputMaybe<Scalars['BigInt']>;
  value_not?: InputMaybe<Scalars['BigInt']>;
  value_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum EthPaidDataPoint_OrderBy {
  Id = 'id',
  Value = 'value'
}

export type GatewayDispute = {
  __typename?: 'GatewayDispute';
  arbitrationCost: Scalars['BigInt'];
  arbitrator: Scalars['Bytes'];
  disputeHash: Scalars['Bytes'];
  homeDispute: Dispute;
  id: Scalars['ID'];
  relayer: Scalars['Bytes'];
};

export type GatewayDispute_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  arbitrationCost?: InputMaybe<Scalars['BigInt']>;
  arbitrationCost_gt?: InputMaybe<Scalars['BigInt']>;
  arbitrationCost_gte?: InputMaybe<Scalars['BigInt']>;
  arbitrationCost_in?: InputMaybe<Array<Scalars['BigInt']>>;
  arbitrationCost_lt?: InputMaybe<Scalars['BigInt']>;
  arbitrationCost_lte?: InputMaybe<Scalars['BigInt']>;
  arbitrationCost_not?: InputMaybe<Scalars['BigInt']>;
  arbitrationCost_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  arbitrator?: InputMaybe<Scalars['Bytes']>;
  arbitrator_contains?: InputMaybe<Scalars['Bytes']>;
  arbitrator_in?: InputMaybe<Array<Scalars['Bytes']>>;
  arbitrator_not?: InputMaybe<Scalars['Bytes']>;
  arbitrator_not_contains?: InputMaybe<Scalars['Bytes']>;
  arbitrator_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  disputeHash?: InputMaybe<Scalars['Bytes']>;
  disputeHash_contains?: InputMaybe<Scalars['Bytes']>;
  disputeHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  disputeHash_not?: InputMaybe<Scalars['Bytes']>;
  disputeHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  disputeHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  homeDispute?: InputMaybe<Scalars['String']>;
  homeDispute_contains?: InputMaybe<Scalars['String']>;
  homeDispute_contains_nocase?: InputMaybe<Scalars['String']>;
  homeDispute_ends_with?: InputMaybe<Scalars['String']>;
  homeDispute_ends_with_nocase?: InputMaybe<Scalars['String']>;
  homeDispute_gt?: InputMaybe<Scalars['String']>;
  homeDispute_gte?: InputMaybe<Scalars['String']>;
  homeDispute_in?: InputMaybe<Array<Scalars['String']>>;
  homeDispute_lt?: InputMaybe<Scalars['String']>;
  homeDispute_lte?: InputMaybe<Scalars['String']>;
  homeDispute_not?: InputMaybe<Scalars['String']>;
  homeDispute_not_contains?: InputMaybe<Scalars['String']>;
  homeDispute_not_contains_nocase?: InputMaybe<Scalars['String']>;
  homeDispute_not_ends_with?: InputMaybe<Scalars['String']>;
  homeDispute_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  homeDispute_not_in?: InputMaybe<Array<Scalars['String']>>;
  homeDispute_not_starts_with?: InputMaybe<Scalars['String']>;
  homeDispute_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  homeDispute_starts_with?: InputMaybe<Scalars['String']>;
  homeDispute_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  relayer?: InputMaybe<Scalars['Bytes']>;
  relayer_contains?: InputMaybe<Scalars['Bytes']>;
  relayer_in?: InputMaybe<Array<Scalars['Bytes']>>;
  relayer_not?: InputMaybe<Scalars['Bytes']>;
  relayer_not_contains?: InputMaybe<Scalars['Bytes']>;
  relayer_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
};

export enum GatewayDispute_OrderBy {
  ArbitrationCost = 'arbitrationCost',
  Arbitrator = 'arbitrator',
  DisputeHash = 'disputeHash',
  HomeDispute = 'homeDispute',
  Id = 'id',
  Relayer = 'relayer'
}

export type Juror = {
  __typename?: 'Juror';
  draws: Array<Draw>;
  id: Scalars['ID'];
  shifts: Array<TokenAndEthShift>;
  tokens: Array<JurorTokensPerSubcourt>;
};


export type JurorDrawsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Draw_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Draw_Filter>;
};


export type JurorShiftsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TokenAndEthShift_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<TokenAndEthShift_Filter>;
};


export type JurorTokensArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<JurorTokensPerSubcourt_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<JurorTokensPerSubcourt_Filter>;
};

export type JurorTokensPerSubcourt = {
  __typename?: 'JurorTokensPerSubcourt';
  id: Scalars['ID'];
  juror: Juror;
  locked: Scalars['BigInt'];
  staked: Scalars['BigInt'];
  subcourt: Court;
};

export type JurorTokensPerSubcourt_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  juror?: InputMaybe<Scalars['String']>;
  juror_contains?: InputMaybe<Scalars['String']>;
  juror_contains_nocase?: InputMaybe<Scalars['String']>;
  juror_ends_with?: InputMaybe<Scalars['String']>;
  juror_ends_with_nocase?: InputMaybe<Scalars['String']>;
  juror_gt?: InputMaybe<Scalars['String']>;
  juror_gte?: InputMaybe<Scalars['String']>;
  juror_in?: InputMaybe<Array<Scalars['String']>>;
  juror_lt?: InputMaybe<Scalars['String']>;
  juror_lte?: InputMaybe<Scalars['String']>;
  juror_not?: InputMaybe<Scalars['String']>;
  juror_not_contains?: InputMaybe<Scalars['String']>;
  juror_not_contains_nocase?: InputMaybe<Scalars['String']>;
  juror_not_ends_with?: InputMaybe<Scalars['String']>;
  juror_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  juror_not_in?: InputMaybe<Array<Scalars['String']>>;
  juror_not_starts_with?: InputMaybe<Scalars['String']>;
  juror_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  juror_starts_with?: InputMaybe<Scalars['String']>;
  juror_starts_with_nocase?: InputMaybe<Scalars['String']>;
  locked?: InputMaybe<Scalars['BigInt']>;
  locked_gt?: InputMaybe<Scalars['BigInt']>;
  locked_gte?: InputMaybe<Scalars['BigInt']>;
  locked_in?: InputMaybe<Array<Scalars['BigInt']>>;
  locked_lt?: InputMaybe<Scalars['BigInt']>;
  locked_lte?: InputMaybe<Scalars['BigInt']>;
  locked_not?: InputMaybe<Scalars['BigInt']>;
  locked_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  staked?: InputMaybe<Scalars['BigInt']>;
  staked_gt?: InputMaybe<Scalars['BigInt']>;
  staked_gte?: InputMaybe<Scalars['BigInt']>;
  staked_in?: InputMaybe<Array<Scalars['BigInt']>>;
  staked_lt?: InputMaybe<Scalars['BigInt']>;
  staked_lte?: InputMaybe<Scalars['BigInt']>;
  staked_not?: InputMaybe<Scalars['BigInt']>;
  staked_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  subcourt?: InputMaybe<Scalars['String']>;
  subcourt_contains?: InputMaybe<Scalars['String']>;
  subcourt_contains_nocase?: InputMaybe<Scalars['String']>;
  subcourt_ends_with?: InputMaybe<Scalars['String']>;
  subcourt_ends_with_nocase?: InputMaybe<Scalars['String']>;
  subcourt_gt?: InputMaybe<Scalars['String']>;
  subcourt_gte?: InputMaybe<Scalars['String']>;
  subcourt_in?: InputMaybe<Array<Scalars['String']>>;
  subcourt_lt?: InputMaybe<Scalars['String']>;
  subcourt_lte?: InputMaybe<Scalars['String']>;
  subcourt_not?: InputMaybe<Scalars['String']>;
  subcourt_not_contains?: InputMaybe<Scalars['String']>;
  subcourt_not_contains_nocase?: InputMaybe<Scalars['String']>;
  subcourt_not_ends_with?: InputMaybe<Scalars['String']>;
  subcourt_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  subcourt_not_in?: InputMaybe<Array<Scalars['String']>>;
  subcourt_not_starts_with?: InputMaybe<Scalars['String']>;
  subcourt_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  subcourt_starts_with?: InputMaybe<Scalars['String']>;
  subcourt_starts_with_nocase?: InputMaybe<Scalars['String']>;
};

export enum JurorTokensPerSubcourt_OrderBy {
  Id = 'id',
  Juror = 'juror',
  Locked = 'locked',
  Staked = 'staked',
  Subcourt = 'subcourt'
}

export type Juror_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
};

export enum Juror_OrderBy {
  Draws = 'draws',
  Id = 'id',
  Shifts = 'shifts',
  Tokens = 'tokens'
}

/** Defines the order direction, either ascending or descending */
export enum OrderDirection {
  Asc = 'asc',
  Desc = 'desc'
}

export type OutgoingMessage = {
  __typename?: 'OutgoingMessage';
  id: Scalars['ID'];
  message: Scalars['String'];
  messageHash: Scalars['String'];
  target: Scalars['Bytes'];
};

export type OutgoingMessage_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  message?: InputMaybe<Scalars['String']>;
  messageHash?: InputMaybe<Scalars['String']>;
  messageHash_contains?: InputMaybe<Scalars['String']>;
  messageHash_contains_nocase?: InputMaybe<Scalars['String']>;
  messageHash_ends_with?: InputMaybe<Scalars['String']>;
  messageHash_ends_with_nocase?: InputMaybe<Scalars['String']>;
  messageHash_gt?: InputMaybe<Scalars['String']>;
  messageHash_gte?: InputMaybe<Scalars['String']>;
  messageHash_in?: InputMaybe<Array<Scalars['String']>>;
  messageHash_lt?: InputMaybe<Scalars['String']>;
  messageHash_lte?: InputMaybe<Scalars['String']>;
  messageHash_not?: InputMaybe<Scalars['String']>;
  messageHash_not_contains?: InputMaybe<Scalars['String']>;
  messageHash_not_contains_nocase?: InputMaybe<Scalars['String']>;
  messageHash_not_ends_with?: InputMaybe<Scalars['String']>;
  messageHash_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  messageHash_not_in?: InputMaybe<Array<Scalars['String']>>;
  messageHash_not_starts_with?: InputMaybe<Scalars['String']>;
  messageHash_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  messageHash_starts_with?: InputMaybe<Scalars['String']>;
  messageHash_starts_with_nocase?: InputMaybe<Scalars['String']>;
  message_contains?: InputMaybe<Scalars['String']>;
  message_contains_nocase?: InputMaybe<Scalars['String']>;
  message_ends_with?: InputMaybe<Scalars['String']>;
  message_ends_with_nocase?: InputMaybe<Scalars['String']>;
  message_gt?: InputMaybe<Scalars['String']>;
  message_gte?: InputMaybe<Scalars['String']>;
  message_in?: InputMaybe<Array<Scalars['String']>>;
  message_lt?: InputMaybe<Scalars['String']>;
  message_lte?: InputMaybe<Scalars['String']>;
  message_not?: InputMaybe<Scalars['String']>;
  message_not_contains?: InputMaybe<Scalars['String']>;
  message_not_contains_nocase?: InputMaybe<Scalars['String']>;
  message_not_ends_with?: InputMaybe<Scalars['String']>;
  message_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  message_not_in?: InputMaybe<Array<Scalars['String']>>;
  message_not_starts_with?: InputMaybe<Scalars['String']>;
  message_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  message_starts_with?: InputMaybe<Scalars['String']>;
  message_starts_with_nocase?: InputMaybe<Scalars['String']>;
  target?: InputMaybe<Scalars['Bytes']>;
  target_contains?: InputMaybe<Scalars['Bytes']>;
  target_in?: InputMaybe<Array<Scalars['Bytes']>>;
  target_not?: InputMaybe<Scalars['Bytes']>;
  target_not_contains?: InputMaybe<Scalars['Bytes']>;
  target_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
};

export enum OutgoingMessage_OrderBy {
  Id = 'id',
  Message = 'message',
  MessageHash = 'messageHash',
  Target = 'target'
}

export type PnkRedistributedDataPoint = {
  __typename?: 'PNKRedistributedDataPoint';
  id: Scalars['ID'];
  value: Scalars['BigInt'];
};

export type PnkRedistributedDataPoint_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  value?: InputMaybe<Scalars['BigInt']>;
  value_gt?: InputMaybe<Scalars['BigInt']>;
  value_gte?: InputMaybe<Scalars['BigInt']>;
  value_in?: InputMaybe<Array<Scalars['BigInt']>>;
  value_lt?: InputMaybe<Scalars['BigInt']>;
  value_lte?: InputMaybe<Scalars['BigInt']>;
  value_not?: InputMaybe<Scalars['BigInt']>;
  value_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum PnkRedistributedDataPoint_OrderBy {
  Id = 'id',
  Value = 'value'
}

export type PnkStakedDataPoint = {
  __typename?: 'PNKStakedDataPoint';
  id: Scalars['ID'];
  value: Scalars['BigInt'];
};

export type PnkStakedDataPoint_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  value?: InputMaybe<Scalars['BigInt']>;
  value_gt?: InputMaybe<Scalars['BigInt']>;
  value_gte?: InputMaybe<Scalars['BigInt']>;
  value_in?: InputMaybe<Array<Scalars['BigInt']>>;
  value_lt?: InputMaybe<Scalars['BigInt']>;
  value_lte?: InputMaybe<Scalars['BigInt']>;
  value_not?: InputMaybe<Scalars['BigInt']>;
  value_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum PnkStakedDataPoint_OrderBy {
  Id = 'id',
  Value = 'value'
}

export enum Period {
  Appeal = 'Appeal',
  Commit = 'Commit',
  Evidence = 'Evidence',
  Execution = 'Execution',
  Vote = 'Vote'
}

export type Query = {
  __typename?: 'Query';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  activeJurorsDataPoint?: Maybe<ActiveJurorsDataPoint>;
  activeJurorsDataPoints: Array<ActiveJurorsDataPoint>;
  casesDataPoint?: Maybe<CasesDataPoint>;
  casesDataPoints: Array<CasesDataPoint>;
  court?: Maybe<Court>;
  courts: Array<Court>;
  dispute?: Maybe<Dispute>;
  disputes: Array<Dispute>;
  draw?: Maybe<Draw>;
  draws: Array<Draw>;
  ethpaidDataPoint?: Maybe<EthPaidDataPoint>;
  ethpaidDataPoints: Array<EthPaidDataPoint>;
  gatewayDispute?: Maybe<GatewayDispute>;
  gatewayDisputes: Array<GatewayDispute>;
  juror?: Maybe<Juror>;
  jurorTokensPerSubcourt?: Maybe<JurorTokensPerSubcourt>;
  jurorTokensPerSubcourts: Array<JurorTokensPerSubcourt>;
  jurors: Array<Juror>;
  outgoingMessage?: Maybe<OutgoingMessage>;
  outgoingMessages: Array<OutgoingMessage>;
  pnkredistributedDataPoint?: Maybe<PnkRedistributedDataPoint>;
  pnkredistributedDataPoints: Array<PnkRedistributedDataPoint>;
  pnkstakedDataPoint?: Maybe<PnkStakedDataPoint>;
  pnkstakedDataPoints: Array<PnkStakedDataPoint>;
  round?: Maybe<Round>;
  rounds: Array<Round>;
  tokenAndETHShift?: Maybe<TokenAndEthShift>;
  tokenAndETHShifts: Array<TokenAndEthShift>;
};


export type Query_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};


export type QueryActiveJurorsDataPointArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryActiveJurorsDataPointsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ActiveJurorsDataPoint_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ActiveJurorsDataPoint_Filter>;
};


export type QueryCasesDataPointArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryCasesDataPointsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<CasesDataPoint_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<CasesDataPoint_Filter>;
};


export type QueryCourtArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryCourtsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Court_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Court_Filter>;
};


export type QueryDisputeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryDisputesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Dispute_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Dispute_Filter>;
};


export type QueryDrawArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryDrawsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Draw_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Draw_Filter>;
};


export type QueryEthpaidDataPointArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryEthpaidDataPointsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<EthPaidDataPoint_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<EthPaidDataPoint_Filter>;
};


export type QueryGatewayDisputeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryGatewayDisputesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<GatewayDispute_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<GatewayDispute_Filter>;
};


export type QueryJurorArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryJurorTokensPerSubcourtArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryJurorTokensPerSubcourtsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<JurorTokensPerSubcourt_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<JurorTokensPerSubcourt_Filter>;
};


export type QueryJurorsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Juror_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Juror_Filter>;
};


export type QueryOutgoingMessageArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryOutgoingMessagesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<OutgoingMessage_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<OutgoingMessage_Filter>;
};


export type QueryPnkredistributedDataPointArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryPnkredistributedDataPointsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<PnkRedistributedDataPoint_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<PnkRedistributedDataPoint_Filter>;
};


export type QueryPnkstakedDataPointArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryPnkstakedDataPointsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<PnkStakedDataPoint_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<PnkStakedDataPoint_Filter>;
};


export type QueryRoundArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryRoundsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Round_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Round_Filter>;
};


export type QueryTokenAndEthShiftArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTokenAndEthShiftsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TokenAndEthShift_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<TokenAndEthShift_Filter>;
};

export type Round = {
  __typename?: 'Round';
  dispute: Dispute;
  draws: Array<Draw>;
  id: Scalars['ID'];
  penalties: Scalars['BigInt'];
  repartitions: Scalars['BigInt'];
  tokensAtStakePerJuror: Scalars['BigInt'];
  totalFeesForJurors: Scalars['BigInt'];
};


export type RoundDrawsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Draw_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Draw_Filter>;
};

export type Round_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  dispute?: InputMaybe<Scalars['String']>;
  dispute_contains?: InputMaybe<Scalars['String']>;
  dispute_contains_nocase?: InputMaybe<Scalars['String']>;
  dispute_ends_with?: InputMaybe<Scalars['String']>;
  dispute_ends_with_nocase?: InputMaybe<Scalars['String']>;
  dispute_gt?: InputMaybe<Scalars['String']>;
  dispute_gte?: InputMaybe<Scalars['String']>;
  dispute_in?: InputMaybe<Array<Scalars['String']>>;
  dispute_lt?: InputMaybe<Scalars['String']>;
  dispute_lte?: InputMaybe<Scalars['String']>;
  dispute_not?: InputMaybe<Scalars['String']>;
  dispute_not_contains?: InputMaybe<Scalars['String']>;
  dispute_not_contains_nocase?: InputMaybe<Scalars['String']>;
  dispute_not_ends_with?: InputMaybe<Scalars['String']>;
  dispute_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  dispute_not_in?: InputMaybe<Array<Scalars['String']>>;
  dispute_not_starts_with?: InputMaybe<Scalars['String']>;
  dispute_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  dispute_starts_with?: InputMaybe<Scalars['String']>;
  dispute_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  penalties?: InputMaybe<Scalars['BigInt']>;
  penalties_gt?: InputMaybe<Scalars['BigInt']>;
  penalties_gte?: InputMaybe<Scalars['BigInt']>;
  penalties_in?: InputMaybe<Array<Scalars['BigInt']>>;
  penalties_lt?: InputMaybe<Scalars['BigInt']>;
  penalties_lte?: InputMaybe<Scalars['BigInt']>;
  penalties_not?: InputMaybe<Scalars['BigInt']>;
  penalties_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  repartitions?: InputMaybe<Scalars['BigInt']>;
  repartitions_gt?: InputMaybe<Scalars['BigInt']>;
  repartitions_gte?: InputMaybe<Scalars['BigInt']>;
  repartitions_in?: InputMaybe<Array<Scalars['BigInt']>>;
  repartitions_lt?: InputMaybe<Scalars['BigInt']>;
  repartitions_lte?: InputMaybe<Scalars['BigInt']>;
  repartitions_not?: InputMaybe<Scalars['BigInt']>;
  repartitions_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  tokensAtStakePerJuror?: InputMaybe<Scalars['BigInt']>;
  tokensAtStakePerJuror_gt?: InputMaybe<Scalars['BigInt']>;
  tokensAtStakePerJuror_gte?: InputMaybe<Scalars['BigInt']>;
  tokensAtStakePerJuror_in?: InputMaybe<Array<Scalars['BigInt']>>;
  tokensAtStakePerJuror_lt?: InputMaybe<Scalars['BigInt']>;
  tokensAtStakePerJuror_lte?: InputMaybe<Scalars['BigInt']>;
  tokensAtStakePerJuror_not?: InputMaybe<Scalars['BigInt']>;
  tokensAtStakePerJuror_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalFeesForJurors?: InputMaybe<Scalars['BigInt']>;
  totalFeesForJurors_gt?: InputMaybe<Scalars['BigInt']>;
  totalFeesForJurors_gte?: InputMaybe<Scalars['BigInt']>;
  totalFeesForJurors_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalFeesForJurors_lt?: InputMaybe<Scalars['BigInt']>;
  totalFeesForJurors_lte?: InputMaybe<Scalars['BigInt']>;
  totalFeesForJurors_not?: InputMaybe<Scalars['BigInt']>;
  totalFeesForJurors_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum Round_OrderBy {
  Dispute = 'dispute',
  Draws = 'draws',
  Id = 'id',
  Penalties = 'penalties',
  Repartitions = 'repartitions',
  TokensAtStakePerJuror = 'tokensAtStakePerJuror',
  TotalFeesForJurors = 'totalFeesForJurors'
}

export type Subscription = {
  __typename?: 'Subscription';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  activeJurorsDataPoint?: Maybe<ActiveJurorsDataPoint>;
  activeJurorsDataPoints: Array<ActiveJurorsDataPoint>;
  casesDataPoint?: Maybe<CasesDataPoint>;
  casesDataPoints: Array<CasesDataPoint>;
  court?: Maybe<Court>;
  courts: Array<Court>;
  dispute?: Maybe<Dispute>;
  disputes: Array<Dispute>;
  draw?: Maybe<Draw>;
  draws: Array<Draw>;
  ethpaidDataPoint?: Maybe<EthPaidDataPoint>;
  ethpaidDataPoints: Array<EthPaidDataPoint>;
  gatewayDispute?: Maybe<GatewayDispute>;
  gatewayDisputes: Array<GatewayDispute>;
  juror?: Maybe<Juror>;
  jurorTokensPerSubcourt?: Maybe<JurorTokensPerSubcourt>;
  jurorTokensPerSubcourts: Array<JurorTokensPerSubcourt>;
  jurors: Array<Juror>;
  outgoingMessage?: Maybe<OutgoingMessage>;
  outgoingMessages: Array<OutgoingMessage>;
  pnkredistributedDataPoint?: Maybe<PnkRedistributedDataPoint>;
  pnkredistributedDataPoints: Array<PnkRedistributedDataPoint>;
  pnkstakedDataPoint?: Maybe<PnkStakedDataPoint>;
  pnkstakedDataPoints: Array<PnkStakedDataPoint>;
  round?: Maybe<Round>;
  rounds: Array<Round>;
  tokenAndETHShift?: Maybe<TokenAndEthShift>;
  tokenAndETHShifts: Array<TokenAndEthShift>;
};


export type Subscription_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};


export type SubscriptionActiveJurorsDataPointArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionActiveJurorsDataPointsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ActiveJurorsDataPoint_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ActiveJurorsDataPoint_Filter>;
};


export type SubscriptionCasesDataPointArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionCasesDataPointsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<CasesDataPoint_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<CasesDataPoint_Filter>;
};


export type SubscriptionCourtArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionCourtsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Court_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Court_Filter>;
};


export type SubscriptionDisputeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionDisputesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Dispute_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Dispute_Filter>;
};


export type SubscriptionDrawArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionDrawsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Draw_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Draw_Filter>;
};


export type SubscriptionEthpaidDataPointArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionEthpaidDataPointsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<EthPaidDataPoint_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<EthPaidDataPoint_Filter>;
};


export type SubscriptionGatewayDisputeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionGatewayDisputesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<GatewayDispute_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<GatewayDispute_Filter>;
};


export type SubscriptionJurorArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionJurorTokensPerSubcourtArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionJurorTokensPerSubcourtsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<JurorTokensPerSubcourt_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<JurorTokensPerSubcourt_Filter>;
};


export type SubscriptionJurorsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Juror_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Juror_Filter>;
};


export type SubscriptionOutgoingMessageArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionOutgoingMessagesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<OutgoingMessage_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<OutgoingMessage_Filter>;
};


export type SubscriptionPnkredistributedDataPointArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionPnkredistributedDataPointsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<PnkRedistributedDataPoint_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<PnkRedistributedDataPoint_Filter>;
};


export type SubscriptionPnkstakedDataPointArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionPnkstakedDataPointsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<PnkStakedDataPoint_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<PnkStakedDataPoint_Filter>;
};


export type SubscriptionRoundArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionRoundsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Round_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Round_Filter>;
};


export type SubscriptionTokenAndEthShiftArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionTokenAndEthShiftsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TokenAndEthShift_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<TokenAndEthShift_Filter>;
};

export type TokenAndEthShift = {
  __typename?: 'TokenAndETHShift';
  dispute: Dispute;
  ethAmount: Scalars['BigInt'];
  id: Scalars['ID'];
  juror: Juror;
  tokenAmount: Scalars['BigInt'];
};

export type TokenAndEthShift_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  dispute?: InputMaybe<Scalars['String']>;
  dispute_contains?: InputMaybe<Scalars['String']>;
  dispute_contains_nocase?: InputMaybe<Scalars['String']>;
  dispute_ends_with?: InputMaybe<Scalars['String']>;
  dispute_ends_with_nocase?: InputMaybe<Scalars['String']>;
  dispute_gt?: InputMaybe<Scalars['String']>;
  dispute_gte?: InputMaybe<Scalars['String']>;
  dispute_in?: InputMaybe<Array<Scalars['String']>>;
  dispute_lt?: InputMaybe<Scalars['String']>;
  dispute_lte?: InputMaybe<Scalars['String']>;
  dispute_not?: InputMaybe<Scalars['String']>;
  dispute_not_contains?: InputMaybe<Scalars['String']>;
  dispute_not_contains_nocase?: InputMaybe<Scalars['String']>;
  dispute_not_ends_with?: InputMaybe<Scalars['String']>;
  dispute_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  dispute_not_in?: InputMaybe<Array<Scalars['String']>>;
  dispute_not_starts_with?: InputMaybe<Scalars['String']>;
  dispute_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  dispute_starts_with?: InputMaybe<Scalars['String']>;
  dispute_starts_with_nocase?: InputMaybe<Scalars['String']>;
  ethAmount?: InputMaybe<Scalars['BigInt']>;
  ethAmount_gt?: InputMaybe<Scalars['BigInt']>;
  ethAmount_gte?: InputMaybe<Scalars['BigInt']>;
  ethAmount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  ethAmount_lt?: InputMaybe<Scalars['BigInt']>;
  ethAmount_lte?: InputMaybe<Scalars['BigInt']>;
  ethAmount_not?: InputMaybe<Scalars['BigInt']>;
  ethAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  juror?: InputMaybe<Scalars['String']>;
  juror_contains?: InputMaybe<Scalars['String']>;
  juror_contains_nocase?: InputMaybe<Scalars['String']>;
  juror_ends_with?: InputMaybe<Scalars['String']>;
  juror_ends_with_nocase?: InputMaybe<Scalars['String']>;
  juror_gt?: InputMaybe<Scalars['String']>;
  juror_gte?: InputMaybe<Scalars['String']>;
  juror_in?: InputMaybe<Array<Scalars['String']>>;
  juror_lt?: InputMaybe<Scalars['String']>;
  juror_lte?: InputMaybe<Scalars['String']>;
  juror_not?: InputMaybe<Scalars['String']>;
  juror_not_contains?: InputMaybe<Scalars['String']>;
  juror_not_contains_nocase?: InputMaybe<Scalars['String']>;
  juror_not_ends_with?: InputMaybe<Scalars['String']>;
  juror_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  juror_not_in?: InputMaybe<Array<Scalars['String']>>;
  juror_not_starts_with?: InputMaybe<Scalars['String']>;
  juror_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  juror_starts_with?: InputMaybe<Scalars['String']>;
  juror_starts_with_nocase?: InputMaybe<Scalars['String']>;
  tokenAmount?: InputMaybe<Scalars['BigInt']>;
  tokenAmount_gt?: InputMaybe<Scalars['BigInt']>;
  tokenAmount_gte?: InputMaybe<Scalars['BigInt']>;
  tokenAmount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  tokenAmount_lt?: InputMaybe<Scalars['BigInt']>;
  tokenAmount_lte?: InputMaybe<Scalars['BigInt']>;
  tokenAmount_not?: InputMaybe<Scalars['BigInt']>;
  tokenAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum TokenAndEthShift_OrderBy {
  Dispute = 'dispute',
  EthAmount = 'ethAmount',
  Id = 'id',
  Juror = 'juror',
  TokenAmount = 'tokenAmount'
}

export type _Block_ = {
  __typename?: '_Block_';
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']>;
  /** The block number */
  number: Scalars['Int'];
};

/** The type for the top-level _meta field */
export type _Meta_ = {
  __typename?: '_Meta_';
  /**
   * Information about a specific subgraph block. The hash of the block
   * will be null if the _meta field has a block constraint that asks for
   * a block number. It will be filled if the _meta field has no block constraint
   * and therefore asks for the latest  block
   *
   */
  block: _Block_;
  /** The deployment ID */
  deployment: Scalars['String'];
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars['Boolean'];
};

export enum _SubgraphErrorPolicy_ {
  /** Data will be returned even if the subgraph has indexing errors */
  Allow = 'allow',
  /** If the subgraph has indexing errors, data will be omitted. The default. */
  Deny = 'deny'
}

export type HomePageQueryVariables = Exact<{
  timeframe?: InputMaybe<Scalars['ID']>;
}>;


export type HomePageQuery = { __typename?: 'Query', disputes: Array<{ __typename?: 'Dispute', id: string }>, pnkstakedDataPoints: Array<{ __typename?: 'PNKStakedDataPoint', id: string, value: any }>, ethpaidDataPoints: Array<{ __typename?: 'ETHPaidDataPoint', id: string, value: any }>, pnkredistributedDataPoints: Array<{ __typename?: 'PNKRedistributedDataPoint', id: string, value: any }>, activeJurorsDataPoints: Array<{ __typename?: 'ActiveJurorsDataPoint', id: string, value: any }>, casesDataPoints: Array<{ __typename?: 'CasesDataPoint', id: string, value: any }> };
