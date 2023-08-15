import React from "react";
import { useParams } from "react-router-dom";
import { useClassicAppealQuery } from "hooks/queries/useClassicAppealQuery";
import { useDisputeKitClassicMultipliers } from "hooks/queries/useDisputeKitClassicMultipliers";
import { useOptionsContext, getRequiredFunding } from "hooks/useClassicAppealContext";
import { useDisputeDetailsQuery } from "hooks/queries/useDisputeDetailsQuery";
import { useVotingHistory } from "hooks/queries/useVotingHistory";
import { isUndefined } from "utils/index";
import OptionCard from "./OptionCard";

const calculateAppealCost = (fee: string, totalVotes: number): bigint => {
  return BigInt(fee) * (BigInt(totalVotes) * 2n + 1n);
};

const getLastRoundData = (rounds) => {
  if (rounds) {
    const reverseRounds = rounds.slice().reverse();
    return reverseRounds.find((round) => round.fundedChoices.length > 0);
  }
};

const getLastRoundIndex = (rounds) => {
  return rounds.length === 1 ? rounds.length - 1 : rounds.length - 2;
};

const AppealHistory: React.FC = () => {
  const { id } = useParams();
  const { data } = useClassicAppealQuery(id);
  const { data: multipliers } = useDisputeKitClassicMultipliers();
  const { data: disputeDetails } = useDisputeDetailsQuery(id);
  const options = useOptionsContext();
  const feeForJuror = disputeDetails?.dispute?.court?.feeForJuror;
  const { data: votingHistory } = useVotingHistory(id);
  const rounds = votingHistory?.dispute?.rounds;
  const localRounds = data?.dispute?.disputeKitDispute?.localRounds;

  const lastRoundData = !isUndefined(localRounds) ? getLastRoundData(localRounds) : undefined;
  const appealCost =
    !isUndefined(rounds) && !isUndefined(lastRoundData) && !isUndefined(feeForJuror)
      ? calculateAppealCost(disputeDetails?.dispute?.court?.feeForJuror, rounds?.[getLastRoundIndex(rounds)].nbVotes)
      : 0n;

  const loserRequiredFunding =
    !isUndefined(multipliers) && getRequiredFunding(appealCost, multipliers.loser_stake_multiplier);
  const winnerRequiredFunding =
    !isUndefined(multipliers) && getRequiredFunding(appealCost, multipliers.winner_stake_multiplier);

  return (
    <div>
      <h1>Appeal Results - Last Round</h1>
      {options && !isUndefined(lastRoundData) ? (
        options.map((option, index) => {
          return (
            <OptionCard
              key={option}
              text={option}
              winner={index.toString() === lastRoundData.winningChoice}
              funding={lastRoundData.paidFees ? BigInt(lastRoundData.paidFees[index]) : 0n}
              required={index.toString() === lastRoundData.winningChoice ? winnerRequiredFunding : loserRequiredFunding}
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
