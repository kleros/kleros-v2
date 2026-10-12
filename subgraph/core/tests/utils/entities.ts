import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  ClassicContribution,
  ClassicDispute,
  ClassicRound,
  Court,
  Dispute,
  DisputeKit,
  Draw,
  Round,
  User,
} from "../../generated/schema";
import { ARBITRABLE, DK_CLASSIC, GENERAL_COURT } from "./constants";

const ZERO = BigInt.zero();

export function defaultTimesPerPeriod(): BigInt[] {
  return [BigInt.fromI32(100), BigInt.fromI32(200), BigInt.fromI32(300), BigInt.fromI32(400)];
}

export function seedCourt(id: string, parent: string | null = null, supportedDisputeKits: string[] = ["1"]): Court {
  const court = new Court(id);
  court.parent = parent;
  court.hiddenVotes = false;
  court.minStake = BigInt.fromI32(200);
  court.alpha = BigInt.fromI32(10000);
  court.feeForJuror = BigInt.fromI32(100);
  court.jurorsForCourtJump = BigInt.fromI32(511);
  court.timesPerPeriod = defaultTimesPerPeriod();
  court.supportedDisputeKits = supportedDisputeKits;
  court.numberDisputes = ZERO;
  court.numberClosedDisputes = ZERO;
  court.numberVotingDisputes = ZERO;
  court.numberAppealingDisputes = ZERO;
  court.numberVotes = ZERO;
  court.numberStakedJurors = ZERO;
  court.effectiveNumberStakedJurors = ZERO;
  court.stake = ZERO;
  court.effectiveStake = ZERO;
  court.delayedStake = ZERO;
  court.paidETH = ZERO;
  court.paidPNK = ZERO;
  court.eligibility = Address.zero().toHexString();
  court.save();
  return court;
}

export function seedDisputeKit(id: string, address: Address = DK_CLASSIC): DisputeKit {
  const disputeKit = new DisputeKit(id);
  disputeKit.address = address;
  disputeKit.needsFreezing = false;
  disputeKit.save();
  return disputeKit;
}

export function seedUser(address: Address): User {
  const id = address.toHexString();
  const user = new User(id);
  user.userAddress = id;
  user.totalStake = ZERO;
  user.totalDelayed = ZERO;
  user.activeDisputes = ZERO;
  user.disputes = [];
  user.rounds = [];
  user.resolvedDisputes = [];
  user.totalResolvedDisputes = ZERO;
  user.totalAppealingDisputes = ZERO;
  user.totalDisputes = ZERO;
  user.totalCoherentVotes = ZERO;
  user.totalResolvedVotes = ZERO;
  user.coherenceScore = ZERO;
  user.leaderboardOffset = ZERO;
  user.save();
  return user;
}

export function seedDispute(
  id: string,
  court: string = GENERAL_COURT,
  period: string = "evidence",
  currentRoundIndex: i32 = 0
): Dispute {
  const dispute = new Dispute(id);
  dispute.disputeID = BigInt.fromString(id);
  dispute.court = court;
  dispute.createdAt = ZERO;
  dispute.transactionHash = "0x";
  dispute.arbitrated = ARBITRABLE.toHexString();
  dispute.period = period;
  dispute.ruled = false;
  dispute.executed = false;
  dispute.currentRuling = ZERO;
  dispute.tied = true;
  dispute.overridden = false;
  dispute.periodDeadline = ZERO;
  dispute.periodNotificationIndex = ZERO;
  dispute.lastPeriodChange = ZERO;
  dispute.lastPeriodChangeBlockNumber = ZERO;
  dispute.currentRoundIndex = BigInt.fromI32(currentRoundIndex);
  dispute.currentRound = `${id}-${currentRoundIndex}`;
  dispute.evidenceCount = ZERO;
  dispute.save();
  return dispute;
}

export function seedRound(
  disputeID: string,
  index: i32,
  disputeKit: string = "1",
  nbVotes: i32 = 3,
  court: string = GENERAL_COURT
): Round {
  const round = new Round(`${disputeID}-${index}`);
  round.disputeKit = disputeKit;
  round.tokensAtStakePerJuror = BigInt.fromI32(1000);
  round.totalFeesForJurors = BigInt.fromI32(300);
  round.nbVotes = BigInt.fromI32(nbVotes);
  round.isCurrentRound = true;
  round.repartitions = ZERO;
  round.penalties = ZERO;
  round.dispute = disputeID;
  round.court = court;
  round.timeline = [ZERO, ZERO, ZERO, ZERO];
  round.jurorsDrawn = false;
  round.jurorRewardsDispersed = false;
  round.timesPerPeriod = defaultTimesPerPeriod();
  round.hiddenVotes = false;
  round.jurorsForCourtJump = BigInt.fromI32(511);
  round.save();
  return round;
}

export function seedClassicDispute(
  disputeKit: string,
  disputeID: string,
  currentLocalRoundIndex: i32 = 0,
  numberOfChoices: i32 = 2
): ClassicDispute {
  const classicDispute = new ClassicDispute(`${disputeKit}-${disputeID}`);
  classicDispute.coreDispute = disputeID;
  classicDispute.currentLocalRoundIndex = BigInt.fromI32(currentLocalRoundIndex);
  classicDispute.numberOfChoices = BigInt.fromI32(numberOfChoices);
  classicDispute.extraData = Bytes.empty();
  classicDispute.timestamp = ZERO;
  classicDispute.save();
  return classicDispute;
}

export function seedClassicRound(
  disputeKit: string,
  disputeID: string,
  roundIndex: i32,
  feeRewards: BigInt = ZERO
): ClassicRound {
  const localDispute = `${disputeKit}-${disputeID}`;
  const classicRound = new ClassicRound(`${localDispute}-${roundIndex}`);
  classicRound.localDispute = localDispute;
  classicRound.winningChoice = ZERO;
  classicRound.tied = true;
  classicRound.totalVoted = ZERO;
  classicRound.totalCommited = ZERO;
  classicRound.feeRewards = feeRewards;
  classicRound.appealFeesDispersed = false;
  classicRound.totalFeeDispersed = ZERO;
  classicRound.fundedChoices = [];
  classicRound.save();
  return classicRound;
}

export function seedClassicContribution(
  disputeKit: string,
  disputeID: string,
  roundIndex: i32,
  contributor: Address,
  choice: i32,
  amount: BigInt
): ClassicContribution {
  const localRound = `${disputeKit}-${disputeID}-${roundIndex}`;
  const contribution = new ClassicContribution(`${localRound}-${contributor.toHexString()}-${choice}`);
  contribution.contributor = contributor.toHexString();
  contribution.coreDispute = disputeID;
  contribution.localRound = localRound;
  contribution.amount = amount;
  contribution.choice = BigInt.fromI32(choice);
  contribution.rewardWithdrawn = false;
  contribution.save();
  return contribution;
}

export function seedDraw(disputeID: string, roundIndex: i32, voteID: i32, juror: Address): Draw {
  const draw = new Draw(`${disputeID}-${roundIndex}-${voteID}`);
  draw.blockNumber = BigInt.fromI32(1);
  draw.dispute = disputeID;
  draw.round = `${disputeID}-${roundIndex}`;
  draw.juror = juror.toHexString();
  draw.voteIDNum = BigInt.fromI32(voteID);
  draw.save();
  return draw;
}

/** Court 1 with dispute kit 1, dispute `id` in `period` with one round per index up to currentRoundIndex. */
export function seedDisputeInCourt(id: string, period: string = "evidence", currentRoundIndex: i32 = 0): Dispute {
  if (!Court.load(GENERAL_COURT)) seedCourt(GENERAL_COURT);
  if (!DisputeKit.load("1")) seedDisputeKit("1");
  const dispute = seedDispute(id, GENERAL_COURT, period, currentRoundIndex);
  for (let i = 0; i <= currentRoundIndex; i++) {
    const round = seedRound(id, i);
    round.isCurrentRound = i == currentRoundIndex;
    round.save();
  }
  return dispute;
}
