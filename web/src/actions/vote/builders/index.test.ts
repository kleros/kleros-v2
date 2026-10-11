import { arbitrumSepolia } from "viem/chains";
import { describe, it, expect, vi } from "vitest";

import { DisputeKits } from "src/dispute-kits/disputeKits";
import { MOCK_ACCOUNT_1, MOCK_DK_CONTRACTS, mockContractsGenerated } from "src/test/mocks";

import type { VoteContext } from "../context";
import type { VoteParams } from "../params";

import { buildVoteTxn } from "./index";

vi.mock("hooks/contracts/generated", () => mockContractsGenerated);

const context: VoteContext = {
  account: MOCK_ACCOUNT_1,
  chain: arbitrumSepolia,
  walletClient: {} as VoteContext["walletClient"],
};

const allKits = Object.values(DisputeKits).filter((v): v is DisputeKits => typeof v === "number");

describe("buildVoteTxn", () => {
  it("covers every dispute kit", () => {
    expect(allKits).toHaveLength(6);
  });

  // Open (non-hidden) votes share the castVote signature on every kit, shutter kits included.
  it.each(allKits)("kit %i casts an open vote with castVote on its own contract", async (disputeKitId) => {
    const params = {
      disputeId: 3n,
      voteIds: [0n],
      choice: 2n,
      salt: 0n,
      justification: "clear evidence",
      disputeKitId,
    } as VoteParams;

    const txn = await buildVoteTxn(params, context);

    expect(txn).toEqual({
      account: MOCK_ACCOUNT_1,
      chain: arbitrumSepolia,
      address: MOCK_DK_CONTRACTS[disputeKitId].address,
      abi: MOCK_DK_CONTRACTS[disputeKitId].abi,
      functionName: "castVote",
      args: [3n, [0n], 2n, 0n, "clear evidence"],
    });
  });
});
