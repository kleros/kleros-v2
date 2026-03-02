import {
  disputeKitGatedArgentinaConsumerProtectionAbi,
  disputeKitGatedArgentinaConsumerProtectionAddress,
} from "hooks/contracts/generated";

import { ArgentinaConsumerProtectionFundAppealParams } from "../params";

import { defineFundAppealBuilder } from "./baseBuilder";

export const argentinaConsumerProtectionFundAppealBuilder = defineFundAppealBuilder({
  build: async (params: ArgentinaConsumerProtectionFundAppealParams, context) => {
    const { disputeId, choice, fundAmount } = params;
    const { chain, account } = context;

    return {
      account,
      address: disputeKitGatedArgentinaConsumerProtectionAddress[chain.id],
      abi: disputeKitGatedArgentinaConsumerProtectionAbi,
      functionName: "fundAppeal",
      args: [disputeId, choice],
      value: fundAmount,
      chain,
    };
  },
});
