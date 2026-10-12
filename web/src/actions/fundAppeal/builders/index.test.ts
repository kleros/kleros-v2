import { parseEther } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { describe, it, expect, vi } from "vitest";

import { DisputeKits } from "src/dispute-kits/disputeKits";
import { MOCK_ACCOUNT_1, MOCK_DK_CONTRACTS, mockContractsGenerated } from "src/test/mocks";

import type { FundAppealContext } from "../context";
import type { FundAppealParams } from "../params";

import { buildFundAppealTxn } from "./index";

vi.mock("hooks/contracts/generated", () => mockContractsGenerated);

const context: FundAppealContext = {
  account: MOCK_ACCOUNT_1,
  chain: arbitrumSepolia,
  walletClient: {} as FundAppealContext["walletClient"],
};

const allKits = Object.values(DisputeKits).filter((v): v is DisputeKits => typeof v === "number");

describe("buildFundAppealTxn", () => {
  it.each(allKits)(
    "kit %i funds the choice on its own contract and sends the amount as value",
    async (disputeKitId) => {
      const fundAmount = parseEther("0.15");
      const params = { disputeId: 21n, choice: 1n, fundAmount, disputeKitId } as FundAppealParams;

      const txn = await buildFundAppealTxn(params, context);

      expect(txn).toEqual({
        account: MOCK_ACCOUNT_1,
        chain: arbitrumSepolia,
        address: MOCK_DK_CONTRACTS[disputeKitId].address,
        abi: MOCK_DK_CONTRACTS[disputeKitId].abi,
        functionName: "fundAppeal",
        args: [21n, 1n],
        value: fundAmount,
      });
    }
  );

  it("funds Refuse to Arbitrate (choice 0) like any other choice", async () => {
    const txn = await buildFundAppealTxn(
      { disputeId: 1n, choice: 0n, fundAmount: 1n, disputeKitId: DisputeKits.GatedShutter },
      context
    );

    expect(txn.args).toEqual([1n, 0n]);
  });
});
