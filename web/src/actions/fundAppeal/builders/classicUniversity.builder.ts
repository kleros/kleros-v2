import { disputeKitClassicUniversityAbi, disputeKitClassicUniversityAddress } from "hooks/contracts/generated";

import { ClassicUniversityFundAppealParams } from "../params";

import { defineFundAppealBuilder } from "./baseBuilder";

export const classicUniversityFundAppealBuilder = defineFundAppealBuilder({
  build: async (params: ClassicUniversityFundAppealParams, context) => {
    const { disputeId, choice, fundAmount } = params;
    const { chain, account } = context;

    return {
      account,
      address: disputeKitClassicUniversityAddress[chain.id],
      abi: disputeKitClassicUniversityAbi,
      functionName: "fundAppeal",
      args: [disputeId, choice],
      value: fundAmount,
      chain,
    };
  },
});
