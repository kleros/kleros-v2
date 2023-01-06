import { Draw as DrawEvent } from "../../generated/KlerosCore/KlerosCore";
import { Draw } from "../../generated/schema";

export function createDrawFromEvent(event: DrawEvent): void {
  const disputeID = event.params._disputeID.toString();
  const roundIndex = event.params._roundID;
  const roundID = `${disputeID}-${roundIndex.toString()}`;
  const voteID = event.params._voteID;
  const drawID = `${disputeID}-${roundIndex.toString()}-${voteID.toString()}`;
  const draw = new Draw(drawID);
  draw.dispute = disputeID;
  draw.round = roundID;
  draw.juror = event.params._address.toHexString();
  draw.voteID = voteID;
  draw.save();
}
