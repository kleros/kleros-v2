import React from "react";

import { useTranslation } from "react-i18next";

import { useSortitionModulePhase } from "hooks/useSortitionModule";

import { isUndefined } from "src/utils";

export enum Phases {
  staking,
  generating,
  drawing,
}

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
        <label className={className}>{t("phase.label", { phase: getPhaseLabel(phase) })}</label>
      )}
    </>
  );
};

export default Phase;
