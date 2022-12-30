import { BigInt, Address } from "@graphprotocol/graph-ts";
import { KlerosCore } from "../../generated/KlerosCore/KlerosCore";
import { JurorTokensPerCourt } from "../../generated/schema";
import { updateActiveJurors, getDelta } from "../datapoint";
import { ensureUser } from "./Juror";
import { ZERO } from "../utils";
import { loadCourtWithLog } from "./Court";

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
  const court = loadCourtWithLog(courtID);
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
  const stakeDelta = getDelta(jurorTokens.staked, previousStake);
  juror.totalStake = juror.totalStake.plus(stakeDelta);
  court.stake = court.stake.plus(stakeDelta);
  let activeJurorsDelta: BigInt;
  let numberStakedJurorsDelta: BigInt;
  if (previousTotalStake.equals(ZERO)) {
    activeJurorsDelta = BigInt.fromI32(1);
    numberStakedJurorsDelta = BigInt.fromI32(1);
  } else if (previousStake.equals(ZERO)) {
    activeJurorsDelta = ZERO;
    numberStakedJurorsDelta = BigInt.fromI32(1);
  } else {
    activeJurorsDelta = ZERO;
    numberStakedJurorsDelta = ZERO;
  }
  court.numberStakedJurors = court.numberStakedJurors.plus(
    numberStakedJurorsDelta
  );
  updateActiveJurors(activeJurorsDelta, timestamp);
  juror.save();
  court.save();
}
