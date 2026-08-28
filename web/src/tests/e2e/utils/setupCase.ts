import { getContract } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { prepareArbitratorExtradata } from "src/dispute-kits/prepareArbitratorExtradata";

import type { HardhatClient } from "../fixtures/hardhat";

import { disputeResolverContractConfig, klerosCoreContractConfig } from "./contracts";
import { createDisputeTemplate, createDisputeData, type DisputeData } from "./dispute";

import { ACCOUNT_PKEYS, AccountKey } from "./index";

/** Options for setupCase - can override any field from DisputeData */
export type SetupCaseOptions = Partial<DisputeData>;

export interface SetupCaseResult {
  /** The created dispute ID */
  disputeId: bigint;
  /** Dispute data used to create the case */
  disputeData: DisputeData;
}

/**
 * Sets up a dispute case for e2e testing.
 *
 * @param hardhat - The hardhat client from the fixture
 * @param accountKey - Key of the account to use from ACCOUNT_PKEYS ("alice", "bob")
 * @param options - Optional case configuration (overrides defaults from DEFAULT_DISPUTE_DATA)
 *
 * @returns Object containing the dispute ID and the dispute data used to create the case
 *
 * @note The disputeId returned is incremental, if called multiple times it will increment
 *       since we cannot reset hardhat without subgraph failing for now
 *
 * @example
 * ```ts
 * const { disputeId, disputeData } = await setupCase(hardhat, "alice", {
 *   courtId: "1",
 *   numberOfJurors: 3,
 *   title: "Test Dispute",
 *   description: "A test dispute for e2e testing",
 * });
 * ```
 *
 * @example
 * ```ts
 * import { DISPUTE_SCENARIOS } from "./dispute";
 * const { disputeId } = await setupCase(hardhat, "alice", DISPUTE_SCENARIOS.classicKit);
 * ```
 */
export async function setupCase(
  hardhat: HardhatClient,
  accountKey: AccountKey,
  options: SetupCaseOptions = {}
): Promise<SetupCaseResult> {
  const disputeData = createDisputeData(options);
  const { courtId, numberOfJurors, disputeKitId, answers } = disputeData;

  const privateKey = ACCOUNT_PKEYS[accountKey];
  const account = privateKeyToAccount(privateKey);

  const extraData = prepareArbitratorExtradata(courtId, numberOfJurors, disputeKitId, undefined);

  // Create dispute template
  const disputeTemplate = createDisputeTemplate(disputeData);

  const klerosCore = getContract({
    ...klerosCoreContractConfig,
    client: hardhat,
  });

  const arbitrationCost = await klerosCore.read.arbitrationCost([extraData]);

  // dispute through disputeResolver
  const { request, result: disputeId } = await hardhat.simulateContract({
    ...disputeResolverContractConfig,
    functionName: "createDisputeForTemplate",
    args: [extraData, disputeTemplate, "", BigInt(answers.length)],
    value: arbitrationCost,
    account,
  });

  const hash = await hardhat.writeContract(request);
  const receipt = await hardhat.waitForTransactionReceipt({ hash });

  if (receipt.status === "reverted") {
    throw new Error(`setupCase: Failed to setup case - 'createDisputeForTemplate' reverted`);
  }

  // I could have used isUndefined here, but it creates issues with package resolution
  if (disputeId === undefined || disputeId === null) {
    throw new Error("setupCase: Unable to retrieve dispute id");
  }

  return { disputeId, disputeData };
}

export default setupCase;
