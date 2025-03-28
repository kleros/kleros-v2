import { newMockEvent } from "matchstick-as";
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts";
import {
  StakeDelayedAlreadyTransferredDeposited,
  StakeDelayedAlreadyTransferredWithdrawn,
  StakeDelayedNotTransferred,
  StakeLocked,
  StakeSet,
} from "../generated/SortitionModule/SortitionModule";

export function createStakeDelayedAlreadyTransferredDepositedEvent(
  _address: Address,
  _courtID: BigInt,
  _amount: BigInt
): StakeDelayedAlreadyTransferredDeposited {
  let stakeDelayedAlreadyTransferredDepositedEvent: StakeDelayedAlreadyTransferredDeposited = newMockEvent();

  stakeDelayedAlreadyTransferredDepositedEvent.parameters = new Array();

  stakeDelayedAlreadyTransferredDepositedEvent.parameters.push(
    new ethereum.EventParam("_address", ethereum.Value.fromAddress(_address))
  );
  stakeDelayedAlreadyTransferredDepositedEvent.parameters.push(
    new ethereum.EventParam("_courtID", ethereum.Value.fromUnsignedBigInt(_courtID))
  );
  stakeDelayedAlreadyTransferredDepositedEvent.parameters.push(
    new ethereum.EventParam("_amount", ethereum.Value.fromUnsignedBigInt(_amount))
  );

  return stakeDelayedAlreadyTransferredDepositedEvent;
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
