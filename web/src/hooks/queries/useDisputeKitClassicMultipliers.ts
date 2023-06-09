import useSWRImmutable from "swr/immutable";
import { getDisputeKitClassic } from "hooks/contracts/generated";

export const useDisputeKitClassicMultipliers = () => {
  const disputeKitClassic = getDisputeKitClassic({});
  return useSWRImmutable(
    () => (disputeKitClassic ? `Multipliers` : false),
    async () => {
      if (!disputeKitClassic) return;
      const winner_stake_multiplier = await disputeKitClassic.read.WINNER_STAKE_MULTIPLIER();
      const loser_stake_multiplier = await disputeKitClassic.read.LOSER_STAKE_MULTIPLIER();
      const loser_appeal_period_multiplier = await disputeKitClassic.read.LOSER_APPEAL_PERIOD_MULTIPLIER();
      return {
        winner_stake_multiplier,
        loser_stake_multiplier,
        loser_appeal_period_multiplier,
      };
    }
  );
};

export interface IDisputeKitClassicMultipliers {
  winner_stake_multiplier: bigint;
  loser_stake_multiplier: bigint;
  loser_appeal_period_multiplier: bigint;
}
