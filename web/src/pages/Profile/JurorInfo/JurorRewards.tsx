import React from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";

import { CoinIds } from "consts/coingecko";
import { useCoinPrice } from "hooks/useCoinPrice";
import { getFormattedRewards } from "utils/jurorRewardConfig";

import { useUserQuery } from "queries/useUser";

import WithHelpTooltip from "components/WithHelpTooltip";

import TokenRewards from "./TokenRewards";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: auto;
`;

interface IJurorRewards {
  addressToQuery: `0x${string}`;
}

const JurorRewards: React.FC<IJurorRewards> = ({ addressToQuery }) => {
  const { t } = useTranslation();
  const { data } = useUserQuery(addressToQuery);
  const coinIds = [CoinIds.PNK, CoinIds.ETH];
  const { prices: pricesData } = useCoinPrice(coinIds);

  const formattedRewards = getFormattedRewards(data, pricesData);

  return (
    <Container>
      <WithHelpTooltip place="bottom" tooltipMsg={t("tooltips.juror_rewards_explanation")}>
        <label>{t("profile.juror_rewards")}</label>
      </WithHelpTooltip>
      {formattedRewards.map(({ token, amount, value }) => (
        <TokenRewards key={token} {...{ token }} amount={amount} value={value} />
      ))}
    </Container>
  );
};

export default JurorRewards;
