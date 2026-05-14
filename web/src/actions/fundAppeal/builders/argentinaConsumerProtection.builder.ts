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
    const chainKey = chain.id as keyof typeof disputeKitGatedArgentinaConsumerProtectionAddress;

    return {
      account,
      address: disputeKitGatedArgentinaConsumerProtectionAddress[chainKey],
      abi: disputeKitGatedArgentinaConsumerProtectionAbi,
      functionName: "fundAppeal",
      args: [disputeId, choice],
      value: fundAmount,
      chain,
    };
  },
});
