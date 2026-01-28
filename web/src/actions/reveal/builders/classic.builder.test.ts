import { maxUint256 } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { describe, it, expect, vi } from "vitest";

import { DisputeKits } from "src/consts";

import type { RevealContext } from "../context";
import type { ClassicRevealParams } from "../params";

import { classicRevealBuilder } from "./classic.builder";

// Mock the dependencies
vi.mock("hooks/contracts/generated", () => ({
  disputeKitClassicAbi: [{ name: "castVote", type: "function" }],
  disputeKitClassicAddress: {
    421614: "0xABCDEF1234567890ABCDEF1234567890ABCDEF12" as const,
  },
}));

describe("classicRevealBuilder", () => {
  const mockContext: RevealContext = {
    account: "0x1111111111111111111111111111111111111111" as `0x${string}`,
    chain: arbitrumSepolia,
    walletClient: {} as RevealContext["walletClient"],
  };

  const createParams = (overrides: Partial<ClassicRevealParams> = {}): ClassicRevealParams => ({
    disputeId: 1n,
    voteIds: [0n],
    choice: 1n,
    salt: 123456789n,
    roundIndex: 0,
    justification: "My justification for this vote",
    type: DisputeKits.Classic,
    ...overrides,
  });

  describe("transaction building", () => {
    it("should build correct transaction structure", async () => {
      const params = createParams();

      const result = await classicRevealBuilder.build(params, mockContext);

      expect(result).toMatchObject({
        account: mockContext.account,
        address: "0xABCDEF1234567890ABCDEF1234567890ABCDEF12",
        functionName: "castVote",
        chain: mockContext.chain,
      });
    });

    it("should include all required args", async () => {
      const params = createParams({
        disputeId: 42n,
        voteIds: [1n, 2n, 3n],
        choice: 2n,
        salt: 999n,
        justification: "Test justification",
      });

      const result = await classicRevealBuilder.build(params, mockContext);

      expect(result.args).toEqual([params.disputeId, params.voteIds, params.choice, params.salt, params.justification]);
    });

    it("should pass choice directly (not hashed)", async () => {
      const params = createParams({ choice: 5n });

      const result = await classicRevealBuilder.build(params, mockContext);

      expect(result.args?.[2]).toBe(5n);
    });

    it("should pass salt directly", async () => {
      const params = createParams({ salt: 12345n });

      const result = await classicRevealBuilder.build(params, mockContext);

      expect(result.args?.[3]).toBe(12345n);
    });

    it("should pass justification as string", async () => {
      const params = createParams({ justification: "This is my reasoning" });

      const result = await classicRevealBuilder.build(params, mockContext);

      expect(result.args?.[4]).toBe("This is my reasoning");
    });
  });

  describe("edge cases", () => {
    it("should handle empty justification", async () => {
      const params = createParams({ justification: "" });

      const result = await classicRevealBuilder.build(params, mockContext);

      expect(result.args?.[4]).toBe("");
    });

    it("should handle choice 0 (Refuse To Arbitrate)", async () => {
      const params = createParams({ choice: 0n });

      const result = await classicRevealBuilder.build(params, mockContext);

      expect(result.args?.[2]).toBe(0n);
    });

    it("should handle large choice values", async () => {
      const params = createParams({ choice: maxUint256 });

      const result = await classicRevealBuilder.build(params, mockContext);

      expect(result.args?.[2]).toBe(maxUint256);
    });

    it("should handle single voteId", async () => {
      const params = createParams({ voteIds: [99n] });

      const result = await classicRevealBuilder.build(params, mockContext);

      expect(result.args?.[1]).toEqual([99n]);
    });

    it("should handle multiple voteIds", async () => {
      const params = createParams({ voteIds: [1n, 2n, 3n, 4n, 5n] });

      const result = await classicRevealBuilder.build(params, mockContext);

      expect(result.args?.[1]).toEqual([1n, 2n, 3n, 4n, 5n]);
    });

    it("should handle large salt values", async () => {
      const largeSalt = maxUint256;
      const params = createParams({ salt: largeSalt });

      const result = await classicRevealBuilder.build(params, mockContext);

      expect(result.args?.[3]).toBe(largeSalt);
    });

    it("should handle unicode justification", async () => {
      const justification = "Vote justification with unicode: 你好 🎉 émoji";
      const params = createParams({ justification });

      const result = await classicRevealBuilder.build(params, mockContext);

      expect(result.args?.[4]).toBe(justification);
    });

    it("should handle long justification", async () => {
      const longJustification = "A".repeat(10000);
      const params = createParams({ justification: longJustification });

      const result = await classicRevealBuilder.build(params, mockContext);

      expect(result.args?.[4]).toBe(longJustification);
    });
  });

  describe("context handling", () => {
    it("should use account from context", async () => {
      const customContext: RevealContext = {
        ...mockContext,
        account: "0x9999999999999999999999999999999999999999" as `0x${string}`,
      };
      const params = createParams();

      const result = await classicRevealBuilder.build(params, customContext);

      expect(result.account).toBe("0x9999999999999999999999999999999999999999");
    });

    it("should use chain from context", async () => {
      const params = createParams();

      const result = await classicRevealBuilder.build(params, mockContext);

      expect(result.chain).toBe(mockContext.chain);
    });
  });
});
