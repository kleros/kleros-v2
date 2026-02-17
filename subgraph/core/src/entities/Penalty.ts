import { JurorRewardPenalty } from "../../generated/KlerosCore/KlerosCore";
import { Penalty } from "../../generated/schema";
import { ONE } from "../utils";

export function updatePenalty(event: JurorRewardPenalty): void {
  const disputeID = event.params._disputeID.toString();
  const roundIndex = event.params._roundID.toString();
  const roundID = `${disputeID}-${roundIndex}`;
  const jurorAddress = event.params._account.toHexString();
  const penaltyID = `${roundID}-${jurorAddress}`;
  const penalty = Penalty.load(penaltyID);
  if (penalty) {
    penalty.amount = penalty.amount.plus(event.params._amountPnk);
    const totalCoherency = penalty.degreeOfCoherencyPnk.times(penalty.numberDraws);
    penalty.numberDraws = penalty.numberDraws.plus(ONE);
    penalty.degreeOfCoherencyPnk = totalCoherency.plus(penalty.degreeOfCoherencyPnk).div(penalty.numberDraws);
    // TODO: handle _degreeOfCoherencyFee
    penalty.save();
  } else {
    createPenalty(event);
  }
}

export function createPenalty(event: JurorRewardPenalty): void {
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
  penalty.amount = event.params._amountPnk;
  penalty.degreeOfCoherencyPnk = event.params._degreeOfCoherencyPnk;
  penalty.degreeOfCoherencyFee = event.params._degreeOfCoherencyFee;
  penalty.save();
}
