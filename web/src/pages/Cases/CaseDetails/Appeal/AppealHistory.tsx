import React from "react";

import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";

import { useOptionsContext, useFundingContext } from "hooks/useClassicAppealContext";

import HowItWorks from "components/HowItWorks";
import Appeal from "components/Popup/MiniGuides/Appeal";

import OptionCard from "./OptionCard";

import { AppealHeader, StyledTitle } from "./index";

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
      <div
        role="list"
        aria-label={t("appeal.appeal_results_last_round")}
        className="grid [grid-template-columns:repeat(auto-fit,_minmax(250px,_1fr))] gap-4 mt-3"
      >
        {options?.map((option) => (
          <OptionCard
            key={option.id}
            value={option.id}
            text={option.title}
            winner={option.id === winningChoice}
            funding={BigInt(option.paidFee ?? 0)}
            required={fundedChoices?.includes(option.id) ? BigInt(option.paidFee ?? 0) : undefined}
            selectable={false}
          />
        ))}
      </div>
    </div>
  ) : (
    <Skeleton />
  );
};
export default AppealHistory;
