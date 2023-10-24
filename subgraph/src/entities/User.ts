import { BigInt, BigDecimal } from "@graphprotocol/graph-ts";
import { User } from "../../generated/schema";
import { ONE, ZERO } from "../utils";

export function computeCoherenceScore(totalCoherent: BigInt, totalResolvedDisputes: BigInt): BigInt {
  const smoothingFactor = BigInt.fromI32(10);
  const shiftFactor = BigInt.fromI32(1000);
  let denominator = totalResolvedDisputes.plus(smoothingFactor);
  let coherencyRatio = totalCoherent.toBigDecimal().div(denominator.toBigDecimal());
  const coherencyScore = coherencyRatio.times(BigDecimal.fromString("100"));
  const shiftedValue = coherencyScore.times(BigDecimal.fromString("1000"));
  const shiftedBigInt = BigInt.fromString(shiftedValue.toString().split(".")[0]);
  const halfShiftFactor = shiftFactor.div(BigInt.fromI32(2));
  const remainder = shiftedBigInt.mod(shiftFactor);

  if (remainder.ge(halfShiftFactor)) {
    return shiftedBigInt.div(shiftFactor).plus(BigInt.fromI32(1));
  } else {
    return shiftedBigInt.div(shiftFactor);
  }
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
  user.totalStake = ZERO;
  user.totalDelayed = ZERO;
  user.activeDisputes = ZERO;
  user.disputes = [];
  user.rounds = [];
  user.resolvedDisputes = [];
  user.totalResolvedDisputes = ZERO;
  user.totalAppealingDisputes = ZERO;
  user.totalDisputes = ZERO;
  user.totalCoherent = ZERO;
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

export function resolveUserDispute(id: string, previousFeeAmount: BigInt, feeAmount: BigInt, disputeID: string): void {
  const user = ensureUser(id);
  if (user.resolvedDisputes.includes(disputeID)) {
    if (previousFeeAmount.gt(ZERO)) {
      if (feeAmount.le(ZERO)) {
        user.totalCoherent = user.totalCoherent.minus(ONE);
      }
    } else if (previousFeeAmount.le(ZERO)) {
      if (feeAmount.gt(ZERO)) {
        user.totalCoherent = user.totalCoherent.plus(ONE);
      }
    }
    user.save();
    return;
  }
  user.resolvedDisputes = user.resolvedDisputes.concat([disputeID]);
  user.totalResolvedDisputes = user.totalResolvedDisputes.plus(ONE);
  if (feeAmount.gt(ZERO)) {
    user.totalCoherent = user.totalCoherent.plus(ONE);
  }
  user.activeDisputes = user.activeDisputes.minus(ONE);
  user.coherenceScore = computeCoherenceScore(user.totalCoherent, user.totalResolvedDisputes);
  user.save();
}
