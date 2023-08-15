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
  const { winningChoice, paidFees, fundedChoices } = useFundingContext();

  return (
    <div>
      <h1>Appeal Results - Last Round</h1>
      <OptionsContainer>
        {options ? (
          options.map((option, index) => {
            return (
              <OptionCard
                key={option + index}
                text={option}
                winner={index.toString() === winningChoice}
                funding={BigInt(paidFees?.[index] ?? "0")}
                required={fundedChoices?.includes(index.toString()) ? BigInt(paidFees?.[index] ?? "0") : undefined}
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
