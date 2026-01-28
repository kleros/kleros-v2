import { arbitrumSepolia } from "viem/chains";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { hashVote } from "utils/crypto/hashVote";

import { DisputeKits } from "src/consts";

import type { CommitContext } from "../context";
import type { GatedCommitParams } from "../params";

import { gatedCommitBuilder } from "./gated.builder";

// Mock the dependencies
vi.mock("actions/helpers/storage", () => ({
  storeCommitData: vi.fn(),
}));

vi.mock("hooks/contracts/generated", () => ({
  disputeKitGatedAbi: [{ name: "castCommit", type: "function" }],
  disputeKitGatedAddress: {
    421614: "0xGATED1234567890123456789012345678901234" as const,
  },
}));

import { storeCommitData } from "actions/helpers/storage";

describe("gatedCommitBuilder", () => {
  const mockContext: CommitContext = {
    account: "0xabcdef1234567890abcdef1234567890abcdef12" as `0x${string}`,
    chain: arbitrumSepolia,
    walletClient: {} as CommitContext["walletClient"],
  };

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

      const result = await gatedCommitBuilder.build(params, mockContext);

      expect(result).toMatchObject({
        account: mockContext.account,
        address: "0xGATED1234567890123456789012345678901234",
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

      const result = await gatedCommitBuilder.build(params, mockContext);
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

      await gatedCommitBuilder.build(params, mockContext);

      expect(storeCommitData).toHaveBeenCalledTimes(1);
      expect(storeCommitData).toHaveBeenCalledWith("dispute-100-round-2-voteids-5,6", {
        choice: 1n,
        salt: 777n,
      });
    });
  });

  describe("commit hash computation", () => {
    it("should compute commit using hashVote", async () => {
      const params = createParams({ choice: 3n, salt: 12345n });

      const result = await gatedCommitBuilder.build(params, mockContext);
      const expectedCommit = hashVote(3n, 12345n);

      expect(result.args?.[2]).toBe(expectedCommit);
    });
  });

  describe("edge cases", () => {
    it("should handle single voteId", async () => {
      const params = createParams({ voteIds: [99n] });

      const result = await gatedCommitBuilder.build(params, mockContext);

      expect(result.args?.[1]).toEqual([99n]);
    });

    it("should handle multiple voteIds", async () => {
      const params = createParams({ voteIds: [1n, 2n, 3n, 4n, 5n] });

      const result = await gatedCommitBuilder.build(params, mockContext);

      expect(result.args?.[1]).toEqual([1n, 2n, 3n, 4n, 5n]);
    });
  });
});
