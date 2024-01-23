import { BigInt } from "@graphprotocol/graph-ts";
import { Contribution } from "../../generated/DisputeKitClassic/DisputeKitClassic";
import { ClassicRound } from "../../generated/schema";
import { ONE, ZERO } from "../utils";

export function createClassicRound(disputeID: string, numberOfChoices: BigInt, roundIndex: BigInt): void {
  const choicesLength = numberOfChoices.plus(ONE);
  const localDisputeID = `1-${disputeID}`;
  const id = `${localDisputeID}-${roundIndex.toString()}`;
  const classicRound = new ClassicRound(id);
  classicRound.localDispute = localDisputeID;
  classicRound.winningChoice = ZERO;
  classicRound.counts = new Array<BigInt>(choicesLength.toI32()).fill(ZERO);
  classicRound.tied = true;
  classicRound.totalVoted = ZERO;
  classicRound.totalCommited = ZERO;
  classicRound.paidFees = new Array<BigInt>(choicesLength.toI32()).fill(ZERO);
  classicRound.feeRewards = ZERO;
  classicRound.fundedChoices = [];
  classicRound.save();
}

class CurrentRulingInfo {
  ruling: BigInt;
  tied: boolean;
}

export function updateCountsAndGetCurrentRuling(id: string, choice: BigInt, delta: BigInt): CurrentRulingInfo {
  const round = ClassicRound.load(id);
  if (!round) return { ruling: ZERO, tied: false };
  const choiceNum = choice.toI32();
  const newChoiceCount = round.counts[choiceNum].plus(delta);
  let newCounts: BigInt[] = [];
  for (let i = 0; i < round.counts.length; i++) {
    if (BigInt.fromI32(i).equals(choice)) {
      newCounts.push(newChoiceCount);
    } else {
      newCounts.push(round.counts[i]);
    }
  }
  round.counts = newCounts;
  const currentWinningCount = round.counts[round.winningChoice.toI32()];
  if (choice.equals(round.winningChoice)) {
    if (round.tied) round.tied = false;
  } else {
    if (newChoiceCount.equals(currentWinningCount)) {
      if (!round.tied) round.tied = true;
    } else if (newChoiceCount.gt(currentWinningCount)) {
      round.winningChoice = choice;
      round.tied = false;
    }
  }
  round.totalVoted = round.totalVoted.plus(delta);
  round.save();
  return { ruling: round.winningChoice, tied: round.tied };
}

export function updateChoiceFundingFromContributionEvent(event: Contribution): void {
  const disputeKitID = "1";
  const coreDisputeID = event.params._coreDisputeID.toString();
  const coreRoundIndex = event.params._coreRoundID.toString();
  const roundID = `${disputeKitID}-${coreDisputeID}-${coreRoundIndex}`;

  const classicRound = ClassicRound.load(roundID);
  if (!classicRound) return;

  const choice = event.params._choice;
  const amount = event.params._amount;
  const currentPaidFees = classicRound.paidFees[choice.toI32()];
  let newPaidFees: BigInt[] = [];
  for (let i = 0; i < classicRound.paidFees.length; i++) {
    if (BigInt.fromI32(i).equals(choice)) {
      newPaidFees.push(currentPaidFees.plus(amount));
    } else {
      newPaidFees.push(classicRound.paidFees[i]);
    }
  }
  classicRound.paidFees = newPaidFees;
  classicRound.save();
}
