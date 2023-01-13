import { BigInt } from "@graphprotocol/graph-ts";
import { Contribution } from "../../generated/DisputeKitClassic/DisputeKitClassic";
import { ClassicRound } from "../../generated/schema";
import { ZERO } from "../utils";

export function createClassicRound(
  disputeID: string,
  roundIndex: BigInt
): void {
  const localDisputeID = `1-${disputeID}`;
  const id = `${localDisputeID}-${roundIndex.toString()}`;
  const classicRound = new ClassicRound(id);
  classicRound.localDispute = localDisputeID;
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

  const classicRound = ClassicRound.load(roundID);
  if (!classicRound) return;

  const choice = event.params._choice;
  const amount = event.params._amount;
  const currentPaidFees = classicRound.paidFees[choice.toI32()];
  classicRound.paidFees[choice.toI32()] = currentPaidFees.plus(amount);
  classicRound.save();
}
