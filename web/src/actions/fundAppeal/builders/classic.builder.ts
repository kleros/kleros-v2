import { disputeKitClassicAbi, disputeKitClassicAddress } from "hooks/contracts/generated";

import { ClassicFundAppealParams } from "../params";

import { defineFundAppealBuilder } from "./baseBuilder";

export const classicFundAppealBuilder = defineFundAppealBuilder({
  build: async (params: ClassicFundAppealParams, context) => {
    const { disputeId, choice, fundAmount } = params;
    const { chain, account } = context;
    const chainKey = chain.id as keyof typeof disputeKitClassicAddress;

    return {
      account,
      address: disputeKitClassicAddress[chainKey],
      abi: disputeKitClassicAbi,
      functionName: "fundAppeal",
      args: [disputeId, choice],
      value: fundAmount,
      chain,
    };
  },
});
