import React from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";

import { CircularProgress } from "@kleros/ui-components-library";

import { ILevelCriteria } from "utils/userLevelCalculation";

import { landscapeStyle } from "styles/landscapeStyle";

import WithHelpTooltip from "components/WithHelpTooltip";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  ${landscapeStyle(
    () => css`
      gap: 0;
    `
  )}
`;

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
    <Container>
      <small>{t(userLevelData.titleKey)}</small>
      <label>
        {t("juror_levels.level")} {userLevelData.level}
      </label>
      <CircularProgress
        progress={parseFloat(((totalCoherentVotes / Math.max(totalResolvedVotes, 1)) * 100).toFixed(2))}
      />
      {!isMiniGuide ? (
        <WithHelpTooltip place="left" {...{ tooltipMsg }}>
          {votesContent}
        </WithHelpTooltip>
      ) : (
        votesContent
      )}
    </Container>
  );
};

export default Coherence;
