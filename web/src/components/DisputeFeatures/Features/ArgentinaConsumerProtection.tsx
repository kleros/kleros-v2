import React from "react";

import { useTranslation } from "react-i18next";

import { Features } from "src/dispute-kits/disputeFeature";

import WithHelpTooltip from "components/WithHelpTooltip";

import { RadioInput, StyledRadio } from ".";

const ArgentinaConsumerProtection: React.FC<RadioInput> = (props) => {
  const { t } = useTranslation();

  return (
    <WithHelpTooltip
      tooltipMsg={t("features.argentina_consumer_protection_tooltip")}
      key={Features.ArgentinaConsumerProtection}
    >
      <StyledRadio label={t("features.argentina_consumer_protection")} small {...props} />
    </WithHelpTooltip>
  );
};

export default ArgentinaConsumerProtection;
