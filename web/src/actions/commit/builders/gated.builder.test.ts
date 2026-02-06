import { arbitrumSepolia } from "viem/chains";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { hashVote } from "utils/crypto/hashVote";

import { DisputeKits } from "src/consts";
import { MOCK_GATED_DK_ADDRESS, mockContractsGenerated } from "src/test/mocks/contracts";

import type { CommitContext } from "../context";
import type { GatedCommitParams } from "../params";

import { gatedCommitBuilder } from "./gated.builder";

vi.mock("hooks/contracts/generated", () => mockContractsGenerated);

describe("gatedCommitBuilder", () => {
  const mockContext: CommitContext = {
    account: "0xabcdef1234567890abcdef1234567890abcdef12",
    chain: arbitrumSepolia,
    walletClient: {} as CommitContext["walletClient"],
  };
  const mockStoreCommitData = vi.fn();

  const buildTxn = async (params: GatedCommitParams) =>
    await gatedCommitBuilder.build(params, mockContext, { storeCommitData: mockStoreCommitData });

  const createParams = (overrides: Partial<GatedCommitParams> = {}): GatedCommitParams => ({
    disputeId: 1n,
    voteIds: [0n],
    choice: 1n,
    salt: 123456789n,
    roundIndex: 0,
    type: DisputeKits.Gated,
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("transaction building", () => {
    it("should build correct transaction structure", async () => {
      const params = createParams();

      const result = await buildTxn(params);

      expect(result).toMatchObject({
        account: mockContext.account,
        address: MOCK_GATED_DK_ADDRESS,
        functionName: "castCommit",
        chain: mockContext.chain,
      });
    });

    it("should include correct args with computed commit hash", async () => {
      const params = createParams({
        disputeId: 42n,
        voteIds: [1n, 2n, 3n],
        choice: 2n,
        salt: 999n,
      });

      const result = await buildTxn(params);
      const expectedCommit = hashVote(params.choice, params.salt);

      expect(result.args).toEqual([params.disputeId, params.voteIds, expectedCommit]);
    });
  });

  describe("storage interaction", () => {
    it("should store commit data with correct key and values", async () => {
      const params = createParams({
        disputeId: 100n,
        roundIndex: 2,
        voteIds: [5n, 6n],
        choice: 1n,
        salt: 777n,
      });

      await buildTxn(params);

      expect(mockStoreCommitData).toHaveBeenCalledTimes(1);
      expect(mockStoreCommitData).toHaveBeenCalledWith("dispute-100-round-2-voteids-5,6", {
        choice: 1n,
        salt: 777n,
      });
    });
  });

  describe("commit hash computation", () => {
    it("should compute commit using hashVote", async () => {
      const params = createParams({ choice: 3n, salt: 12345n });

      const result = await buildTxn(params);
      const expectedCommit = hashVote(3n, 12345n);

      expect(result.args?.[2]).toBe(expectedCommit);
    });
  });

  describe("edge cases", () => {
    it("should handle single voteId", async () => {
      const params = createParams({ voteIds: [99n] });

      const result = await buildTxn(params);

      expect(result.args?.[1]).toEqual([99n]);
    });

    it("should handle multiple voteIds", async () => {
      const params = createParams({ voteIds: [1n, 2n, 3n, 4n, 5n] });

      const result = await buildTxn(params);

      expect(result.args?.[1]).toEqual([1n, 2n, 3n, 4n, 5n]);
    });
  });
});
