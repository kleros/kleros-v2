import React from "react";

import { useTranslation } from "react-i18next";

import { CircularProgress } from "@kleros/ui-components-library";

import { ILevelCriteria } from "utils/userLevelCalculation";

import WithHelpTooltip from "components/WithHelpTooltip";

interface ICoherence {
  userLevelData: ILevelCriteria;
  totalCoherentVotes: number;
  totalResolvedVotes: number;
  isMiniGuide: boolean;
}

const Coherence: React.FC<ICoherence> = ({ userLevelData, totalCoherentVotes, totalResolvedVotes, isMiniGuide }) => {
  const { t } = useTranslation();
  const tooltipMsg = t("juror_levels.coherent_votes_tooltip");

  const votesContent = (
    <label>
      {t("profile.coherent_votes_label")}
      <small>
        {" "}
        {totalCoherentVotes}/{totalResolvedVotes}{" "}
      </small>
    </label>
  );

  return (
    <div className="flex flex-col items-center gap-1 lg:gap-0">
      <small>{t(userLevelData.titleKey)}</small>
      <label>{t("juror_levels.level_number", { level: userLevelData.level })}</label>
      <CircularProgress value={parseFloat(((totalCoherentVotes / Math.max(totalResolvedVotes, 1)) * 100).toFixed(2))} />
      {!isMiniGuide ? (
        <WithHelpTooltip place="left" {...{ tooltipMsg }}>
          {votesContent}
        </WithHelpTooltip>
      ) : (
        votesContent
      )}
    </div>
  );
};

export default Coherence;
