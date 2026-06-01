import { useQuery } from "@tanstack/react-query";
import { Address, getContract } from "viem";
import { usePublicClient } from "wagmi";

import { isUndefined } from "utils/index";

import { getDisputeKitConfigByAddress } from "src/dispute-kits";

export const useDisputeKitMultipliers = (disputeKitAddress?: Address) => {
  const publicClient = usePublicClient();
  const isEnabled = !isUndefined(publicClient) && !isUndefined(disputeKitAddress);

  return useQuery({
    queryKey: [`DisputeKitClassicMultipliers`, disputeKitAddress],
    enabled: isEnabled,
    staleTime: Infinity,
    queryFn: async () => {
      if (!publicClient || !disputeKitAddress) return;
      const config = getDisputeKitConfigByAddress(disputeKitAddress);
      if (isUndefined(config)) return;

      const disputeKitClassic = getContract({
        abi: config.disputeKitAbi,
        address: config.address,
        client: {
          public: publicClient,
        },
      });
      const winner_stake_multiplier = await disputeKitClassic.read.WINNER_STAKE_MULTIPLIER();
      const loser_stake_multiplier = await disputeKitClassic.read.LOSER_STAKE_MULTIPLIER();
      const loser_appeal_period_multiplier = await disputeKitClassic.read.LOSER_APPEAL_PERIOD_MULTIPLIER();
      return {
        winner_stake_multiplier,
        loser_stake_multiplier,
        loser_appeal_period_multiplier,
      };
    },
  });
};

export interface IDisputeKitClassicMultipliers {
  winner_stake_multiplier: bigint;
  loser_stake_multiplier: bigint;
  loser_appeal_period_multiplier: bigint;
}
