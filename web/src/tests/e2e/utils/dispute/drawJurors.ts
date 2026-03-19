import { Address, getContract } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import type { HardhatClient } from "../../fixtures/hardhat";
import { ACCOUNT_PKEYS } from "../accounts";
import { klerosCoreContractConfig } from "../contracts";

/**
 * Draws juror for the provided dispute.
 *
 * @note This function only draws the juror, the phase must be passed separately with `passToPhase`.
 * @dev Currently the implementation is simple,
 *      if tweaks are required to cater for specific dispute kits, can be added, or abstracted into per DK draw ritual
 */
export async function drawJurors(hardhat: HardhatClient, disputeId: bigint): Promise<ReadonlyArray<Address>> {
  const maxDrawAttempts = 10;

  const klerosCore = getContract({
    ...klerosCoreContractConfig,
    client: hardhat,
  });

  const account = privateKeyToAccount(ACCOUNT_PKEYS.alice);

  const numberOfRounds = await klerosCore.read.getNumberOfRounds([disputeId]);

  const getLatestRoundInfo = () => klerosCore.read.getRoundInfo([disputeId, numberOfRounds - 1n]);

  const callDraw = async (iterations: bigint) => {
    const hash = await hardhat.writeContract({
      ...klerosCoreContractConfig,
      functionName: "draw",
      args: [disputeId, iterations],
      account,
    });
    await hardhat.waitForTransactionReceipt({ hash });
  };

  for (let attempt = 0; attempt < maxDrawAttempts; attempt++) {
    const roundInfo = await getLatestRoundInfo();
    // jurors were drawn
    if (roundInfo.drawnJurors.length === Number(roundInfo.nbVotes)) return roundInfo.drawnJurors;

    // multiplying by 100 since this is local, no need to optimize for gas in this call
    // NOTE: might change if we do test on mainnet, to save gas
    const iterations = roundInfo.nbVotes * 10n;

    await callDraw(iterations);
  }
  throw new Error(`drawJurors: Failed to draw jurors for dispute ${disputeId} after ${maxDrawAttempts}`);
}
