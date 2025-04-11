import { BigInt } from "@graphprotocol/graph-ts";
import { CourtCreated } from "../../generated/KlerosCore/KlerosCore";
import { Court } from "../../generated/schema";
import { ZERO } from "../utils";

// This function calculates the "effective" stake, which is the specific stake
// of the current court + the specific stake of all of its children courts
export function updateEffectiveStake(courtID: string): void {
  let court = Court.load(courtID);
  if (!court) return;

  while (court) {
    let totalStake = court.stake;

    const childrenCourts = court.children.load();

    for (let i = 0; i < childrenCourts.length; i++) {
      const childCourt = Court.load(childrenCourts[i].id);
      if (childCourt) {
        totalStake = totalStake.plus(childCourt.effectiveStake);
      }
    }

    court.effectiveStake = totalStake;
    court.save();

    if (court.parent && court.parent !== null) {
      court = Court.load(court.parent as string);
    } else {
      break;
    }
  }
}

// This function calculates the "effective" numberStakedJurors, which is the specific numberStakedJurors
// of the current court + the specific numberStakedJurors of all of its children courts
export function updateEffectiveNumberStakedJurors(courtID: string): void {
  let court = Court.load(courtID);
  if (!court) return;

  while (court) {
    let totalJurors = court.numberStakedJurors;

    const childrenCourts = court.children.load();

    for (let i = 0; i < childrenCourts.length; i++) {
      const childCourt = Court.load(childrenCourts[i].id);
      if (childCourt) {
        totalJurors = totalJurors.plus(childCourt.effectiveNumberStakedJurors);
      }
    }

    court.effectiveNumberStakedJurors = totalJurors;
    court.save();

    if (court.parent && court.parent !== null) {
      court = Court.load(court.parent as string);
    } else {
      break;
    }
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
