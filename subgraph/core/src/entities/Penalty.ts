import { TokenAndETHShift } from "../../generated/KlerosCore/KlerosCore";
import { Penalty } from "../../generated/schema";
import { ONE } from "../utils";

export function updatePenalty(event: TokenAndETHShift): void {
  const disputeID = event.params._disputeID.toString();
  const roundIndex = event.params._roundID.toString();
  const roundID = `${disputeID}-${roundIndex}`;
  const jurorAddress = event.params._account.toHexString();
  const penaltyID = `${roundID}-${jurorAddress}`;
  const penalty = Penalty.load(penaltyID);
  if (penalty) {
    penalty.amount = penalty.amount.plus(event.params._pnkAmount);
    const totalCoherency = penalty.degreeOfCoherency.times(penalty.numberDraws);
    penalty.numberDraws = penalty.numberDraws.plus(ONE);
    penalty.degreeOfCoherency = totalCoherency.plus(penalty.degreeOfCoherency).div(penalty.numberDraws);
    penalty.save();
  } else {
    createPenalty(event);
  }
}

export function createPenalty(event: TokenAndETHShift): void {
  const disputeID = event.params._disputeID.toString();
  const roundIndex = event.params._roundID.toString();
  const roundID = `${disputeID}-${roundIndex}`;
  const jurorAddress = event.params._account.toHexString();
  const penaltyID = `${roundID}-${jurorAddress}`;
  const penalty = new Penalty(penaltyID);
  penalty.dispute = disputeID;
  penalty.round = roundID;
  penalty.juror = jurorAddress;
  penalty.numberDraws = ONE;
  penalty.amount = event.params._pnkAmount;
  penalty.degreeOfCoherency = event.params._degreeOfCoherency;
  penalty.save();
}
