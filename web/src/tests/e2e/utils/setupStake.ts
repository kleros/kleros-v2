import { parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { NumberString } from "utils/types";

import { TimeFixture } from "../fixtures";
import type { HardhatClient } from "../fixtures/hardhat";

import { klerosCoreContractConfig, pnkTokenContractConfig } from "./contracts";

import { ACCOUNT_PKEYS, AccountKey, GENERAL_COURT_ID, passToPhase, PNK_DECIMALS, SortitionPhase } from "./index";

export type SetupStakeOptions = Partial<{
  /** Amount to stake in number string (not parsed, e.g. 1, 10 etc)  */
  amount: NumberString;
  courtId: bigint;
}>;

/**
 * Sets up stake in the mentioned court for the specified account.
 * Stakes 1000 PNK by default, can be overridden through `options`
 *
 * @param hardhat - The hardhat client from the fixture
 * @param time - Time fixture used by passToPhase
 * @param accountKey - Key of the account to use from ACCOUNT_PKEYS ("alice", "bob")
 * @param options - Optional stake configuration (overrides defaults)
 *
 * @note The phase passing is handled by this function itself
 *
 * @example
 * ```ts
 * setupStake(hardhatClient, timeFixture, "alice", {
 *   courtId: 1n,
 *   amount: "1000",
 * });
 * ```
 */
export async function setupStake(
  hardhat: HardhatClient,
  time: TimeFixture,
  accountKey: AccountKey,
  options: SetupStakeOptions = {}
) {
  const stakeOptions = { amount: "1000", courtId: GENERAL_COURT_ID, ...options };
  const { courtId, amount } = stakeOptions;

  const parsedStakeAmount = parseUnits(amount, PNK_DECIMALS);

  const privateKey = ACCOUNT_PKEYS[accountKey];
  const account = privateKeyToAccount(privateKey);

  // check for phase and pass it to staking
  await passToPhase(hardhat, time, SortitionPhase.Staking);

  const approvalHash = await hardhat.writeContract({
    ...pnkTokenContractConfig,
    functionName: "approve",
    args: [klerosCoreContractConfig.address, parsedStakeAmount],
    account,
  });
  await hardhat.waitForTransactionReceipt({ hash: approvalHash });

  const hash = await hardhat.writeContract({
    ...klerosCoreContractConfig,
    functionName: "setStake",
    args: [courtId, parsedStakeAmount],
    account,
  });

  const receipt = await hardhat.waitForTransactionReceipt({ hash });

  if (receipt.status === "reverted")
    throw new Error(`setupStake: Failed to set stake for ${accountKey} in court ${courtId}`);
}

export default setupStake;
