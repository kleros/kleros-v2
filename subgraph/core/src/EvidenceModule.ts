import { json, JSONValueKind, log } from "@graphprotocol/graph-ts";
import { Evidence as EvidenceEvent } from "../generated/EvidenceModule/EvidenceModule";
import { ClassicEvidence } from "../generated/schema";
import { ensureClassicEvidenceGroup } from "./entities/ClassicEvidenceGroup";
import { ensureUser } from "./entities/User";
import { ONE } from "./utils";
import { JSONValueToMaybeString } from "../../utils";

export function handleEvidenceEvent(event: EvidenceEvent): void {
  const evidenceGroupID = event.params._externalDisputeID.toString();
  const evidenceGroup = ensureClassicEvidenceGroup(evidenceGroupID);
  const evidenceIndex = evidenceGroup.nextEvidenceIndex;
  evidenceGroup.nextEvidenceIndex = evidenceGroup.nextEvidenceIndex.plus(ONE);
  evidenceGroup.save();
  const evidenceId = `${evidenceGroupID}-${evidenceIndex.toString()}`;
  const evidence = new ClassicEvidence(evidenceId);
  evidence.evidenceIndex = evidenceIndex.plus(ONE).toString();
  const userId = event.params._party.toHexString();
  evidence.timestamp = event.block.timestamp;
  evidence.transactionHash = event.transaction.hash;
  evidence.evidence = event.params._evidence;
  evidence.evidenceGroup = evidenceGroupID.toString();
  evidence.sender = userId;
  evidence.senderAddress = userId;
  ensureUser(userId);

  let jsonObjValueAndSuccess = json.try_fromString(event.params._evidence);
  if (!jsonObjValueAndSuccess.isOk || jsonObjValueAndSuccess.isError) {
    log.error(`Error getting json object for evidenceId {}`, [evidenceId]);
    evidence.save();
    return;
  }

  if (jsonObjValueAndSuccess.value.isNull() || jsonObjValueAndSuccess.value.kind !== JSONValueKind.OBJECT) {
    log.error(`Encountered invalid parsed value for evidenceId {}`, [evidenceId]);
    evidence.save();
    return;
  }

  let jsonObj = jsonObjValueAndSuccess.value.toObject();
  if (!jsonObj) {
    log.error(`Error converting json object for evidenceId {}`, [evidenceId]);
    evidence.save();
    return;
  }

  let name = jsonObj.get("name");
  let description = jsonObj.get("description");
  let fileURI = jsonObj.get("fileURI");
  let fileTypeExtension = jsonObj.get("fileTypeExtension");

  evidence.name = JSONValueToMaybeString(name);
  evidence.description = JSONValueToMaybeString(description);

  if (fileURI) {
    evidence.fileURI = JSONValueToMaybeString(fileURI);
  }

  if (fileTypeExtension) {
    evidence.fileTypeExtension = JSONValueToMaybeString(fileTypeExtension);
  }

  evidence.save();
}
