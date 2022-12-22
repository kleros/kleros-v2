import { Bytes } from "@graphprotocol/graph-ts";
import {
  KlerosCore,
  DisputeCreation,
} from "../../generated/KlerosCore/KlerosCore";
import { Dispute } from "../../generated/schema";
import { ZERO } from "../utils";

export function ensureDispute(id: string): Dispute {
  let dispute = Dispute.load(id);

  if (dispute) {
    return dispute;
  }
  // Should never reach here
  dispute = new Dispute(id);
  dispute.court = "1";
  dispute.arbitrated = Bytes.fromHexString("0x0");
  dispute.period = "evidence";
  dispute.ruled = false;
  dispute.lastPeriodChange = ZERO;
  dispute.currentRoundIndex = ZERO;
  const roundID = `${id}-${ZERO.toString()}`;
  dispute.currentRound = roundID;
  dispute.save();

  return dispute;
}

export function createDisputeFromEvent(event: DisputeCreation): void {
  const contract = KlerosCore.bind(event.address);
  const disputeID = event.params._disputeID;
  const disputeContractState = contract.disputes(disputeID);
  const dispute = new Dispute(disputeID.toString());
  dispute.court = disputeContractState.value0.toString();
  dispute.arbitrated = event.params._arbitrable;
  dispute.period = "evidence";
  dispute.ruled = false;
  dispute.lastPeriodChange = event.block.timestamp;
  dispute.currentRoundIndex = ZERO;
  const roundID = `${disputeID.toString()}-${ZERO.toString()}`;
  dispute.currentRound = roundID;
  dispute.save();
}
