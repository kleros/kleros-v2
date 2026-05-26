import { disputeKitShutterAbi, disputeKitShutterAddress } from "hooks/contracts/generated";

import { ShutterFundAppealParams } from "../params";

import { defineFundAppealBuilder } from "./baseBuilder";

export const shutterFundAppealBuilder = defineFundAppealBuilder({
  build: async (params: ShutterFundAppealParams, context) => {
    const { disputeId, choice, fundAmount } = params;
    const { chain, account } = context;
    const chainKey = chain.id as keyof typeof disputeKitShutterAddress;

    return {
      account,
      address: disputeKitShutterAddress[chainKey],
      abi: disputeKitShutterAbi,
      functionName: "fundAppeal",
      args: [disputeId, choice],
      value: fundAmount,
      chain,
    };
  },
});
