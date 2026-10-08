import React from "react";

import { useTranslation } from "react-i18next";

//import { Box as _Box, Button } from "@kleros/ui-components-library";

//import { EnsureChain } from "components/EnsureChain";
import WithHelpTooltip from "components/WithHelpTooltip";

// import TokenRewards from "./TokenRewards";

const StakingRewards: React.FC = () => {
  const { t } = useTranslation();
  const tooltipMsg = t("tooltips.staking_rewards_explanation");

  return (
    <div className="flex flex-col items-center gap-1">
      <WithHelpTooltip place="bottom" {...{ tooltipMsg }}>
        <label>{t("profile.staking_rewards")}</label>
      </WithHelpTooltip>
      <label>{t("misc.coming_soon")}</label>
    </div>
  );
};

export default StakingRewards;
