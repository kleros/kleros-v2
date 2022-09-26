import { BigInt } from "@graphprotocol/graph-ts";
import { Evidence as EvidenceEvent } from "../generated/DisputeKitClassic/DisputeKitClassic";
import { Evidence, EvidenceGroup } from "../generated/schema";

export function handleDisputeEvent(event: EvidenceEvent): void {
  if (
    event.params._arbitrator.toString() ===
    "0x815d709EFCF5E69e2e9E2F8d3815d762496a2f0F"
  ) {
    const evidenceGroupID = event.params._evidenceGroupID;
    let evidenceGroup = EvidenceGroup.load(evidenceGroupID.toString());
    if (!evidenceGroup) {
      evidenceGroup = new EvidenceGroup(evidenceGroupID.toString());
      evidenceGroup.lastEvidenceID = BigInt.fromI32(0);
      evidenceGroup.save();
    }
    const evidenceID = evidenceGroup.lastEvidenceID.plus(BigInt.fromI32(1));
    const evidence = new Evidence(`${evidenceGroupID}-${evidenceID}`);
    evidence.evidence = event.params._evidence;
    evidence.evidenceGroup = evidenceGroupID.toString();
    evidence.save();
  }
}
