import React from "react";
import styled, { css } from "styled-components";

import { landscapeStyle } from "styles/landscapeStyle";

import { CoinIds } from "consts/coingecko";
import { useCoinPrice } from "hooks/useCoinPrice";
import { getFormattedRewards } from "utils/jurorRewardConfig";

import { useUserQuery } from "queries/useUser";

import WithHelpTooltip from "components/WithHelpTooltip";
import TokenRewards from "../TokenRewards";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: auto;
  gap: 12px;

  ${landscapeStyle(
    () => css`
      align-items: flex-start;
      gap: 24px;
    `
  )}
`;

const TokenRewardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 16px;
`;

const tooltipMsg =
  "Users have an economic interest in serving as jurors in Kleros: " +
  "collecting the Juror Rewards in exchange for their work. Each juror who " +
  "is coherent with the final ruling receive the Juror Rewards composed of " +
  "arbitration fees (ETH) + PNK redistribution between jurors.";

interface IJurorRewards {
  addressToQuery: `0x${string}`;
}

const JurorRewards: React.FC<IJurorRewards> = ({ addressToQuery }) => {
  const { data } = useUserQuery(addressToQuery);
  const coinIds = [CoinIds.PNK, CoinIds.ETH];
  const { prices: pricesData } = useCoinPrice(coinIds);

  const formattedRewards = getFormattedRewards(data, pricesData);

  return (
    <Container>
      <WithHelpTooltip place="bottom" {...{ tooltipMsg }}>
        <label> Juror Rewards </label>
      </WithHelpTooltip>
      <TokenRewardsContainer>
        {formattedRewards.map(({ token, amount, value }) => (
          <TokenRewards key={token} {...{ token }} amount={amount} value={value} />
        ))}
      </TokenRewardsContainer>
    </Container>
  );
};

export default JurorRewards;
