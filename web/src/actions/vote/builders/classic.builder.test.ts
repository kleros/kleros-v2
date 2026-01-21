import { maxUint256 } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { describe, it, expect, vi } from "vitest";

import { DisputeKits } from "src/consts";

import type { VoteContext } from "../context";
import type { ClassicVoteParams } from "../params";

import { classicVoteBuilder } from "./classic.builder";

// Mock the dependencies
vi.mock("hooks/contracts/generated", () => ({
  disputeKitClassicAbi: [{ name: "castVote", type: "function" }],
  disputeKitClassicAddress: {
    421614: "0xVOTEADDRESS12345678901234567890123456" as const,
  },
}));

describe("classicVoteBuilder", () => {
  const mockContext: VoteContext = {
    account: "0x2222222222222222222222222222222222222222" as `0x${string}`,
    chain: arbitrumSepolia,
    walletClient: {} as VoteContext["walletClient"],
  };

  const createParams = (overrides: Partial<ClassicVoteParams> = {}): ClassicVoteParams => ({
    disputeId: 1n,
    voteIds: [0n],
    choice: 1n,
    salt: 123456789n,
    justification: "My vote justification",
    type: DisputeKits.Classic,
    ...overrides,
  });

  describe("transaction building", () => {
    it("should build correct transaction structure", async () => {
      const params = createParams();

      const result = await classicVoteBuilder.build(params, mockContext);

      expect(result).toMatchObject({
        account: mockContext.account,
        address: "0xVOTEADDRESS12345678901234567890123456",
        functionName: "castVote",
        chain: mockContext.chain,
      });
    });

    it("should include all required args", async () => {
      const params = createParams({
        disputeId: 100n,
        voteIds: [1n, 2n],
        choice: 3n,
        salt: 55555n,
        justification: "Test vote",
      });

      const result = await classicVoteBuilder.build(params, mockContext);

      expect(result.args).toEqual([params.disputeId, params.voteIds, params.choice, params.salt, params.justification]);
    });

    it("should pass disputeId correctly", async () => {
      const params = createParams({ disputeId: 42n });

      const result = await classicVoteBuilder.build(params, mockContext);

      expect(result.args?.[0]).toBe(42n);
    });

    it("should pass voteIds correctly", async () => {
      const params = createParams({ voteIds: [10n, 20n, 30n] });

      const result = await classicVoteBuilder.build(params, mockContext);

      expect(result.args?.[1]).toEqual([10n, 20n, 30n]);
    });

    it("should pass choice directly (not hashed)", async () => {
      const params = createParams({ choice: 5n });

      const result = await classicVoteBuilder.build(params, mockContext);

      expect(result.args?.[2]).toBe(5n);
    });

    it("should pass salt directly", async () => {
      const params = createParams({ salt: 99999n });

      const result = await classicVoteBuilder.build(params, mockContext);

      expect(result.args?.[3]).toBe(99999n);
    });

    it("should pass justification as string", async () => {
      const params = createParams({ justification: "My detailed reasoning" });

      const result = await classicVoteBuilder.build(params, mockContext);

      expect(result.args?.[4]).toBe("My detailed reasoning");
    });
  });

  describe("edge cases", () => {
    it("should handle empty justification", async () => {
      const params = createParams({ justification: "" });

      const result = await classicVoteBuilder.build(params, mockContext);

      expect(result.args?.[4]).toBe("");
    });

    it("should handle choice 0 (Refuse To Arbitrate)", async () => {
      const params = createParams({ choice: 0n });

      const result = await classicVoteBuilder.build(params, mockContext);

      expect(result.args?.[2]).toBe(0n);
    });

    it("should handle large choice value", async () => {
      const params = createParams({ choice: maxUint256 });

      const result = await classicVoteBuilder.build(params, mockContext);

      expect(result.args?.[2]).toBe(maxUint256);
    });

    it("should handle zero salt", async () => {
      const params = createParams({ salt: 0n });

      const result = await classicVoteBuilder.build(params, mockContext);

      expect(result.args?.[3]).toBe(0n);
    });

    it("should handle single voteId", async () => {
      const params = createParams({ voteIds: [77n] });

      const result = await classicVoteBuilder.build(params, mockContext);

      expect(result.args?.[1]).toEqual([77n]);
    });

    it("should handle many voteIds", async () => {
      const manyVoteIds = Array.from({ length: 10 }, (_, i) => BigInt(i));
      const params = createParams({ voteIds: manyVoteIds });

      const result = await classicVoteBuilder.build(params, mockContext);

      expect(result.args?.[1]).toEqual(manyVoteIds);
    });

    it("should handle large dispute ID", async () => {
      const largeId = BigInt("999999999999999999999999999");
      const params = createParams({ disputeId: largeId });

      const result = await classicVoteBuilder.build(params, mockContext);

      expect(result.args?.[0]).toBe(largeId);
    });

    it("should handle large salt values", async () => {
      const largeSalt = maxUint256;
      const params = createParams({ salt: largeSalt });

      const result = await classicVoteBuilder.build(params, mockContext);

      expect(result.args?.[3]).toBe(largeSalt);
    });

    it("should handle special characters in justification", async () => {
      const justification = "Special chars: <>&\"'`\\n\\t 你好 🎉";
      const params = createParams({ justification });

      const result = await classicVoteBuilder.build(params, mockContext);

      expect(result.args?.[4]).toBe(justification);
    });
  });

  describe("context handling", () => {
    it("should use account from context", async () => {
      const customContext: VoteContext = {
        ...mockContext,
        account: "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" as `0x${string}`,
      };
      const params = createParams();

      const result = await classicVoteBuilder.build(params, customContext);

      expect(result.account).toBe("0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
    });

    it("should use chain from context", async () => {
      const params = createParams();

      const result = await classicVoteBuilder.build(params, mockContext);

      expect(result.chain).toBe(mockContext.chain);
    });
  });

  describe("comparison with reveal builder", () => {
    it("should produce same args structure as reveal (both use castVote)", async () => {
      const params = createParams({
        disputeId: 10n,
        voteIds: [1n],
        choice: 2n,
        salt: 333n,
        justification: "Same structure",
      });

      const result = await classicVoteBuilder.build(params, mockContext);

      // Both vote and reveal use castVote with same args
      expect(result.args).toHaveLength(5);
      expect(result.args?.[0]).toBe(params.disputeId);
      expect(result.args?.[1]).toEqual(params.voteIds);
      expect(result.args?.[2]).toBe(params.choice);
      expect(result.args?.[3]).toBe(params.salt);
      expect(result.args?.[4]).toBe(params.justification);
    });
  });
});
