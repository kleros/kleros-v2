import { disputeKitShutterAbi, disputeKitShutterAddress } from "hooks/contracts/generated";

import { ShutterFundAppealParams } from "../params";

import { defineFundAppealBuilder } from "./baseBuilder";

export const shutterFundAppealBuilder = defineFundAppealBuilder({
  build: async (params: ShutterFundAppealParams, context) => {
    const { disputeId, choice, fundAmount } = params;
    const { chain, account } = context;

    return {
      account,
      address: disputeKitShutterAddress[chain.id],
      abi: disputeKitShutterAbi,
      functionName: "fundAppeal",
      args: [disputeId, choice],
      value: fundAmount,
      chain,
    };
  },
});
