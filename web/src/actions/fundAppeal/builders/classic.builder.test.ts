import { maxUint256, parseEther } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { DisputeKits } from "src/consts";
import { MOCK_ACCOUNT_1, MOCK_ACCOUNT_2, MOCK_CLASSIC_DK_ADDRESS, mockContractsGenerated } from "src/test/mocks";

import type { FundAppealContext } from "../context";
import type { ClassicFundAppealParams } from "../params";

import { classicFundAppealBuilder } from "./classic.builder";

vi.mock("hooks/contracts/generated", () => mockContractsGenerated);

const ONE_ETH = parseEther("1");

describe("classicFundAppealBuilder", () => {
  const mockContext: FundAppealContext = {
    account: MOCK_ACCOUNT_1,
    chain: arbitrumSepolia,
    walletClient: {} as FundAppealContext["walletClient"],
  };

  const createParams = (overrides: Partial<ClassicFundAppealParams> = {}): ClassicFundAppealParams => ({
    disputeId: 1n,
    choice: 1n,
    fundAmount: ONE_ETH,
    type: DisputeKits.Classic,
    ...overrides,
  });

  const buildTxn = async (params: ClassicFundAppealParams) => await classicFundAppealBuilder.build(params, mockContext);

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
        functionName: "fundAppeal",
        chain: mockContext.chain,
      });
    });

    it("should include correct args", async () => {
      const params = createParams({
        disputeId: 42n,
        choice: 2n,
      });

      const result = await buildTxn(params);

      expect(result.args).toEqual([params.disputeId, params.choice]);
    });

    it("should use correct fund amount", async () => {
      const params = createParams({
        fundAmount: ONE_ETH,
      });

      const result = await buildTxn(params);

      expect(result.value).toEqual(params.fundAmount);
    });

    it("should use correct contract address for chain", async () => {
      const params = createParams();

      const result = await buildTxn(params);

      expect(result.address).toBe(MOCK_CLASSIC_DK_ADDRESS);
    });
  });

  describe("context handling", () => {
    it("should use account from context", async () => {
      const customContext: FundAppealContext = {
        ...mockContext,
        account: MOCK_ACCOUNT_2,
      };
      const params = createParams();

      const result = await classicFundAppealBuilder.build(params, customContext);

      expect(result.account).toBe(MOCK_ACCOUNT_2);
    });

    it("should use chain from context", async () => {
      const params = createParams();

      const result = await classicFundAppealBuilder.build(params, mockContext);

      expect(result.chain).toBe(mockContext.chain);
    });
  });

  describe("edge cases", () => {
    it("should handle large dispute IDs", async () => {
      const largeDisputeId = maxUint256;
      const params = createParams({ disputeId: largeDisputeId });

      const result = await buildTxn(params);

      expect(result.args?.[0]).toBe(largeDisputeId);
    });

    it("should handle large choice", async () => {
      const largeChoice = maxUint256;
      const params = createParams({ choice: largeChoice });

      const result = await buildTxn(params);

      expect(result.args?.[1]).toEqual(largeChoice);
    });

    it("should handle large fund amount", async () => {
      const largeFundAmount = 10_000n * ONE_ETH;
      const params = createParams({ fundAmount: largeFundAmount });

      const result = await buildTxn(params);

      expect(result.value).toEqual(largeFundAmount);
    });
  });
});
