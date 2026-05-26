import React from "react";

import { useTranslation } from "react-i18next";

import { Features } from "consts/disputeFeature";

import WithHelpTooltip from "components/WithHelpTooltip";

import { FeatureRadio, RadioInput } from ".";

const ArgentinaConsumerProtection: React.FC<RadioInput> = ({ value, disabled }) => {
  const { t } = useTranslation();

  return (
    <WithHelpTooltip
      tooltipMsg={t("features.argentina_consumer_protection_tooltip")}
      key={Features.ArgentinaConsumerProtection}
    >
      <FeatureRadio value={value} disabled={disabled} label={t("features.argentina_consumer_protection")} />
    </WithHelpTooltip>
  );
};

export default ArgentinaConsumerProtection;
