import React from "react";

import { useTranslation } from "react-i18next";

import { Features } from "src/dispute-kits/types";

import WithHelpTooltip from "components/WithHelpTooltip";

import { FeatureRadio, RadioInput } from "./FeatureRadio";

const ArgentinaConsumerProtection: React.FC<RadioInput> = (props) => {
  const { t } = useTranslation();

  return (
    <WithHelpTooltip
      tooltipMsg={t("features.argentina_consumer_protection_tooltip")}
      key={Features.ArgentinaConsumerProtection}
    >
      <FeatureRadio {...props} label={t("features.argentina_consumer_protection")} />
    </WithHelpTooltip>
  );
};

export default ArgentinaConsumerProtection;
