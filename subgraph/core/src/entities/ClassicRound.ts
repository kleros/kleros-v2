import { BigInt } from "@graphprotocol/graph-ts";
import { Contribution } from "../../generated/DisputeKitClassic/DisputeKitClassic";
import { Answer, ClassicRound } from "../../generated/schema";
import { ZERO } from "../utils";

export function createClassicRound(disputeID: string, numberOfChoices: BigInt, roundIndex: BigInt): void {
  const localDisputeID = `1-${disputeID}`;
  const id = `${localDisputeID}-${roundIndex.toString()}`;
  const classicRound = new ClassicRound(id);
  classicRound.localDispute = localDisputeID;
  classicRound.winningChoice = ZERO;
  classicRound.tied = true;
  classicRound.totalVoted = ZERO;
  classicRound.totalCommited = ZERO;
  classicRound.feeRewards = ZERO;
  classicRound.appealFeesDispersed = false;
  classicRound.totalFeeDispersed = ZERO;
  classicRound.fundedChoices = [];
  classicRound.save();
}

class CurrentRulingInfo {
  ruling: BigInt;
  tied: boolean;
}

export function ensureAnswer(localRoundId: string, answerId: BigInt): Answer {
  const id = `${localRoundId}-${answerId}`;
  let answer = Answer.load(id);
  if (answer) return answer;
  answer = new Answer(id);
  answer.answerId = answerId;
  answer.count = ZERO;
  answer.paidFee = ZERO;
  answer.funded = false;
  answer.localRound = localRoundId;
  return answer;
}

export function updateCountsAndGetCurrentRuling(id: string, choice: BigInt, delta: BigInt): CurrentRulingInfo {
  const round = ClassicRound.load(id);
  if (!round) return { ruling: ZERO, tied: false };
  const answer = ensureAnswer(id, choice);

  answer.count = answer.count.plus(delta);

  const newChoiceCount = answer.count;

  const winningAnswer = ensureAnswer(id, round.winningChoice);
  const currentWinningCount = winningAnswer.count;

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

  answer.save();
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
  const answer = ensureAnswer(roundID, choice);
  answer.paidFee = answer.paidFee.plus(amount);

  answer.save();
  classicRound.save();
}
