import React from "react";

import { useTranslation } from "react-i18next";
import { Address } from "viem";

import { CoinIds } from "consts/coingecko";
import { useCoinPrice } from "hooks/useCoinPrice";
import { getFormattedRewards } from "utils/jurorRewardConfig";

import { useUserQuery } from "queries/useUser";

import WithHelpTooltip from "components/WithHelpTooltip";

import TokenRewards from "../TokenRewards";

interface IJurorRewards {
  searchParamAddress: Address;
}

const JurorRewards: React.FC<IJurorRewards> = ({ searchParamAddress }) => {
  const { t } = useTranslation();
  const { data } = useUserQuery(searchParamAddress);
  const coinIds = [CoinIds.PNK, CoinIds.ETH];
  const { prices: pricesData } = useCoinPrice(coinIds);

  const formattedRewards = getFormattedRewards(data, pricesData);

  return (
    <div className="flex flex-col items-center w-auto gap-3 lg:items-start lg:gap-6">
      <WithHelpTooltip place="bottom" tooltipMsg={t("tooltips.juror_rewards_explanation")}>
        <label>{t("profile.juror_rewards")}</label>
      </WithHelpTooltip>
      <div className="flex flex-col [align-items:start] gap-4">
        {formattedRewards.map(({ token, amount, value }) => (
          <TokenRewards key={token} {...{ token }} amount={amount} value={value} />
        ))}
      </div>
    </div>
  );
};

export default JurorRewards;
