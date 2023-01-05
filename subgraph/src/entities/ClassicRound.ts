import { BigInt, log } from "@graphprotocol/graph-ts";
import { Contribution } from "../../generated/DisputeKitClassic/DisputeKitClassic";
import { ClassicRound } from "../../generated/schema";
import { ZERO } from "../utils";

export function loadClassicRoundWithLog(id: string): ClassicRound | null {
  const classicRound = ClassicRound.load(id);
  if (!classicRound) {
    log.error("ClassicRound not found with id: {}", [id]);
    return null;
  }
  return classicRound;
}

export function createClassicRound(
  disputeID: string,
  roundIndex: BigInt
): void {
  const id = `1-${disputeID}-${roundIndex.toString()}`;
  const classicRound = new ClassicRound(id);
  classicRound.votes = [];
  classicRound.winningChoice = ZERO;
  classicRound.counts = [];
  classicRound.tied = true;
  classicRound.totalVoted = ZERO;
  classicRound.totalCommited = ZERO;
  classicRound.paidFees = [];
  classicRound.feeRewards = ZERO;
  classicRound.fundedChoices = [];
  classicRound.save();
}

export function updateChoiceFundingFromContributionEvent(
  event: Contribution
): void {
  const disputeKitID = "1";
  const coreDisputeID = event.params._coreDisputeID.toString();
  const coreRoundIndex = event.params._coreRoundID.toString();
  const roundID = `${disputeKitID}-${coreDisputeID}-${coreRoundIndex}`;

  const classicRound = loadClassicRoundWithLog(roundID);
  if (!classicRound) return;

  const choice = event.params._choice;
  const amount = event.params._amount;
  const currentPaidFees = classicRound.paidFees[choice.toI32()];
  classicRound.paidFees[choice.toI32()] = currentPaidFees.plus(amount);
  classicRound.save();
}
