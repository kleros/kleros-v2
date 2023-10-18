import { KlerosCore, DisputeCreation } from "../../generated/KlerosCore/KlerosCore";
import { Court, Dispute, PeriodIndexCounter } from "../../generated/schema";
import { ZERO, ONE } from "../utils";
import { BigInt } from "@graphprotocol/graph-ts";

export function createDisputeFromEvent(event: DisputeCreation): void {
  const contract = KlerosCore.bind(event.address);
  const disputeID = event.params._disputeID;
  const disputeContractState = contract.disputes(disputeID);
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
  dispute.lastPeriodChangeTs = event.block.timestamp;
  dispute.lastPeriodChangeBlockNumber = event.block.number;
  let counter = PeriodIndexCounter.load("evidence");
  if (!counter) {
    counter = new PeriodIndexCounter("evidence");
    counter.counter = BigInt.fromI32(0);
  }
  dispute.periodNotificationIndex = counter.counter;
  counter.counter = counter.counter.plus(ONE);
  counter.save();
  const court = Court.load(courtID);
  if (!court) return;
  dispute.periodDeadline = event.block.timestamp.plus(court.timesPerPeriod[0]);
  dispute.currentRoundIndex = ZERO;
  const roundID = `${disputeID.toString()}-${ZERO.toString()}`;
  dispute.currentRound = roundID;
  dispute.save();
}
