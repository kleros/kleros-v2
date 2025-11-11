import { BigInt } from "@graphprotocol/graph-ts";
import {
  DisputeKitClassic,
  DisputeCreation,
  VoteCast,
  Contribution as ContributionEvent,
  ChoiceFunded,
  Withdrawal,
  CommitCast,
} from "../generated/DisputeKitClassic/DisputeKitClassic";
import { KlerosCore } from "../generated/KlerosCore/KlerosCore";
import { ClassicDispute, ClassicJustification, ClassicRound, ClassicVote, Dispute, Round } from "../generated/schema";
import { ensureClassicContributionFromEvent } from "./entities/ClassicContribution";
import { createClassicDisputeFromEvent } from "./entities/ClassicDispute";
import {
  createClassicRound,
  ensureAnswer,
  updateChoiceFundingFromContributionEvent,
  updateCountsAndGetCurrentRuling,
} from "./entities/ClassicRound";
import { ensureClassicVote } from "./entities/ClassicVote";
import { ONE, extractDisputeKitIDFromExtraData } from "./utils";

export function handleDisputeCreation(event: DisputeCreation): void {
  const disputeID = event.params._coreDisputeID.toString();
  const disputeKitID = extractDisputeKitIDFromExtraData(event.params._extraData);

  const disputeKitClassic = DisputeKitClassic.bind(event.address);
  const klerosCore = KlerosCore.bind(disputeKitClassic.core());
  const totalRounds = klerosCore.getNumberOfRounds(event.params._coreDisputeID);
  const newRoundIndex = totalRounds.minus(ONE);

  createClassicDisputeFromEvent(event, disputeKitID, newRoundIndex);
  createClassicRound(disputeID, event.params._numberOfChoices, newRoundIndex, disputeKitID);
}

export function handleCommitCast(event: CommitCast): void {
  const coreDisputeID = event.params._coreDisputeID.toString();
  const coreDispute = Dispute.load(coreDisputeID);
  if (!coreDispute) return;

  const coreCurrentRound = Round.load(coreDispute.currentRound);
  if (!coreCurrentRound) return;

  const disputeKitID = coreCurrentRound.disputeKit;

  const classicDisputeID = `${disputeKitID}-${coreDisputeID}`;

  const classicDispute = ClassicDispute.load(classicDisputeID);
  if (!classicDispute) return;

  const currentLocalRoundID = classicDispute.id + "-" + classicDispute.currentLocalRoundIndex.toString();
  const voteIDs = event.params._voteIDs;
  for (let i = 0; i < voteIDs.length; i++) {
    const classicVote = ensureClassicVote(
      currentLocalRoundID,
      event.params._juror.toHexString(),
      voteIDs[i],
      coreDispute
    );
    classicVote.commited = true;
    classicVote.commit = event.params._commit;
    classicVote.save();
  }
}

export function handleVoteCast(event: VoteCast): void {
  const juror = event.params._juror.toHexString();
  const coreDisputeID = event.params._coreDisputeID.toString();
  const coreDispute = Dispute.load(coreDisputeID);
  if (!coreDispute) return;

  const coreCurrentRound = Round.load(coreDispute.currentRound);
  if (!coreCurrentRound) return;

  const disputeKitID = coreCurrentRound.disputeKit;

  const classicDisputeID = `${disputeKitID}-${coreDisputeID}`;

  const classicDispute = ClassicDispute.load(classicDisputeID);
  if (!classicDispute) return;

  const choice = event.params._choice;
  const currentLocalRoundID = classicDispute.id + "-" + classicDispute.currentLocalRoundIndex.toString();
  const voteIDs = event.params._voteIDs;
  const justification = new ClassicJustification(`${currentLocalRoundID}-${voteIDs.toString()}`);
  justification.juror = juror;
  justification.coreDispute = coreDisputeID;
  justification.localRound = currentLocalRoundID;
  justification.choice = choice;
  justification.reference = event.params._justification;
  justification.transactionHash = event.transaction.hash.toHexString();
  justification.timestamp = event.block.timestamp;
  justification.save();

  const currentRulingInfo = updateCountsAndGetCurrentRuling(
    currentLocalRoundID,
    choice,
    BigInt.fromI32(voteIDs.length)
  );
  coreDispute.currentRuling = currentRulingInfo.ruling;
  coreDispute.tied = currentRulingInfo.tied;
  coreDispute.save();

  let classicVote: ClassicVote;
  for (let i = 0; i < voteIDs.length; i++) {
    classicVote = ensureClassicVote(currentLocalRoundID, juror, voteIDs[i], coreDispute);
    classicVote.voted = true;
    classicVote.choice = choice;
    classicVote.justification = justification.id;
    classicVote.save();
  }
}

export function handleContributionEvent(event: ContributionEvent): void {
  ensureClassicContributionFromEvent(event, event.params._coreRoundID);
  updateChoiceFundingFromContributionEvent(event);
}

export function handleChoiceFunded(event: ChoiceFunded): void {
  const coreDisputeID = event.params._coreDisputeID.toString();
  const coreRoundIndex = event.params._coreRoundID.toString();
  const choice = event.params._choice;

  const coreDispute = Dispute.load(coreDisputeID);
  if (!coreDispute) return;

  const roundId = `${coreDisputeID}-${coreRoundIndex}`;
  const coreRound = Round.load(roundId);
  if (!coreRound) return;
  const disputeKitID = coreRound.disputeKit;

  const roundID = `${disputeKitID}-${coreDisputeID}-${coreRoundIndex}`;

  const localRound = ClassicRound.load(roundID);
  if (!localRound) return;

  const answer = ensureAnswer(roundID, choice);

  const currentFeeRewards = localRound.feeRewards;
  const deltaFeeRewards = answer.paidFee;
  localRound.feeRewards = currentFeeRewards.plus(deltaFeeRewards);
  localRound.fundedChoices = localRound.fundedChoices.concat([choice]);

  answer.funded = true;
  answer.save();

  if (localRound.fundedChoices.length > 1) {
    const disputeKitClassic = DisputeKitClassic.bind(event.address);
    const klerosCore = KlerosCore.bind(disputeKitClassic.core());

    // cannot use core.appealCost as that will give the cost for the newly created round
    const numberOfRounds = klerosCore.getNumberOfRounds(BigInt.fromString(coreDisputeID));
    const roundInfo = klerosCore.getRoundInfo(BigInt.fromString(coreDisputeID), numberOfRounds.minus(ONE));
    const appealCost = roundInfo.totalFeesForJurors;

    localRound.feeRewards = localRound.feeRewards.minus(appealCost);

    const newDisputeKitID = roundInfo.disputeKitID;

    const localDispute = ClassicDispute.load(`${disputeKitID}-${coreDisputeID}`);
    if (!localDispute) return;

    if (BigInt.fromString(disputeKitID).equals(newDisputeKitID)) {
      const newRoundIndex = localDispute.currentLocalRoundIndex.plus(ONE);
      const numberOfChoices = localDispute.numberOfChoices;
      localDispute.currentLocalRoundIndex = newRoundIndex;
      localDispute.save();
      createClassicRound(coreDisputeID, numberOfChoices, newRoundIndex, disputeKitID);
    }
  }

  localRound.save();
}

export function handleWithdrawal(event: Withdrawal): void {
  // check if all appeal fees have been withdrawn
  const coreDisputeID = event.params._coreDisputeID.toString();
  const coreDispute = Dispute.load(coreDisputeID);
  if (!coreDispute) return;

  const numberOfRounds = coreDispute.currentRoundIndex.toI32();
  for (let i = 0; i < numberOfRounds; i++) {
    const coreRoundIndex = i;

    const contribution = ensureClassicContributionFromEvent(event, new BigInt(coreRoundIndex));
    if (!contribution) return;
    contribution.rewardWithdrawn = true;
    contribution.rewardAmount = event.params._amount;

    const roundId = `${coreDisputeID}-${coreRoundIndex}`;
    const coreRound = Round.load(roundId);
    if (!coreRound) return;
    const disputeKitID = coreRound.disputeKit;

    const roundID = `${disputeKitID}-${coreDisputeID}-${coreRoundIndex}`;

    const localRound = ClassicRound.load(roundID);
    if (!localRound) return;

    localRound.totalFeeDispersed = localRound.totalFeeDispersed.plus(event.params._amount);

    if (localRound.totalFeeDispersed.equals(localRound.feeRewards)) {
      localRound.appealFeesDispersed = true;
    }

    contribution.save();
    localRound.save();
  }
}
