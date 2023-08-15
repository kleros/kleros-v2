import React from "react";
import { useOptionsContext, useFundingContext } from "hooks/useClassicAppealContext";
import OptionCard from "./OptionCard";

const AppealHistory: React.FC = () => {
  const options = useOptionsContext();
  const { winningChoice, paidFees, winnerRequiredFunding, loserRequiredFunding } = useFundingContext();

  return (
    <div>
      <h1>Appeal Results - Last Round</h1>
      {options ? (
        options.map((option, index) => {
          return (
            <OptionCard
              key={option}
              text={option}
              winner={index.toString() === winningChoice}
              funding={BigInt(paidFees?.[index] ?? "0")}
              required={index.toString() === winningChoice ? winnerRequiredFunding ?? 0n : loserRequiredFunding ?? 0n}
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
