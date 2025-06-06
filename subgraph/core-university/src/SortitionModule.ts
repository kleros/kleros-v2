import { SortitionModule, StakeLocked, StakeSet } from "../generated/SortitionModule/SortitionModule";

import { updateJurorDelayedStake, updateJurorStake } from "./entities/JurorTokensPerCourt";
import { ensureUser } from "./entities/User";
import { ZERO } from "./utils";

export function handleStakeSet(event: StakeSet): void {
  const jurorAddress = event.params._address.toHexString();
  ensureUser(jurorAddress);
  const courtID = event.params._courtID.toString();

  updateJurorStake(jurorAddress, courtID.toString(), SortitionModule.bind(event.address), event.block.timestamp);
  //stake is updated instantly so no delayed amount, set delay amount to zero
  updateJurorDelayedStake(jurorAddress, courtID, ZERO);
}

export function handleStakeLocked(event: StakeLocked): void {
  // NOP
}
