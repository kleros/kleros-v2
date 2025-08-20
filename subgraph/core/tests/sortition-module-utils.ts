import { newMockEvent } from "matchstick-as";
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts";
import { StakeDelayed, StakeLocked, StakeSet } from "../generated/SortitionModule/SortitionModule";

export function createStakeDelayedEvent(_address: Address, _courtID: BigInt, _amount: BigInt): StakeDelayed {
  let StakeDelayed: StakeDelayed = newMockEvent();

  StakeDelayed.parameters = new Array();

  StakeDelayed.parameters.push(new ethereum.EventParam("_address", ethereum.Value.fromAddress(_address)));
  StakeDelayed.parameters.push(new ethereum.EventParam("_courtID", ethereum.Value.fromUnsignedBigInt(_courtID)));
  StakeDelayed.parameters.push(new ethereum.EventParam("_amount", ethereum.Value.fromUnsignedBigInt(_amount)));

  return StakeDelayed;
}

export function createStakeLockedEvent(_address: Address, _relativeAmount: BigInt, _unlock: boolean): StakeLocked {
  let stakeLockedEvent = newMockEvent();

  stakeLockedEvent.parameters = new Array();

  stakeLockedEvent.parameters.push(new ethereum.EventParam("_address", ethereum.Value.fromAddress(_address)));
  stakeLockedEvent.parameters.push(
    new ethereum.EventParam("_relativeAmount", ethereum.Value.fromUnsignedBigInt(_relativeAmount))
  );
  stakeLockedEvent.parameters.push(new ethereum.EventParam("_unlock", ethereum.Value.fromBoolean(_unlock)));

  return stakeLockedEvent;
}

export function createStakeSetEvent(
  _address: Address,
  _courtID: BigInt,
  _amount: BigInt,
  _amountAllCourts: BigInt
): StakeSet {
  let stakeSetEvent = newMockEvent();

  stakeSetEvent.parameters = new Array();

  stakeSetEvent.parameters.push(new ethereum.EventParam("_address", ethereum.Value.fromAddress(_address)));
  stakeSetEvent.parameters.push(new ethereum.EventParam("_courtID", ethereum.Value.fromUnsignedBigInt(_courtID)));
  stakeSetEvent.parameters.push(new ethereum.EventParam("_amount", ethereum.Value.fromUnsignedBigInt(_amount)));
  stakeSetEvent.parameters.push(
    new ethereum.EventParam("_amountAllCourts", ethereum.Value.fromUnsignedBigInt(_amountAllCourts))
  );

  return stakeSetEvent;
}
