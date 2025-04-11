import { BigInt, Address } from "@graphprotocol/graph-ts";
import { Court, JurorTokensPerCourt } from "../../generated/schema";
import { updateActiveJurors, getDelta, updateStakedPNK, updateCourtStateVariable } from "../datapoint";
import { ensureUser } from "./User";
import { ONE, ZERO } from "../utils";
import { SortitionModule } from "../../generated/SortitionModule/SortitionModule";
import { updateEffectiveNumberStakedJurors, updateEffectiveStake } from "./Court";

export function ensureJurorTokensPerCourt(jurorAddress: string, courtID: string): JurorTokensPerCourt {
  const id = `${jurorAddress}-${courtID}`;
  const jurorTokens = JurorTokensPerCourt.load(id);

  if (jurorTokens) {
    return jurorTokens;
  }

  return createJurorTokensPerCourt(jurorAddress, courtID);
}

export function createJurorTokensPerCourt(jurorAddress: string, courtID: string): JurorTokensPerCourt {
  const id = `${jurorAddress}-${courtID}`;

  const jurorTokens = new JurorTokensPerCourt(id);
  jurorTokens.juror = jurorAddress;
  jurorTokens.court = courtID;
  jurorTokens.effectiveStake = ZERO;
  jurorTokens.staked = ZERO;
  jurorTokens.locked = ZERO;
  jurorTokens.delayed = ZERO;
  jurorTokens.save();

  return jurorTokens;
}

export function updateJurorEffectiveStake(jurorAddress: string, courtID: string): void {
  let court = Court.load(courtID);
  if (!court) {
    return;
  }

  while (court) {
    const jurorTokensPerCourt = ensureJurorTokensPerCourt(jurorAddress, court.id);
    let totalStake = jurorTokensPerCourt.staked;
    const childrenCourts = court.children.load();

    for (let i = 0; i < childrenCourts.length; i++) {
      const childCourtID = childrenCourts[i].id;
      const childCourt = Court.load(childCourtID);
      if (childCourt) {
        const childJurorTokensPerCourt = ensureJurorTokensPerCourt(jurorAddress, childCourt.id);
        totalStake = totalStake.plus(childJurorTokensPerCourt.effectiveStake);
      }
    }

    jurorTokensPerCourt.effectiveStake = totalStake;
    jurorTokensPerCourt.save();

    if (court.parent && court.parent !== null) {
      court = Court.load(court.parent as string);
    } else {
      break;
    }
  }
}

export function updateJurorStake(
  jurorAddress: string,
  courtID: string,
  contract: SortitionModule,
  timestamp: BigInt
): void {
  const juror = ensureUser(jurorAddress);
  const court = Court.load(courtID);
  if (!court) return;
  const jurorTokens = ensureJurorTokensPerCourt(jurorAddress, courtID);

  // TODO: index the sortition module and handle these events there
  const jurorBalance = contract.getJurorBalance(Address.fromString(jurorAddress), BigInt.fromString(courtID));
  const previousStake = jurorTokens.staked;
  const previousTotalStake = juror.totalStake;
  jurorTokens.staked = jurorBalance.value2;
  jurorTokens.locked = jurorBalance.value1;
  jurorTokens.save();
  const stakeDelta = getDelta(previousStake, jurorTokens.staked);
  const newTotalStake = juror.totalStake.plus(stakeDelta);
  juror.totalStake = newTotalStake;
  court.stake = court.stake.plus(stakeDelta);
  updateStakedPNK(stakeDelta, timestamp);
  const activeJurorsDelta = getActivityDelta(previousTotalStake, newTotalStake);
  const stakedJurorsDelta = getActivityDelta(previousStake, jurorBalance.value2);
  court.numberStakedJurors = court.numberStakedJurors.plus(stakedJurorsDelta);
  updateActiveJurors(activeJurorsDelta, timestamp);
  juror.save();
  court.save();
  updateEffectiveStake(courtID);
  updateEffectiveNumberStakedJurors(courtID);
  updateJurorEffectiveStake(jurorAddress, courtID);
  updateCourtStateVariable(courtID, court.effectiveStake, timestamp, "effectiveStake");
}

export function updateJurorDelayedStake(jurorAddress: string, courtID: string, amount: BigInt): void {
  const juror = ensureUser(jurorAddress);
  const court = Court.load(courtID);
  if (!court) return;
  const jurorTokens = ensureJurorTokensPerCourt(jurorAddress, courtID);
  let lastDelayedAmount = jurorTokens.delayed;

  jurorTokens.delayed = amount;
  //since we need to track only the latest delay amount now, subtract the previous amount and add the new amount
  juror.totalDelayed = juror.totalDelayed.plus(amount).minus(lastDelayedAmount);
  court.delayedStake = court.stake.plus(amount).minus(lastDelayedAmount);
  jurorTokens.save();
  juror.save();
  court.save();
}

function getActivityDelta(previousStake: BigInt, newStake: BigInt): BigInt {
  if (previousStake.gt(ZERO)) {
    return newStake.gt(ZERO) ? ZERO : BigInt.fromI32(-1);
  } else {
    return newStake.gt(ZERO) ? ONE : ZERO;
  }
}
