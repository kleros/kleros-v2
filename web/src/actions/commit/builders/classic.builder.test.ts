import { arbitrumSepolia } from "viem/chains";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { hashVote } from "utils/crypto/hashVote";

import { DisputeKits } from "src/consts";

import type { CommitContext } from "../context";
import type { ClassicCommitParams } from "../params";

import { classicCommitBuilder } from "./classic.builder";

// Mock the dependencies
vi.mock("actions/helpers/storage", () => ({
  storeCommitData: vi.fn(),
}));

vi.mock("hooks/contracts/generated", () => ({
  disputeKitClassicAbi: [{ name: "castCommit", type: "function" }],
  disputeKitClassicAddress: {
    421614: "0x1234567890123456789012345678901234567890" as const,
  },
}));

import { storeCommitData } from "actions/helpers/storage";

import { maxUint256 } from "viem";

describe("classicCommitBuilder", () => {
  const mockContext: CommitContext = {
    account: "0xabcdef1234567890abcdef1234567890abcdef12" as `0x${string}`,
    chain: arbitrumSepolia,
    walletClient: {} as CommitContext["walletClient"],
  };

  const createParams = (overrides: Partial<ClassicCommitParams> = {}): ClassicCommitParams => ({
    disputeId: 1n,
    voteIds: [0n],
    choice: 1n,
    salt: 123456789n,
    roundIndex: 0,
    type: DisputeKits.Classic,
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("transaction building", () => {
    it("should build correct transaction structure", async () => {
      const params = createParams();

      const result = await classicCommitBuilder.build(params, mockContext);

      expect(result).toMatchObject({
        account: mockContext.account,
        address: "0x1234567890123456789012345678901234567890",
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

      const result = await classicCommitBuilder.build(params, mockContext);

      const expectedCommit = hashVote(params.choice, params.salt);

      expect(result.args).toEqual([params.disputeId, params.voteIds, expectedCommit]);
    });

    it("should use correct contract address for chain", async () => {
      const params = createParams();

      const result = await classicCommitBuilder.build(params, mockContext);

      expect(result.address).toBe("0x1234567890123456789012345678901234567890");
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

      await classicCommitBuilder.build(params, mockContext);

      expect(storeCommitData).toHaveBeenCalledTimes(1);
      expect(storeCommitData).toHaveBeenCalledWith("dispute-100-round-2-voteids-5,6", {
        choice: 1n,
        salt: 777n,
      });
    });

    it("should store data before returning transaction", async () => {
      const params = createParams();

      await classicCommitBuilder.build(params, mockContext);

      expect(storeCommitData).toHaveBeenCalled();
    });
  });

  describe("commit hash computation", () => {
    it("should compute commit using hashVote", async () => {
      const params = createParams({
        choice: 3n,
        salt: 12345n,
      });

      const result = await classicCommitBuilder.build(params, mockContext);
      const expectedCommit = hashVote(3n, 12345n);

      expect(result.args?.[2]).toBe(expectedCommit);
    });
  });

  describe("edge cases", () => {
    it("should handle single voteId", async () => {
      const params = createParams({ voteIds: [99n] });

      const result = await classicCommitBuilder.build(params, mockContext);

      expect(result.args?.[1]).toEqual([99n]);
    });

    it("should handle multiple voteIds", async () => {
      const params = createParams({ voteIds: [1n, 2n, 3n, 4n, 5n] });

      const result = await classicCommitBuilder.build(params, mockContext);

      expect(result.args?.[1]).toEqual([1n, 2n, 3n, 4n, 5n]);
    });

    it("should handle large dispute IDs", async () => {
      const largeDisputeId = maxUint256;
      const params = createParams({ disputeId: largeDisputeId });

      const result = await classicCommitBuilder.build(params, mockContext);

      expect(result.args?.[0]).toBe(largeDisputeId);
    });

    it("should handle large salt values", async () => {
      const largeSalt = maxUint256;
      const params = createParams({ salt: largeSalt });

      await classicCommitBuilder.build(params, mockContext);

      expect(storeCommitData).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ salt: largeSalt }));
    });
  });
});
