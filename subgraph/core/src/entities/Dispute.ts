import { KlerosCore, DisputeCreation } from "../../generated/KlerosCore/KlerosCore";
import { Court, Dispute } from "../../generated/schema";
import { ZERO } from "../utils";
import { getAndIncrementPeriodCounter } from "./PeriodIndexCounter";

export function createDisputeFromEvent(event: DisputeCreation): void {
  const disputeID = event.params._disputeID;
  const disputeContractState = KlerosCore.bind(event.address).disputes(disputeID);
  const dispute = new Dispute(disputeID.toString());
  const courtID = disputeContractState.value0.toString();
  dispute.court = courtID;
  dispute.disputeID = disputeID;
  dispute.arbitrated = event.params._arbitrable.toHexString();
  dispute.period = "evidence";
  dispute.ruled = false;
  dispute.currentRuling = ZERO;
  dispute.tied = true;
  dispute.overridden = false;
  dispute.lastPeriodChange = event.block.timestamp;
  dispute.lastPeriodChangeBlockNumber = event.block.number;
  dispute.periodNotificationIndex = getAndIncrementPeriodCounter(dispute.period);
  const court = Court.load(courtID);
  if (!court) return;
  dispute.periodDeadline = event.block.timestamp.plus(court.timesPerPeriod[0]);
  dispute.currentRoundIndex = ZERO;
  const roundID = `${disputeID.toString()}-${ZERO.toString()}`;
  dispute.currentRound = roundID;
  dispute.save();
}
