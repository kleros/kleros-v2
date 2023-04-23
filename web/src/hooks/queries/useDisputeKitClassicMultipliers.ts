import useSWRImmutable from "swr/immutable";
import { BigNumber } from "ethers";
import { useConnectedContract } from "hooks/useConnectedContract";

export const useDisputeKitClassicMultipliers = () => {
  const disputeKitClassic = useConnectedContract("DisputeKitClassic");
  return useSWRImmutable(
    () => (disputeKitClassic ? `Multipliers` : false),
    async () => {
      if (!disputeKitClassic) return;
      const winner_stake_multiplier =
        await disputeKitClassic.WINNER_STAKE_MULTIPLIER();
      const loser_stake_multiplier =
        await disputeKitClassic.LOSER_STAKE_MULTIPLIER();
      const loser_appeal_period_multiplier =
        await disputeKitClassic.LOSER_APPEAL_PERIOD_MULTIPLIER();
      return {
        winner_stake_multiplier,
        loser_stake_multiplier,
        loser_appeal_period_multiplier,
      };
    }
  );
};

export interface IDisputeKitClassicMultipliers {
  winner_stake_multiplier: BigNumber;
  loser_stake_multiplier: BigNumber;
  loser_appeal_period_multiplier: BigNumber;
}
