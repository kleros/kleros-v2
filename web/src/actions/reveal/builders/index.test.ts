import { arbitrumSepolia } from "viem/chains";
import { describe, it, expect, vi } from "vitest";

import { DisputeKits } from "src/dispute-kits/disputeKits";
import { MOCK_ACCOUNT_1, MOCK_DK_CONTRACTS, mockContractsGenerated } from "src/test/mocks";

import type { RevealContext } from "../context";
import type { RevealParams } from "../params";

import { buildRevealTxn } from "./index";

vi.mock("hooks/contracts/generated", () => mockContractsGenerated);

const context: RevealContext = {
  account: MOCK_ACCOUNT_1,
  chain: arbitrumSepolia,
  walletClient: {} as RevealContext["walletClient"],
};

describe("buildRevealTxn", () => {
  it.each([
    { disputeKitId: DisputeKits.Classic, functionName: "castVote" },
    { disputeKitId: DisputeKits.Gated, functionName: "castVote" },
    { disputeKitId: DisputeKits.ArgentinaConsumerProtection, functionName: "castVote" },
    { disputeKitId: DisputeKits.ClassicUniversity, functionName: "castVote" },
    { disputeKitId: DisputeKits.Shutter, functionName: "castVoteShutter" },
    { disputeKitId: DisputeKits.GatedShutter, functionName: "castVoteShutter" },
  ])("kit $disputeKitId reveals through $functionName on its own contract", async ({ disputeKitId, functionName }) => {
    const params = {
      disputeId: 12n,
      voteIds: [4n, 5n],
      choice: 1n,
      salt: 31337n,
      roundIndex: 2,
      justification: "because",
      disputeKitId,
    } as RevealParams;

    const txn = await buildRevealTxn(params, context);

    expect(txn).toEqual({
      account: MOCK_ACCOUNT_1,
      chain: arbitrumSepolia,
      address: MOCK_DK_CONTRACTS[disputeKitId].address,
      abi: MOCK_DK_CONTRACTS[disputeKitId].abi,
      functionName,
      args: [12n, [4n, 5n], 1n, 31337n, "because"],
    });
  });
});
