import { BigInt } from "@graphprotocol/graph-ts";
import { CourtCreated } from "../../generated/KlerosCore/KlerosCore";
import { Court } from "../../generated/schema";
import { ZERO } from "../utils";

// This function calculates the "effective" stake, which is the specific stake
// of the current court + the specific stake of all of its children courts
export function updateEffectiveStake(courtID: string, delta: BigInt): void {
  let court = Court.load(courtID);
  if (!court) return;
  court.effectiveStake = court.effectiveStake.plus(delta);
  court.save();
  if (court.parent) {
    updateEffectiveStake(court.parent as string, delta);
  }
}

// This function calculates the "effective" numberStakedJurors, which is the specific numberStakedJurors
// of the current court + the specific numberStakedJurors of all of its children courts
export function updateEffectiveNumberStakedJurors(courtID: string, delta: BigInt): void {
  let court = Court.load(courtID);
  if (!court) return;
  court.effectiveNumberStakedJurors = court.effectiveNumberStakedJurors.plus(delta);
  court.save();
  if (court.parent) {
    updateEffectiveNumberStakedJurors(court.parent as string, delta);
  }
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
  court.supportedDisputeKits = event.params._supportedDisputeKits.map<string>((value) => value.toString());
  court.numberDisputes = ZERO;
  court.numberClosedDisputes = ZERO;
  court.numberVotingDisputes = ZERO;
  court.numberAppealingDisputes = ZERO;
  court.numberVotes = ZERO;
  court.numberStakedJurors = ZERO;
  court.effectiveNumberStakedJurors = ZERO;
  court.stake = ZERO;
  court.effectiveStake = ZERO;
  court.delayedStake = ZERO;
  court.paidETH = ZERO;
  court.paidPNK = ZERO;
  court.save();
}

export function getFeeForJuror(id: string): BigInt {
  const court = Court.load(id);
  if (!court) return ZERO;
  return court.feeForJuror;
}
