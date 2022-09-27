import { BigInt } from "@graphprotocol/graph-ts";
import { Evidence as EvidenceEvent } from "../generated/DisputeKitClassic/DisputeKitClassic";
import { Evidence, EvidenceGroup } from "../generated/schema";

export function handleEvidenceEvent(event: EvidenceEvent): void {
  const evidenceGroupID = event.params._evidenceGroupID;
  let evidenceGroup = EvidenceGroup.load(evidenceGroupID.toString());
  if (!evidenceGroup) {
    evidenceGroup = new EvidenceGroup(evidenceGroupID.toString());
    evidenceGroup.lastEvidenceID = BigInt.fromI32(0);
  }
  const evidenceID = evidenceGroup.lastEvidenceID.plus(BigInt.fromI32(1));
  const evidence = new Evidence(`${evidenceGroupID}-${evidenceID}`);
  evidence.evidence = event.params._evidence;
  evidence.evidenceGroup = evidenceGroupID.toString();
  evidence.sender = event.params._party;
  evidenceGroup.lastEvidenceID = evidenceID;
  evidenceGroup.save();
  evidence.save();
}
