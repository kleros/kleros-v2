import { Evidence as EvidenceEvent } from "../generated/EvidenceModule/EvidenceModule";
import { ClassicEvidence } from "../generated/schema";
import { ensureClassicEvidenceGroup } from "./entities/ClassicEvidenceGroup";
import { ensureUser } from "./entities/User";
import { ONE } from "./utils";

export function handleEvidenceEvent(event: EvidenceEvent): void {
  const evidenceGroupID = event.params._externalDisputeID.toString();
  const evidenceGroup = ensureClassicEvidenceGroup(evidenceGroupID);
  const evidenceIndex = evidenceGroup.nextEvidenceIndex;
  evidenceGroup.nextEvidenceIndex = evidenceGroup.nextEvidenceIndex.plus(ONE);
  evidenceGroup.save();
  const evidence = new ClassicEvidence(`${evidenceGroupID}-${evidenceIndex.toString()}`);
  const userId = event.params._party.toHexString();
  evidence.evidence = event.params._evidence;
  evidence.evidenceGroup = evidenceGroupID.toString();
  evidence.sender = userId;
  ensureUser(userId);
  evidence.save();
}
