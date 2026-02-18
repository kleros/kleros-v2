import { disputeKitClassicAbi, disputeKitClassicAddress } from "hooks/contracts/generated";

import { ClassicFundAppealParams } from "../params";

import { defineFundAppealBuilder } from "./baseBuilder";

export const classicFundAppealBuilder = defineFundAppealBuilder({
  build: async (params: ClassicFundAppealParams, context) => {
    const { disputeId, choice, fundAmount } = params;
    const { chain, account } = context;

    return {
      account,
      address: disputeKitClassicAddress[chain.id],
      abi: disputeKitClassicAbi,
      functionName: "fundAppeal",
      args: [disputeId, choice],
      value: fundAmount,
      chain,
    };
  },
});
