import { BigInt } from "@graphprotocol/graph-ts";
import { User } from "../../generated/schema";
import { ONE, ZERO } from "../utils";

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
  user.activeDisputes = ZERO;
  user.disputes = [];
  user.resolvedDisputes = [];
  user.totalDisputes = ZERO;
  user.totalCoherent = ZERO;
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

export function resolveUserDispute(
  id: string,
  tokenAmount: BigInt,
  disputeID: string
): void {
  const user = ensureUser(id);
  if (user.resolvedDisputes.includes(disputeID)) {
    return;
  }
  user.resolvedDisputes = user.resolvedDisputes.concat([disputeID]);
  if (tokenAmount.ge(ZERO)) {
    user.totalCoherent = user.totalCoherent.plus(ONE);
  }
  user.activeDisputes = user.activeDisputes.minus(ONE);
  user.save();
}
