import { arbitrumSepolia } from "viem/chains";
import { describe, it, expect, vi } from "vitest";

import { getVoteKey } from "actions/helpers/storage/getVoteKey";

import { hashVote } from "utils/crypto/hashVote";

import { DisputeKits } from "src/dispute-kits/disputeKits";
import { MOCK_ACCOUNT_1, MOCK_DK_CONTRACTS, mockContractsGenerated } from "src/test/mocks";

import type { CommitContext } from "../context";
import type { CommitParams } from "../params";

import { buildCommitTxn } from "./index";

vi.mock("hooks/contracts/generated", () => mockContractsGenerated);

const context: CommitContext = {
  account: MOCK_ACCOUNT_1,
  chain: arbitrumSepolia,
  walletClient: {} as CommitContext["walletClient"],
};

const plainCommitKits = [
  DisputeKits.Classic,
  DisputeKits.Gated,
  DisputeKits.ArgentinaConsumerProtection,
  DisputeKits.ClassicUniversity,
] as const;

describe("buildCommitTxn", () => {
  it.each(plainCommitKits)("routes kit %i to its own contract with castCommit(hashVote)", async (disputeKitId) => {
    const params = {
      disputeId: 7n,
      voteIds: [1n, 2n],
      choice: 2n,
      salt: 42n,
      roundIndex: 1,
      disputeKitId,
    } as CommitParams;

    const txn = await buildCommitTxn(params, context);

    expect(txn).toMatchObject({
      account: MOCK_ACCOUNT_1,
      chain: arbitrumSepolia,
      address: MOCK_DK_CONTRACTS[disputeKitId].address,
      abi: MOCK_DK_CONTRACTS[disputeKitId].abi,
      functionName: "castCommit",
      args: [7n, [1n, 2n], hashVote(2n, 42n)],
    });
  });

  it.each(plainCommitKits)("persists choice and salt for kit %i under the vote key", async (disputeKitId) => {
    await buildCommitTxn(
      { disputeId: 9n, voteIds: [3n], choice: 1n, salt: 555n, roundIndex: 0, disputeKitId } as CommitParams,
      context
    );

    const stored = JSON.parse(localStorage.getItem(getVoteKey(9n, 0, [3n])) ?? "null");
    expect(stored).toEqual({ choice: "1", salt: "555" });
  });
});
