import React from "react";
import { useParams } from "react-router-dom";
import { useClassicAppealQuery } from "hooks/queries/useClassicAppealQuery";
import { useDisputeKitClassicMultipliers } from "hooks/queries/useDisputeKitClassicMultipliers";
import { useOptionsContext, getLoserRequiredFunding, getWinnerRequiredFunding } from "hooks/useClassicAppealContext";
import { useDisputeDetailsQuery } from "hooks/queries/useDisputeDetailsQuery";
import { useVotingHistory } from "hooks/queries/useVotingHistory";
import { isUndefined } from "utils/index";
import OptionCard from "./OptionCard";

const calculateAppealCost = (fee: string, totalVotes: number): bigint => {
  return BigInt(fee) * (BigInt(totalVotes) * 2n + 1n);
};

const getLatestAppealRoundData = (rounds) => {
  if (rounds) {
    const reverseRounds = rounds.slice().reverse();
    return reverseRounds.find((round) => round.fundedChoices.length > 0);
  }
};

const AppealHistory: React.FC = () => {
  const { id } = useParams();
  const { data } = useClassicAppealQuery(id);
  const { data: multipliers } = useDisputeKitClassicMultipliers();
  const { data: disputeDetails } = useDisputeDetailsQuery(id);
  const options = useOptionsContext();
  const feeForJuror = disputeDetails?.dispute?.court?.feeForJuror!;
  const { data: votingHistory } = useVotingHistory(id);
  const rounds = votingHistory?.dispute?.rounds;
  const localRounds = data?.dispute?.disputeKitDispute?.localRounds;

  const roundData = !isUndefined(localRounds) ? getLatestAppealRoundData(localRounds) : undefined;
  const appealCost =
    !isUndefined(rounds) && !isUndefined(roundData) && !isUndefined(feeForJuror)
      ? calculateAppealCost(
          disputeDetails?.dispute?.court?.feeForJuror!,
          rounds![rounds.length === 1 ? rounds.length - 1 : rounds.length - 2].nbVotes!
        )
      : 0n;

  const loserRequiredFunding = getLoserRequiredFunding(appealCost!, multipliers?.loser_stake_multiplier!);
  const winnerRequiredFunding = getWinnerRequiredFunding(appealCost!, multipliers?.winner_stake_multiplier!);

  return (
    <div>
      <h1>Last Appeal Round</h1>
      {options && !isUndefined(roundData) ? (
        options.map((option, index) => {
          return (
            <OptionCard
              key={option}
              text={option}
              winner={index.toString() === roundData.winningChoice}
              funding={roundData.paidFees ? BigInt(roundData.paidFees[index]) : 0n}
              required={index.toString() === roundData.winningChoice ? winnerRequiredFunding : loserRequiredFunding}
            />
          );
        })
      ) : (
        <h2>Not in appeal period</h2>
      )}
    </div>
  );
};
export default AppealHistory;
