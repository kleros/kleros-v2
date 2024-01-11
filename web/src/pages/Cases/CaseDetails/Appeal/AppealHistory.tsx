import React from "react";
import styled from "styled-components";
import OptionCard from "./OptionCard";
import HowItWorks from "components/HowItWorks";
import Appeal from "components/Popup/MiniGuides/Appeal";
import { AppealHeader, StyledTitle } from ".";
import { useOptionsContext, useFundingContext } from "hooks/useClassicAppealContext";

const OptionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-top: 12px;
`;

interface IAppealHistory {
  isAppealMiniGuideOpen: boolean;
  toggleAppealMiniGuide: () => void;
}

const AppealHistory: React.FC<IAppealHistory> = ({ isAppealMiniGuideOpen, toggleAppealMiniGuide }) => {
  const options = useOptionsContext();
  const { winningChoice, paidFees, fundedChoices } = useFundingContext();

  return (
    <div>
      <AppealHeader>
        <StyledTitle>Appeal Results - Last Round</StyledTitle>
        <HowItWorks
          isMiniGuideOpen={isAppealMiniGuideOpen}
          toggleMiniGuide={toggleAppealMiniGuide}
          MiniGuideComponent={Appeal}
        />
      </AppealHeader>
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
