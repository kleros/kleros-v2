import React from "react";
import styled from "styled-components";
import { useOptionsContext, useFundingContext } from "hooks/useClassicAppealContext";
import OptionCard from "./OptionCard";

const OptionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-top: 12px;
`;

const AppealHistory: React.FC = () => {
  const options = useOptionsContext();
  const { winningChoice, paidFees, winnerRequiredFunding, loserRequiredFunding } = useFundingContext();

  return (
    <div>
      <h1>Appeal Results - Last Round</h1>
      <OptionsContainer>
        {options ? (
          options.map((option, index) => {
            return (
              <OptionCard
                key={option}
                text={option}
                winner={index.toString() === winningChoice}
                funding={BigInt(paidFees?.[index] ?? "0")}
                required={index.toString() === winningChoice ? winnerRequiredFunding ?? 0n : loserRequiredFunding ?? 0n}
                canBeSelected={false}
              />
            );
          })
        ) : (
          <h2>Not in appeal period</h2>
        )}
      </OptionsContainer>
    </div>
  );
};
export default AppealHistory;
