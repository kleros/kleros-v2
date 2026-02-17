import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as/assembly/index";
import { Offset } from "../generated/LeaderboardOffset/LeaderboardOffset";
import { ZERO } from "../src/utils";
import { User } from "../generated/schema";

export const createOffsetEvent = (user: Address, offset: BigInt): Offset => {
  let mockEvent = newMockEvent();
  let offsetEvent = new Offset(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt
  );

  offsetEvent.parameters = new Array();

  let userParam = new ethereum.EventParam("user", ethereum.Value.fromAddress(user));
  let offsetParam = new ethereum.EventParam("offset", ethereum.Value.fromSignedBigInt(offset));
  let arbitratorParam = new ethereum.EventParam("arbitrator", ethereum.Value.fromAddress(user));

  offsetEvent.parameters.push(userParam);
  offsetEvent.parameters.push(offsetParam);
  offsetEvent.parameters.push(arbitratorParam);

  return offsetEvent;
};

export const createUser = (address: Address): User => {
  const user = new User(address.toHexString());
  user.userAddress = address.toHexString().toLowerCase();
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
  user.leaderboardOffset = ZERO;
  user.save();
  return user;
};
