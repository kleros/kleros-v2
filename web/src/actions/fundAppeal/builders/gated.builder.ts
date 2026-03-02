import { disputeKitGatedAbi, disputeKitGatedAddress } from "hooks/contracts/generated";

import { GatedFundAppealParams } from "../params";

import { defineFundAppealBuilder } from "./baseBuilder";

export const gatedFundAppealBuilder = defineFundAppealBuilder({
  build: async (params: GatedFundAppealParams, context) => {
    const { disputeId, choice, fundAmount } = params;
    const { chain, account } = context;

    return {
      account,
      address: disputeKitGatedAddress[chain.id],
      abi: disputeKitGatedAbi,
      functionName: "fundAppeal",
      args: [disputeId, choice],
      value: fundAmount,
      chain,
    };
  },
});
