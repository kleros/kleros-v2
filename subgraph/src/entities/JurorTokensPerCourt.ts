import { BigInt, Address } from "@graphprotocol/graph-ts";
import { KlerosCore } from "../../generated/KlerosCore/KlerosCore";
import { Court, JurorTokensPerCourt } from "../../generated/schema";
import { updateActiveJurors, getDelta, updateStakedPNK } from "../datapoint";
import { ensureUser } from "./User";
import { ONE, ZERO } from "../utils";

export function ensureJurorTokensPerCourt(
  jurorAddress: string,
  courtID: string
): JurorTokensPerCourt {
  const id = `${jurorAddress}-${courtID}`;
  let jurorTokens = JurorTokensPerCourt.load(id);

  if (jurorTokens) {
    return jurorTokens;
  }

  jurorTokens = new JurorTokensPerCourt(id);
  jurorTokens.juror = jurorAddress;
  jurorTokens.court = courtID;
  jurorTokens.staked = ZERO;
  jurorTokens.locked = ZERO;
  jurorTokens.save();

  return jurorTokens;
}

export function createJurorTokensPerCourt(
  jurorAddress: string,
  courtID: string
): JurorTokensPerCourt {
  const id = `${jurorAddress}-${courtID}`;

  const jurorTokens = new JurorTokensPerCourt(id);
  jurorTokens.juror = jurorAddress;
  jurorTokens.court = courtID;
  jurorTokens.staked = ZERO;
  jurorTokens.locked = ZERO;
  jurorTokens.save();

  return jurorTokens;
}

export function updateJurorStake(
  jurorAddress: string,
  courtID: string,
  contract: KlerosCore,
  timestamp: BigInt
): void {
  const juror = ensureUser(jurorAddress);
  const court = Court.load(courtID);
  if (!court) return;
  const jurorTokens = ensureJurorTokensPerCourt(jurorAddress, courtID);
  const jurorBalance = contract.getJurorBalance(
    Address.fromString(jurorAddress),
    BigInt.fromString(courtID)
  );
  const previousStake = jurorTokens.staked;
  const previousTotalStake = juror.totalStake;
  jurorTokens.staked = jurorBalance.value0;
  jurorTokens.locked = jurorBalance.value1;
  jurorTokens.save();
  const stakeDelta = getDelta(previousStake, jurorTokens.staked);
  const newTotalStake = juror.totalStake.plus(stakeDelta);
  juror.totalStake = newTotalStake;
  court.stake = court.stake.plus(stakeDelta);
  updateStakedPNK(stakeDelta, timestamp);
  const activeJurorsDelta = getActivityDelta(previousTotalStake, newTotalStake);
  const stakedJurorsDelta = getActivityDelta(
    previousStake,
    jurorBalance.value0
  );
  court.numberStakedJurors = court.numberStakedJurors.plus(stakedJurorsDelta);
  updateActiveJurors(activeJurorsDelta, timestamp);
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
