import { BigInt, BigDecimal } from "@graphprotocol/graph-ts";
import { User } from "../../generated/schema";
import { ONE, ZERO } from "../utils";

export function computeCoherenceScore(totalCoherentVotes: BigInt, totalResolvedVotes: BigInt): BigInt {
  const smoothingFactor = BigDecimal.fromString("10");

  let denominator = totalResolvedVotes.toBigDecimal().plus(smoothingFactor);
  let coherencyRatio = totalCoherentVotes.toBigDecimal().div(denominator);

  const coherencyScore = coherencyRatio.times(BigDecimal.fromString("100"));

  const roundedScore = coherencyScore.plus(BigDecimal.fromString("0.5"));

  return BigInt.fromString(roundedScore.toString().split(".")[0]);
}

export function ensureUser(id: string): User {
  const user = User.load(id);

  if (user) {
    return user;
  }

  return createUserFromAddress(id);
}

export function createUserFromAddress(id: string): User {
  const user = new User(id);
  user.userAddress = id.toLowerCase();
  user.totalStake = ZERO;
  user.totalDelayed = ZERO;
  user.activeDisputes = ZERO;
  user.disputes = [];
  user.rounds = [];
  user.resolvedDisputes = [];
  user.totalResolvedDisputes = ZERO;
  user.totalAppealingDisputes = ZERO;
  user.totalDisputes = ZERO;
  user.totalCoherentVotes = ZERO;
  user.totalResolvedVotes = ZERO;
  user.coherenceScore = ZERO;
  user.save();

  return user;
}

export function addUserActiveDispute(id: string, disputeID: string): void {
  const user = ensureUser(id);
  if (user.disputes.includes(disputeID)) {
    return;
  }
  user.disputes = user.disputes.concat([disputeID]);
  user.activeDisputes = user.activeDisputes.plus(ONE);
  user.totalDisputes = user.totalDisputes.plus(ONE);
  user.save();
}

export function resolveUserDispute(id: string, disputeID: string): void {
  const user = ensureUser(id);
  if (user.resolvedDisputes.includes(disputeID)) {
    return;
  }
  user.resolvedDisputes = user.resolvedDisputes.concat([disputeID]);
  user.totalResolvedDisputes = user.totalResolvedDisputes.plus(ONE);
  user.activeDisputes = user.activeDisputes.minus(ONE);
  user.save();
}
