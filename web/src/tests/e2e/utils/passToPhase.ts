import { getContract } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import type { HardhatClient } from "../fixtures/hardhat";
import type { TimeFixture } from "../fixtures/time";

import { ACCOUNT_PKEYS } from "./accounts";
import { sortitionModuleContractConfig } from "./contracts";

import { ONE_MINUTE } from ".";

export enum SortitionPhase {
  Staking,
  Generating,
  Drawing,
}

const PHASE_NAMES = ["staking", "generating", "drawing"] as const;

/**
 * Advance the sortition phase to a target phase (staking, generating, drawing).
 *
 * @example
 * ```ts
 * await passToPhase(hardhat, timeFixture, SortitionPhase.Drawing); // Advance to drawing phase
 * await passToPhase(hardhat, timeFixture, SortitionPhase.Staking); // Advance to staking phase
 * ```
 */
export async function passToPhase(hardhat: HardhatClient, time: TimeFixture, targetPhase: SortitionPhase) {
  const maxAttempts = 10;

  const sortitionModule = getContract({
    ...sortitionModuleContractConfig,
    client: hardhat,
  });

  const getPhase = () => sortitionModule.read.phase().then((p) => Number(p) as SortitionPhase);
  const getLastPhaseChange = () => sortitionModule.read.lastPhaseChange();
  const getMinStakingTime = () => sortitionModule.read.minStakingTime();
  const getMaxDrawingTime = () => sortitionModule.read.maxDrawingTime();
  const getDisputesWithoutJurors = () => sortitionModule.read.disputesWithoutJurors();

  const account = privateKeyToAccount(ACCOUNT_PKEYS.alice);

  const callPassPhase = async () => {
    const hash = await hardhat.writeContract({
      ...sortitionModuleContractConfig,
      functionName: "passPhase",
      account,
    });
    await hardhat.waitForTransactionReceipt({ hash });
    await time.sync();
  };

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const currentPhase = await getPhase();
    // we go through the loop and once we reach the target phase we return
    if (currentPhase === targetPhase) return;

    const blockTime = await time.getHardhatTime();
    const lastPhaseChange = Number(await getLastPhaseChange());
    const minStakingTime = Number(await getMinStakingTime());
    const maxDrawingTime = Number(await getMaxDrawingTime());
    // if there's no disputes that need jurors, the phase wont pass
    const disputesWithoutJurors = await getDisputesWithoutJurors();

    if (currentPhase === SortitionPhase.Staking) {
      const elapsed = blockTime - lastPhaseChange;
      if (elapsed < minStakingTime) {
        const timeToAdvance = minStakingTime - elapsed + 1;
        await time.advanceTime(timeToAdvance);
      }
      if (disputesWithoutJurors === 0n) {
        throw new Error(`passToPhase: Cannot pass from staking to generating - no disputes need jurors`);
      }
    } else if (currentPhase === SortitionPhase.Drawing) {
      const elapsed = blockTime - lastPhaseChange;
      if (disputesWithoutJurors > 0n && elapsed < maxDrawingTime) {
        const timeToAdvance = maxDrawingTime - elapsed + 1;
        await time.advanceTime(timeToAdvance);
      }
    }

    try {
      await callPassPhase();
    } catch (err) {
      if (currentPhase === SortitionPhase.Generating) {
        // rng could be stuck, advancing by a significant time to trigger fallback
        await time.advanceTime(10 * ONE_MINUTE);
      } else {
        throw err;
      }
    }
  }

  const finalPhase = await getPhase();
  throw new Error(
    `passToPhase: Failed to reach phase ${PHASE_NAMES[targetPhase]} 
     after ${maxAttempts} attempts, stuck at ${PHASE_NAMES[finalPhase]}`
  );
}
