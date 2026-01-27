import React from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";

import { useSortitionModulePhase } from "hooks/useSortitionModule";

import { isUndefined } from "src/utils";

export enum Phases {
  staking,
  generating,
  drawing,
}

const StyledLabel = styled.label``;

const Phase: React.FC<{ className?: string }> = ({ className }) => {
  const { t } = useTranslation();
  const { data: phase } = useSortitionModulePhase();

  const getPhaseLabel = (phase: Phases): string => {
    switch (phase) {
      case Phases.staking:
        return t("phase.staking");
      case Phases.generating:
        return t("phase.generating");
      case Phases.drawing:
        return t("phase.drawing");
      default:
        return "";
    }
  };

  return (
    <>
      {isUndefined(phase) ? null : (
        <StyledLabel {...{ className }}>{t("phase.label", { phase: getPhaseLabel(phase) })}</StyledLabel>
      )}
    </>
  );
};

export default Phase;
