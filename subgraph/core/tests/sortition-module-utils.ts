import { newMockEvent } from "matchstick-as";
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts";
import {
  StakeDelayedAlreadyTransferred,
  StakeDelayedAlreadyTransferredWithdrawn,
  StakeDelayedNotTransferred,
  StakeLocked,
  StakeSet,
} from "../generated/SortitionModule/SortitionModule";

export function createStakeDelayedAlreadyTransferredEvent(
  _address: Address,
  _courtID: BigInt,
  _amount: BigInt
): StakeDelayedAlreadyTransferred {
  let stakeDelayedAlreadyTransferredEvent: StakeDelayedAlreadyTransferred = newMockEvent();

  stakeDelayedAlreadyTransferredEvent.parameters = new Array();

  stakeDelayedAlreadyTransferredEvent.parameters.push(
    new ethereum.EventParam("_address", ethereum.Value.fromAddress(_address))
  );
  stakeDelayedAlreadyTransferredEvent.parameters.push(
    new ethereum.EventParam("_courtID", ethereum.Value.fromUnsignedBigInt(_courtID))
  );
  stakeDelayedAlreadyTransferredEvent.parameters.push(
    new ethereum.EventParam("_amount", ethereum.Value.fromUnsignedBigInt(_amount))
  );

  return stakeDelayedAlreadyTransferredEvent;
}

export function createStakeDelayedAlreadyTransferredWithdrawnEvent(
  _address: Address,
  _courtID: BigInt,
  _amount: BigInt
): StakeDelayedAlreadyTransferredWithdrawn {
  let stakeDelayedAlreadyTransferredWithdrawnEvent = newMockEvent();

  stakeDelayedAlreadyTransferredWithdrawnEvent.parameters = new Array();

  stakeDelayedAlreadyTransferredWithdrawnEvent.parameters.push(
    new ethereum.EventParam("_address", ethereum.Value.fromAddress(_address))
  );
  stakeDelayedAlreadyTransferredWithdrawnEvent.parameters.push(
    new ethereum.EventParam("_courtID", ethereum.Value.fromUnsignedBigInt(_courtID))
  );
  stakeDelayedAlreadyTransferredWithdrawnEvent.parameters.push(
    new ethereum.EventParam("_amount", ethereum.Value.fromUnsignedBigInt(_amount))
  );

  return stakeDelayedAlreadyTransferredWithdrawnEvent;
}

export function createStakeDelayedNotTransferredEvent(
  _address: Address,
  _courtID: BigInt,
  _amount: BigInt
): StakeDelayedNotTransferred {
  let stakeDelayedNotTransferredEvent = newMockEvent();

  stakeDelayedNotTransferredEvent.parameters = new Array();

  stakeDelayedNotTransferredEvent.parameters.push(
    new ethereum.EventParam("_address", ethereum.Value.fromAddress(_address))
  );
  stakeDelayedNotTransferredEvent.parameters.push(
    new ethereum.EventParam("_courtID", ethereum.Value.fromUnsignedBigInt(_courtID))
  );
  stakeDelayedNotTransferredEvent.parameters.push(
    new ethereum.EventParam("_amount", ethereum.Value.fromUnsignedBigInt(_amount))
  );

  return stakeDelayedNotTransferredEvent;
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

export function createStakeSetEvent(_address: Address, _courtID: BigInt, _amount: BigInt): StakeSet {
  let stakeSetEvent = newMockEvent();

  stakeSetEvent.parameters = new Array();

  stakeSetEvent.parameters.push(new ethereum.EventParam("_address", ethereum.Value.fromAddress(_address)));
  stakeSetEvent.parameters.push(new ethereum.EventParam("_courtID", ethereum.Value.fromUnsignedBigInt(_courtID)));
  stakeSetEvent.parameters.push(new ethereum.EventParam("_amount", ethereum.Value.fromUnsignedBigInt(_amount)));

  return stakeSetEvent;
}
