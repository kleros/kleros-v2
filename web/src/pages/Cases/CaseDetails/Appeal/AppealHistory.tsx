import React from "react";
import styled from "styled-components";

import Skeleton from "react-loading-skeleton";

import { useOptionsContext, useFundingContext } from "hooks/useClassicAppealContext";

import HowItWorks from "components/HowItWorks";
import Appeal from "components/Popup/MiniGuides/Appeal";

import OptionCard from "./OptionCard";
import { AppealHeader, StyledTitle } from "./index";

const OptionsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-top: 12px;
`;

interface IAppealHistory {
  isAppealMiniGuideOpen: boolean;
  toggleAppealMiniGuide: () => void;
}

const AppealHistory: React.FC<IAppealHistory> = ({ isAppealMiniGuideOpen, toggleAppealMiniGuide }) => {
  const options = useOptionsContext();
  const { winningChoice, paidFees, fundedChoices } = useFundingContext();

  return options && options.length > 2 ? (
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
        {options.map((option, index) => (
          <OptionCard
            key={option + index}
            text={option}
            winner={index.toString() === winningChoice}
            funding={BigInt(paidFees?.[index] ?? "0")}
            required={fundedChoices?.includes(index.toString()) ? BigInt(paidFees?.[index] ?? "0") : undefined}
            canBeSelected={false}
          />
        ))}
      </OptionsContainer>
    </div>
  ) : (
    <Skeleton />
  );
};
export default AppealHistory;
