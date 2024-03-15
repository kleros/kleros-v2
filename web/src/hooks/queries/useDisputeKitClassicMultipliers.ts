import { useQuery } from "@tanstack/react-query";
import { getDisputeKitClassic } from "hooks/contracts/generated";
import { isUndefined } from "utils/index";

export const useDisputeKitClassicMultipliers = () => {
  const disputeKitClassic = getDisputeKitClassic({});
  const isEnabled = !isUndefined(disputeKitClassic);
  return useQuery({
    queryKey: [`DisputeKitClassicMultipliers`],
    enabled: isEnabled,
    staleTime: Infinity,
    queryFn: async () => {
      if (!disputeKitClassic) return;
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
