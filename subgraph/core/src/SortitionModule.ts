import {
  SortitionModule,
  StakeDelayedAlreadyTransferred,
  StakeDelayedAlreadyTransferredDeposited,
  StakeDelayedAlreadyTransferredWithdrawn,
  StakeDelayedNotTransferred,
  StakeLocked,
  StakeSet,
} from "../generated/SortitionModule/SortitionModule";

import { updateJurorDelayedStake, updateJurorStake } from "./entities/JurorTokensPerCourt";
import { ensureUser } from "./entities/User";
import { ZERO } from "./utils";

// FIX: temporarily adding this handler for old event name "StakeDelayedAlreadyTransferred", delete when deploying new fresh-address contract.
export function handleStakeDelayedAlreadyTransferred(event: StakeDelayedAlreadyTransferred): void {
  updateJurorDelayedStake(event.params._address.toHexString(), event.params._courtID.toString(), event.params._amount);
}

export function handleStakeDelayedAlreadyTransferredDeposited(event: StakeDelayedAlreadyTransferredDeposited): void {
  updateJurorDelayedStake(event.params._address.toHexString(), event.params._courtID.toString(), event.params._amount);
}

export function handleStakeDelayedAlreadyTransferredWithdrawn(event: StakeDelayedAlreadyTransferredWithdrawn): void {
  updateJurorDelayedStake(event.params._address.toHexString(), event.params._courtID.toString(), event.params._amount);
}

export function handleStakeDelayedNotTransferred(event: StakeDelayedNotTransferred): void {
  updateJurorDelayedStake(event.params._address.toHexString(), event.params._courtID.toString(), event.params._amount);
}

export function handleStakeSet(event: StakeSet): void {
  const jurorAddress = event.params._address.toHexString();
  ensureUser(jurorAddress);
  const courtID = event.params._courtID.toString();

  updateJurorStake(jurorAddress, courtID.toString(), SortitionModule.bind(event.address), event.block.timestamp);
  //stake is updated instantly so no delayed amount, set delay amount to zero
  updateJurorDelayedStake(jurorAddress, courtID, ZERO);
}

export function handleStakeLocked(event: StakeLocked): void {}
