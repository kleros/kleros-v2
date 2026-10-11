import { getContract } from "viem";

import { HardhatClient } from "../../fixtures";
import { klerosCoreContractConfig } from "../contracts";

/**
 *  Get dispute specific info, including latest round info
 *
 * @dev meant to make it easy to get disputeInfo in test files,
 *     for utilities it's fine to call contract directly for specific info
 */
export const getDisputeInfo = async (hardhat: HardhatClient, disputeId: bigint) => {
  const klerosCore = getContract({
    ...klerosCoreContractConfig,
    client: hardhat,
  });

  // NOTE: This is fragile and may break with any changes to KlerosCore.Dispute struct
  const [courtID, arbitrated, period, ruled, executed, lastPeriodChange] = await klerosCore.read.disputes([disputeId]);

  const numberOfRounds = await klerosCore.read.getNumberOfRounds([disputeId]);

  const latestRoundInfo = await klerosCore.read.getRoundInfo([disputeId, numberOfRounds - 1n]);

  return { courtID, arbitrated, period, ruled, executed, lastPeriodChange, latestRoundInfo };
};
