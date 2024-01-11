import { DisputeCreation } from "../../generated/DisputeKitClassic/DisputeKitClassic";
import { ClassicDispute } from "../../generated/schema";
import { ZERO } from "../utils";

export function createClassicDisputeFromEvent(event: DisputeCreation): void {
  const coreDisputeID = event.params._coreDisputeID.toString();
  const classicDispute = new ClassicDispute(`1-${coreDisputeID}`);
  classicDispute.coreDispute = coreDisputeID;
  classicDispute.currentLocalRoundIndex = ZERO;
  classicDispute.numberOfChoices = event.params._numberOfChoices;
  classicDispute.extraData = event.params._extraData;
  classicDispute.timestamp = event.block.timestamp;
  classicDispute.save();
}
