import { maxUint256 } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { getVoteKey } from "actions/helpers/storage/getVoteKey";

import { hashVote } from "utils/crypto/hashVote";

import { DisputeKits } from "src/consts";
import { MOCK_CLASSIC_DK_ADDRESS, mockContractsGenerated } from "src/test/mocks/contracts";

import type { CommitContext } from "../context";
import type { ClassicCommitParams } from "../params";

import { classicCommitBuilder } from "./classic.builder";

vi.mock("hooks/contracts/generated", () => mockContractsGenerated);

describe("classicCommitBuilder", () => {
  const mockContext: CommitContext = {
    account: "0xabcdef1234567890abcdef1234567890abcdef12",
    chain: arbitrumSepolia,
    walletClient: {} as CommitContext["walletClient"],
  };
  const mockStoreCommitData = vi.fn();

  const createParams = (overrides: Partial<ClassicCommitParams> = {}): ClassicCommitParams => ({
    disputeId: 1n,
    voteIds: [0n],
    choice: 1n,
    salt: 123456789n,
    roundIndex: 0,
    type: DisputeKits.Classic,
    ...overrides,
  });

  const buildTxn = async (params: ClassicCommitParams) =>
    await classicCommitBuilder.build(params, mockContext, { storeCommitData: mockStoreCommitData });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("transaction building", () => {
    it("should build correct transaction structure", async () => {
      const params = createParams();

      const result = await buildTxn(params);

      expect(result).toMatchObject({
        account: mockContext.account,
        address: MOCK_CLASSIC_DK_ADDRESS,
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

    it("should use correct contract address for chain", async () => {
      const params = createParams();

      const result = await buildTxn(params);

      expect(result.address).toBe(MOCK_CLASSIC_DK_ADDRESS);
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

      const expectedKey = getVoteKey(params.disputeId, params.roundIndex, params.voteIds);
      expect(mockStoreCommitData).toHaveBeenCalledWith(expectedKey, {
        choice: 1n,
        salt: 777n,
      });
    });

    it("should store data before returning transaction", async () => {
      const params = createParams();

      await buildTxn(params);

      expect(mockStoreCommitData).toHaveBeenCalled();
    });
  });

  describe("commit hash computation", () => {
    it("should compute commit using hashVote", async () => {
      const params = createParams({
        choice: 3n,
        salt: 12345n,
      });

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

    it("should handle large dispute IDs", async () => {
      const largeDisputeId = maxUint256;
      const params = createParams({ disputeId: largeDisputeId });

      const result = await buildTxn(params);

      expect(result.args?.[0]).toBe(largeDisputeId);
    });

    it("should handle large salt values", async () => {
      const largeSalt = maxUint256;
      const params = createParams({ salt: largeSalt });

      await buildTxn(params);

      expect(mockStoreCommitData).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ salt: largeSalt })
      );
    });
  });
});
