import React from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const options = useOptionsContext();
  const { winningChoice, fundedChoices } = useFundingContext();

  return options && options.length > 2 ? (
    <div>
      <AppealHeader>
        <StyledTitle>{t("appeal.appeal_results_last_round")}</StyledTitle>
        <HowItWorks
          isMiniGuideOpen={isAppealMiniGuideOpen}
          toggleMiniGuide={toggleAppealMiniGuide}
          MiniGuideComponent={Appeal}
        />
      </AppealHeader>
      <OptionsContainer>
        {options?.map((option) => (
          <OptionCard
            key={option.id}
            text={option.title}
            winner={option.id === winningChoice}
            funding={BigInt(option.paidFee ?? 0)}
            required={fundedChoices?.includes(option.id) ? BigInt(option.paidFee ?? 0) : undefined}
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
