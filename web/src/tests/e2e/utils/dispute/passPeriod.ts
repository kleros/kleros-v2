import { privateKeyToAccount } from "viem/accounts";

import { TimeFixture } from "../../fixtures";
import type { HardhatClient } from "../../fixtures/hardhat";
import { ACCOUNT_PKEYS } from "../accounts";
import { klerosCoreContractConfig } from "../contracts";

import { getDisputeInfo } from ".";

/**
 * Passes period for the provided dispute.
 *
 * @note This function just tries to pass the period,
 *       the requirements for the period to pass must be fulfilled separately beforehand
 */
export async function passPeriod(hardhat: HardhatClient, time: TimeFixture, disputeId: bigint) {
  const account = privateKeyToAccount(ACCOUNT_PKEYS.alice);

  const { lastPeriodChange, latestRoundInfo, period: currentPeriod } = await getDisputeInfo(hardhat, disputeId);

  // NOTE: to be changed after devnet redeploy with meta audit changes
  const timesPerPeriod = latestRoundInfo.timesPerPeriod;

  const currentPeriodTime = timesPerPeriod[currentPeriod];
  const blockTime = await time.getHardhatTime();

  const elapsed = blockTime - Number(lastPeriodChange);
  const periodDuration = Number(currentPeriodTime);

  if (elapsed < periodDuration) {
    const timeToAdvance = periodDuration - elapsed + 1;
    await time.advanceTime(timeToAdvance);
  }

  const hash = await hardhat.writeContract({
    ...klerosCoreContractConfig,
    functionName: "passPeriod",
    args: [disputeId],
    account,
  });
  const receipt = await hardhat.waitForTransactionReceipt({ hash });

  if (receipt.status === "reverted") throw new Error(`passPeriod: Failed to pass period for dispute ${disputeId}`);
}
