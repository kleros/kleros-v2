import { Draw as DrawEvent } from "../../generated/KlerosCore/KlerosCore";
import { Draw, PeriodIndexCounter, User } from "../../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";

export function createDrawFromEvent(event: DrawEvent): void {
  const disputeID = event.params._disputeID.toString();
  const roundIndex = event.params._roundID;
  const roundID = `${disputeID}-${roundIndex.toString()}`;
  const voteID = event.params._voteID;
  const drawID = `${disputeID}-${roundIndex.toString()}-${voteID.toString()}`;
  const draw = new Draw(drawID);
  draw.blockNumber = event.block.number;
  let counter = PeriodIndexCounter.load("draw");
  if (!counter) {
    counter = new PeriodIndexCounter("draw");
    counter.counter = BigInt.fromI32(0);
  }
  const user = User.load(event.params._address.toHexString());
  if (user) {
    const duplicateNotification = user.disputes.includes(disputeID);
    if (!duplicateNotification) {
      draw.drawNotificationIndex = counter.counter;
      counter.counter = counter.counter.plus(BigInt.fromI32(1));
      counter.save();
    }
  }
  draw.dispute = disputeID;
  draw.round = roundID;
  draw.juror = event.params._address.toHexString();
  draw.voteID = voteID;
  draw.save();
}
