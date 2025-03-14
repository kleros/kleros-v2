import {
  SortitionModule,
  StakeDelayedAlreadyTransferred,
  StakeDelayedAlreadyTransferredWithdrawn,
  StakeDelayedNotTransferred,
  StakeLocked,
  StakeSet as StakeSetEvent,
} from "../generated/SortitionModule/SortitionModule";
import { StakeSet as StakeSetEntity } from "../generated/schema";

import { updateJurorDelayedStake, updateJurorStake } from "./entities/JurorTokensPerCourt";
import { ensureUser } from "./entities/User";
import { ZERO } from "./utils";

export function handleStakeDelayedAlreadyTransferred(event: StakeDelayedAlreadyTransferred): void {
  updateJurorDelayedStake(event.params._address.toHexString(), event.params._courtID.toString(), event.params._amount);
}

export function handleStakeDelayedAlreadyTransferredWithdrawn(event: StakeDelayedAlreadyTransferredWithdrawn): void {
  updateJurorDelayedStake(event.params._address.toHexString(), event.params._courtID.toString(), event.params._amount);
}

export function handleStakeDelayedNotTransferred(event: StakeDelayedNotTransferred): void {
  updateJurorDelayedStake(event.params._address.toHexString(), event.params._courtID.toString(), event.params._amount);
}

export function handleStakeSet(event: StakeSetEvent): void {
  const jurorAddress = event.params._address.toHexString();
  const courtID = event.params._courtID.toString();

  updateJurorStake(jurorAddress, courtID.toString(), SortitionModule.bind(event.address), event.block.timestamp);
  //stake is updated instantly so no delayed amount, set delay amount to zero
  updateJurorDelayedStake(jurorAddress, courtID, ZERO);

  const stakeSet = new StakeSetEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
  const juror = ensureUser(jurorAddress);
  stakeSet.juror = juror.id;
  stakeSet.courtID = event.params._courtID;
  stakeSet.stake = event.params._amount;
  stakeSet.newTotalStake = juror.totalStake;
  stakeSet.blocknumber = event.block.number;
  stakeSet.timestamp = event.block.timestamp;
  stakeSet.logIndex = event.logIndex;
  stakeSet.save();
}

export function handleStakeLocked(event: StakeLocked): void {}
