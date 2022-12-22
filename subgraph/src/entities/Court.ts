import { BigInt } from "@graphprotocol/graph-ts";
import { CourtCreated } from "../../generated/KlerosCore/KlerosCore";
import { Court } from "../../generated/schema";
import { ZERO } from "../utils";

export function ensureCourt(id: string): Court {
  let court = Court.load(id);

  if (court) {
    return court;
  }
  // Should never reach here
  court = new Court(id);

  court.hiddenVotes = false;
  court.parent = "1";
  court.minStake = ZERO;
  court.alpha = ZERO;
  court.feeForJuror = ZERO;
  court.jurorsForCourtJump = ZERO;
  court.timesPerPeriod = [ZERO, ZERO, ZERO, ZERO];
  court.supportedDisputeKits = [];
  court.numberDisputes = ZERO;
  court.numberStakedJurors = ZERO;
  court.stake = ZERO;
  court.paidETH = ZERO;
  court.paidPNK = ZERO;
  court.save();

  return court;
}

export function createCourtFromEvent(event: CourtCreated): void {
  const court = new Court(event.params._courtID.toString());
  court.hiddenVotes = event.params._hiddenVotes;
  court.parent = event.params._parent.toString();
  court.minStake = event.params._minStake;
  court.alpha = event.params._alpha;
  court.feeForJuror = event.params._feeForJuror;
  court.jurorsForCourtJump = event.params._jurorsForCourtJump;
  court.timesPerPeriod = event.params._timesPerPeriod;
  court.supportedDisputeKits = event.params._supportedDisputeKits.map<string>(
    (value) => value.toString()
  );
  court.numberDisputes = ZERO;
  court.numberStakedJurors = ZERO;
  court.stake = ZERO;
  court.paidETH = ZERO;
  court.paidPNK = ZERO;
  court.save();
}

export function getFeeForJuror(id: string): BigInt {
  const court = ensureCourt(id);
  return court.feeForJuror;
}
