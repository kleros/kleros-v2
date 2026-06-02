import { disputeKitGatedShutterAbi, disputeKitGatedShutterAddress } from "hooks/contracts/generated";

import { GatedShutterFundAppealParams } from "../params";

import { defineFundAppealBuilder } from "./baseBuilder";

export const gatedShutterFundAppealBuilder = defineFundAppealBuilder({
  build: async (params: GatedShutterFundAppealParams, context) => {
    const { disputeId, choice, fundAmount } = params;
    const { chain, account } = context;
    const chainKey = chain.id as keyof typeof disputeKitGatedShutterAddress;

    return {
      account,
      address: disputeKitGatedShutterAddress[chainKey],
      abi: disputeKitGatedShutterAbi,
      functionName: "fundAppeal",
      args: [disputeId, choice],
      value: fundAmount,
      chain,
    };
  },
});
