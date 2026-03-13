import { privateKeyToAccount } from "viem/accounts";

import { HardhatClient } from "../../fixtures";
import { ACCOUNT_PKEYS } from "../accounts";
import { klerosCoreContractConfig } from "../contracts";

/** Enforces the ruling for a dispute */
export const executeRulingForDispute = async (hardhat: HardhatClient, disputeId: bigint) => {
  const account = privateKeyToAccount(ACCOUNT_PKEYS.alice);
  const hash = await hardhat.writeContract({
    ...klerosCoreContractConfig,
    functionName: "executeRuling",
    args: [disputeId],
    account,
  });
  const receipt = await hardhat.waitForTransactionReceipt({ hash });

  if (receipt.status === "reverted")
    throw new Error(`executeRulingForDispute: Failed to execute for dispute ${disputeId}`);
};
