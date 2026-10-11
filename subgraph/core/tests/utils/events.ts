import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as/assembly/index";
import {
  AcceptedFeeToken,
  AppealDecision,
  CourtCreated,
  CourtJump,
  CourtModified,
  DisputeCreation,
  DisputeKitCreated,
  DisputeKitEnabled,
  Draw,
  JurorRewardPenalty,
  NewPeriod,
  Ruling,
} from "../../generated/KlerosCore/KlerosCore";
import {
  ChoiceFunded,
  CommitCast,
  Contribution,
  DisputeCreation as DKDisputeCreation,
  VoteCast,
  Withdrawal,
} from "../../generated/DisputeKitClassic/DisputeKitClassic";
import { Evidence } from "../../generated/EvidenceModule/EvidenceModule";
import { PolicyUpdate } from "../../generated/PolicyRegistry/PolicyRegistry";
import { StakeDelayed, StakeLocked, StakeSet } from "../../generated/SortitionModule/SortitionModule";
import { Offset } from "../../generated/LeaderboardOffset/LeaderboardOffset";
import { NewCurrencyRate } from "../../generated/RatesConverter/RatesConverter";
import { CORE, DAY_1, DK_CLASSIC, SORTITION } from "./constants";

export enum Period {
  evidence = 0,
  commit = 1,
  vote = 2,
  appeal = 3,
  execution = 4,
}

function base(address: Address, params: ethereum.EventParam[]): ethereum.Event {
  const event = newMockEvent();
  event.address = address;
  event.block.timestamp = BigInt.fromI64(DAY_1);
  event.parameters = params;
  return event;
}

function uint(name: string, value: BigInt): ethereum.EventParam {
  return new ethereum.EventParam(name, ethereum.Value.fromUnsignedBigInt(value));
}

function int(name: string, value: BigInt): ethereum.EventParam {
  return new ethereum.EventParam(name, ethereum.Value.fromSignedBigInt(value));
}

function addr(name: string, value: Address): ethereum.EventParam {
  return new ethereum.EventParam(name, ethereum.Value.fromAddress(value));
}

function bool(name: string, value: boolean): ethereum.EventParam {
  return new ethereum.EventParam(name, ethereum.Value.fromBoolean(value));
}

function str(name: string, value: string): ethereum.EventParam {
  return new ethereum.EventParam(name, ethereum.Value.fromString(value));
}

function uints(name: string, value: BigInt[]): ethereum.EventParam {
  return new ethereum.EventParam(name, ethereum.Value.fromUnsignedBigIntArray(value));
}

/** Sets the block timestamp of any mock event. */
export function at<T>(event: T, timestamp: i64): T {
  changetype<ethereum.Event>(event).block.timestamp = BigInt.fromI64(timestamp);
  return event;
}

// ---------------------------------------------------------------- KlerosCore

export function createCourtCreatedEvent(
  courtID: BigInt,
  parent: BigInt,
  hiddenVotes: boolean,
  minStake: BigInt,
  alpha: BigInt,
  feeForJuror: BigInt,
  jurorsForCourtJump: BigInt,
  timesPerPeriod: BigInt[],
  supportedDisputeKits: BigInt[],
  eligibility: Address = Address.zero()
): CourtCreated {
  return changetype<CourtCreated>(
    base(CORE, [
      uint("_courtID", courtID),
      uint("_parent", parent),
      bool("_hiddenVotes", hiddenVotes),
      uint("_minStake", minStake),
      uint("_alpha", alpha),
      uint("_feeForJuror", feeForJuror),
      uint("_jurorsForCourtJump", jurorsForCourtJump),
      uints("_timesPerPeriod", timesPerPeriod),
      uints("_supportedDisputeKits", supportedDisputeKits),
      addr("_eligibility", eligibility),
    ])
  );
}

export function createCourtModifiedEvent(
  courtID: BigInt,
  hiddenVotes: boolean,
  minStake: BigInt,
  alpha: BigInt,
  feeForJuror: BigInt,
  jurorsForCourtJump: BigInt,
  timesPerPeriod: BigInt[],
  eligibility: Address = Address.zero()
): CourtModified {
  return changetype<CourtModified>(
    base(CORE, [
      uint("_courtID", courtID),
      bool("_hiddenVotes", hiddenVotes),
      uint("_minStake", minStake),
      uint("_alpha", alpha),
      uint("_feeForJuror", feeForJuror),
      uint("_jurorsForCourtJump", jurorsForCourtJump),
      uints("_timesPerPeriod", timesPerPeriod),
      addr("_eligibility", eligibility),
    ])
  );
}

export function createDisputeKitCreatedEvent(disputeKitID: BigInt, disputeKitAddress: Address): DisputeKitCreated {
  return changetype<DisputeKitCreated>(
    base(CORE, [uint("_disputeKitID", disputeKitID), addr("_disputeKitAddress", disputeKitAddress)])
  );
}

export function createDisputeKitEnabledEvent(
  courtID: BigInt,
  disputeKitID: BigInt,
  enable: boolean
): DisputeKitEnabled {
  return changetype<DisputeKitEnabled>(
    base(CORE, [uint("_courtID", courtID), uint("_disputeKitID", disputeKitID), bool("_enable", enable)])
  );
}

export function createDisputeCreationEvent(disputeID: BigInt, arbitrable: Address): DisputeCreation {
  return changetype<DisputeCreation>(base(CORE, [uint("_disputeID", disputeID), addr("_arbitrable", arbitrable)]));
}

export function createAppealDecisionEvent(disputeID: BigInt, arbitrable: Address): AppealDecision {
  return changetype<AppealDecision>(base(CORE, [uint("_disputeID", disputeID), addr("_arbitrable", arbitrable)]));
}

export function createDrawEvent(juror: Address, disputeID: BigInt, roundID: BigInt, voteID: BigInt): Draw {
  return changetype<Draw>(
    base(CORE, [
      addr("_address", juror),
      uint("_disputeID", disputeID),
      uint("_roundID", roundID),
      uint("_voteID", voteID),
    ])
  );
}

export function createNewPeriodEvent(disputeID: BigInt, period: Period): NewPeriod {
  return changetype<NewPeriod>(
    base(CORE, [uint("_disputeID", disputeID), new ethereum.EventParam("_period", ethereum.Value.fromI32(period))])
  );
}

export function createJurorRewardPenaltyEvent(
  account: Address,
  disputeID: BigInt,
  roundID: BigInt,
  degreeOfCoherencyPnk: BigInt,
  degreeOfCoherencyFee: BigInt,
  amountPnk: BigInt,
  amountFee: BigInt,
  feeToken: Address
): JurorRewardPenalty {
  return changetype<JurorRewardPenalty>(
    base(CORE, [
      addr("_account", account),
      uint("_disputeID", disputeID),
      uint("_roundID", roundID),
      uint("_degreeOfCoherencyPnk", degreeOfCoherencyPnk),
      uint("_degreeOfCoherencyFee", degreeOfCoherencyFee),
      int("_amountPnk", amountPnk),
      int("_amountFee", amountFee),
      addr("_feeToken", feeToken),
    ])
  );
}

export function createRulingEvent(arbitrable: Address, disputeID: BigInt, ruling: BigInt): Ruling {
  return changetype<Ruling>(
    base(CORE, [addr("_arbitrable", arbitrable), uint("_disputeID", disputeID), uint("_ruling", ruling)])
  );
}

export function createAcceptedFeeTokenEvent(token: Address, accepted: boolean): AcceptedFeeToken {
  return changetype<AcceptedFeeToken>(base(CORE, [addr("_token", token), bool("_accepted", accepted)]));
}

export function createCourtJumpEvent(
  disputeID: BigInt,
  roundID: BigInt,
  fromCourtID: BigInt,
  toCourtID: BigInt
): CourtJump {
  return changetype<CourtJump>(
    base(CORE, [
      uint("_disputeID", disputeID),
      uint("_roundID", roundID),
      uint("_fromCourtID", fromCourtID),
      uint("_toCourtID", toCourtID),
    ])
  );
}

// ---------------------------------------------------------- Dispute kits

export function createDKDisputeCreationEvent(
  coreDisputeID: BigInt,
  numberOfChoices: BigInt,
  extraData: Bytes,
  disputeKit: Address = DK_CLASSIC
): DKDisputeCreation {
  return changetype<DKDisputeCreation>(
    base(disputeKit, [
      uint("_coreDisputeID", coreDisputeID),
      uint("_numberOfChoices", numberOfChoices),
      new ethereum.EventParam("_extraData", ethereum.Value.fromBytes(extraData)),
    ])
  );
}

export function createContributionEvent(
  coreDisputeID: BigInt,
  coreRoundID: BigInt,
  choice: BigInt,
  contributor: Address,
  amount: BigInt,
  disputeKit: Address = DK_CLASSIC
): Contribution {
  return changetype<Contribution>(
    base(disputeKit, [
      uint("_coreDisputeID", coreDisputeID),
      uint("_coreRoundID", coreRoundID),
      uint("_choice", choice),
      addr("_contributor", contributor),
      uint("_amount", amount),
    ])
  );
}

export function createWithdrawalEvent(
  coreDisputeID: BigInt,
  choice: BigInt,
  contributor: Address,
  amount: BigInt,
  disputeKit: Address = DK_CLASSIC
): Withdrawal {
  return changetype<Withdrawal>(
    base(disputeKit, [
      uint("_coreDisputeID", coreDisputeID),
      uint("_choice", choice),
      addr("_contributor", contributor),
      uint("_amount", amount),
    ])
  );
}

export function createChoiceFundedEvent(
  coreDisputeID: BigInt,
  coreRoundID: BigInt,
  choice: BigInt,
  disputeKit: Address = DK_CLASSIC
): ChoiceFunded {
  return changetype<ChoiceFunded>(
    base(disputeKit, [
      uint("_coreDisputeID", coreDisputeID),
      uint("_coreRoundID", coreRoundID),
      uint("_choice", choice),
    ])
  );
}

export function createVoteCastEvent(
  coreDisputeID: BigInt,
  juror: Address,
  voteIDs: BigInt[],
  choice: BigInt,
  justification: string,
  disputeKit: Address = DK_CLASSIC
): VoteCast {
  return changetype<VoteCast>(
    base(disputeKit, [
      uint("_coreDisputeID", coreDisputeID),
      addr("_juror", juror),
      uints("_voteIDs", voteIDs),
      uint("_choice", choice),
      str("_justification", justification),
    ])
  );
}

export function createCommitCastEvent(
  coreDisputeID: BigInt,
  juror: Address,
  voteIDs: BigInt[],
  commit: Bytes,
  disputeKit: Address = DK_CLASSIC
): CommitCast {
  return changetype<CommitCast>(
    base(disputeKit, [
      uint("_coreDisputeID", coreDisputeID),
      addr("_juror", juror),
      uints("_voteIDs", voteIDs),
      new ethereum.EventParam("_commit", ethereum.Value.fromFixedBytes(commit)),
    ])
  );
}

// ------------------------------------------------------------ Other modules

export function createEvidenceEvent(arbitratorDisputeID: BigInt, party: Address, evidence: string): Evidence {
  return changetype<Evidence>(
    base(CORE, [uint("_arbitratorDisputeID", arbitratorDisputeID), addr("_party", party), str("_evidence", evidence)])
  );
}

export function createPolicyUpdateEvent(courtID: BigInt, courtName: string, policy: string): PolicyUpdate {
  return changetype<PolicyUpdate>(
    base(CORE, [uint("_courtID", courtID), str("_courtName", courtName), str("_policy", policy)])
  );
}

export function createStakeDelayedEvent(juror: Address, courtID: BigInt, amount: BigInt): StakeDelayed {
  return changetype<StakeDelayed>(
    base(SORTITION, [addr("_address", juror), uint("_courtID", courtID), uint("_amount", amount)])
  );
}

export function createStakeLockedEvent(juror: Address, relativeAmount: BigInt, unlock: boolean): StakeLocked {
  return changetype<StakeLocked>(
    base(SORTITION, [addr("_address", juror), uint("_relativeAmount", relativeAmount), bool("_unlock", unlock)])
  );
}

export function createStakeSetEvent(
  juror: Address,
  courtID: BigInt,
  amount: BigInt,
  amountAllCourts: BigInt
): StakeSet {
  return changetype<StakeSet>(
    base(SORTITION, [
      addr("_address", juror),
      uint("_courtID", courtID),
      uint("_amount", amount),
      uint("_amountAllCourts", amountAllCourts),
    ])
  );
}

export function createOffsetEvent(user: Address, offset: BigInt, arbitrator: Address = CORE): Offset {
  return changetype<Offset>(base(CORE, [addr("user", user), int("offset", offset), addr("arbitrator", arbitrator)]));
}

export function createNewCurrencyRateEvent(feeToken: Address, rateInEth: BigInt, rateDecimals: i32): NewCurrencyRate {
  return changetype<NewCurrencyRate>(
    base(CORE, [
      addr("_feeToken", feeToken),
      uint("_rateInEth", rateInEth),
      new ethereum.EventParam("_rateDecimals", ethereum.Value.fromI32(rateDecimals)),
    ])
  );
}
