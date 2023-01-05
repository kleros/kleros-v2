import { log } from "@graphprotocol/graph-ts";
import { DisputeCreation } from "../../generated/DisputeKitClassic/DisputeKitClassic";
import { ClassicDispute } from "../../generated/schema";

export function loadClassicDisputeWithLog(id: string): ClassicDispute | null {
  const classicDispute = ClassicDispute.load(id);
  if (!classicDispute) {
    log.error("ClassicDispute not found with id: {}", [id]);
    return null;
  }
  return classicDispute;
}

export function createClassicDisputeFromEvent(event: DisputeCreation): void {
  const coreDisputeID = event.params._coreDisputeID.toString();
  const classicDispute = new ClassicDispute(`1-${coreDisputeID}`);
  classicDispute.coreDispute = coreDisputeID;
  classicDispute.numberOfChoices = event.params._numberOfChoices;
  classicDispute.jumped = false;
  classicDispute.extraData = event.params._extraData;
  classicDispute.save();
}
