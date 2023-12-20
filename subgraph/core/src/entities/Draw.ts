import { Draw as DrawEvent } from "../../generated/KlerosCore/KlerosCore";
import { Draw, User } from "../../generated/schema";
import { getAndIncrementPeriodCounter } from "./PeriodIndexCounter";

export function createDrawFromEvent(event: DrawEvent): void {
  const disputeID = event.params._disputeID.toString();
  const roundIndex = event.params._roundID;
  const roundID = `${disputeID}-${roundIndex.toString()}`;
  const voteID = event.params._voteID;
  const drawID = `${disputeID}-${roundIndex.toString()}-${voteID.toString()}`;
  const draw = new Draw(drawID);
  draw.blockNumber = event.block.number;
  const user = User.load(event.params._address.toHexString());
  if (user && !user.disputes.includes(disputeID)) {
    draw.drawNotificationIndex = getAndIncrementPeriodCounter("draw");
  }
  draw.dispute = disputeID;
  draw.round = roundID;
  draw.juror = event.params._address.toHexString();
  draw.voteIDNum = voteID;
  draw.save();
}
