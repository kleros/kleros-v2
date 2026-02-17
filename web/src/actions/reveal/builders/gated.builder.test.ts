import { maxUint256 } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { describe, it, expect, vi } from "vitest";

import { DisputeKits } from "src/consts";
import { MOCK_GATED_DK_ADDRESS, mockContractsGenerated } from "src/test/mocks/contracts";

import type { RevealContext } from "../context";
import type { GatedRevealParams } from "../params";

import { gatedRevealBuilder } from "./gated.builder";

vi.mock("hooks/contracts/generated", () => mockContractsGenerated);

describe("gatedRevealBuilder", () => {
  const mockContext: RevealContext = {
    account: "0x1111111111111111111111111111111111111111",
    chain: arbitrumSepolia,
    walletClient: {} as RevealContext["walletClient"],
  };

  const createParams = (overrides: Partial<GatedRevealParams> = {}): GatedRevealParams => ({
    disputeId: 1n,
    voteIds: [0n],
    choice: 1n,
    salt: 123456789n,
    roundIndex: 0,
    justification: "My justification",
    type: DisputeKits.Gated,
    ...overrides,
  });

  describe("transaction building", () => {
    it("should build correct transaction structure", async () => {
      const params = createParams();

      const result = await gatedRevealBuilder.build(params, mockContext);

      expect(result).toMatchObject({
        account: mockContext.account,
        address: MOCK_GATED_DK_ADDRESS,
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

      const result = await gatedRevealBuilder.build(params, mockContext);

      expect(result.args).toEqual([params.disputeId, params.voteIds, params.choice, params.salt, params.justification]);
    });
  });

  describe("edge cases", () => {
    it("should handle empty justification", async () => {
      const params = createParams({ justification: "" });

      const result = await gatedRevealBuilder.build(params, mockContext);

      expect(result.args?.[4]).toBe("");
    });

    it("should handle choice 0 (Refuse To Arbitrate)", async () => {
      const params = createParams({ choice: 0n });

      const result = await gatedRevealBuilder.build(params, mockContext);

      expect(result.args?.[2]).toBe(0n);
    });

    it("should handle large choice value", async () => {
      const params = createParams({ choice: maxUint256 });

      const result = await gatedRevealBuilder.build(params, mockContext);

      expect(result.args?.[2]).toBe(maxUint256);
    });

    it("should handle multiple voteIds", async () => {
      const params = createParams({ voteIds: [1n, 2n, 3n, 4n, 5n] });

      const result = await gatedRevealBuilder.build(params, mockContext);

      expect(result.args?.[1]).toEqual([1n, 2n, 3n, 4n, 5n]);
    });
  });
});
