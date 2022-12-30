import { log } from "@graphprotocol/graph-ts";
import {
  KlerosCore,
  DisputeCreation,
} from "../../generated/KlerosCore/KlerosCore";
import { Dispute } from "../../generated/schema";
import { ZERO } from "../utils";

export function loadDisputeWithLog(id: string): Dispute | null {
  const dispute = Dispute.load(id);

  if (!dispute) {
    log.error("Dispute not found with id: {}", [id]);
    return null;
  }

  return dispute;
}

export function createDisputeFromEvent(event: DisputeCreation): void {
  const contract = KlerosCore.bind(event.address);
  const disputeID = event.params._disputeID;
  const disputeContractState = contract.disputes(disputeID);
  const dispute = new Dispute(disputeID.toString());
  dispute.court = disputeContractState.value0.toString();
  dispute.arbitrated = event.params._arbitrable.toHexString();
  dispute.period = "evidence";
  dispute.ruled = false;
  dispute.lastPeriodChange = event.block.timestamp;
  dispute.currentRoundIndex = ZERO;
  const roundID = `${disputeID.toString()}-${ZERO.toString()}`;
  dispute.currentRound = roundID;
  dispute.save();
}
