import { json, JSONValueKind, log } from "@graphprotocol/graph-ts";
import { Evidence as EvidenceEvent } from "../generated/EvidenceModule/EvidenceModule";
import { ClassicEvidence, Dispute } from "../generated/schema";
import { ensureUser } from "./entities/User";
import { ONE } from "./utils";
import { JSONValueToMaybeString } from "../../utils";

export function handleEvidenceEvent(event: EvidenceEvent): void {
  const coreDisputeID = event.params._arbitratorDisputeID;
  const dispute = Dispute.load(coreDisputeID.toString());

  if (!dispute) {
    log.error(`EvidenceEvent: Dispute not found for id: {}`, [coreDisputeID.toString()]);
    return;
  }

  dispute.evidenceCount = dispute.evidenceCount.plus(ONE);
  dispute.save();

  const numberOfEvidences = dispute.evidenceCount;
  const evidenceId = `${coreDisputeID}-${numberOfEvidences.toString()}`;

  const evidence = new ClassicEvidence(evidenceId);
  const userId = event.params._party.toHexString();

  evidence.timestamp = event.block.timestamp;
  evidence.transactionHash = event.transaction.hash;
  evidence.evidence = event.params._evidence;
  evidence.sender = userId;
  evidence.senderAddress = userId;
  evidence.evidenceIndex = numberOfEvidences;
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
