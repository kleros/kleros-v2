import { BigInt } from "@graphprotocol/graph-ts";
import { DisputeCreation } from "../../generated/DisputeKitClassic/DisputeKitClassic";
import { ClassicDispute } from "../../generated/schema";

export function createClassicDisputeFromEvent(event: DisputeCreation, disputeKitID: string, roundIndex: BigInt): void {
  const coreDisputeID = event.params._coreDisputeID.toString();
  const classicDispute = new ClassicDispute(`${disputeKitID}-${coreDisputeID}`);
  classicDispute.coreDispute = coreDisputeID;
  classicDispute.currentLocalRoundIndex = roundIndex;
  classicDispute.numberOfChoices = event.params._numberOfChoices;
  classicDispute.extraData = event.params._extraData;
  classicDispute.timestamp = event.block.timestamp;
  classicDispute.save();
}
