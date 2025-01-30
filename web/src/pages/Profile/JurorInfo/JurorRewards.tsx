import React from "react";
import styled from "styled-components";

import { useAccount } from "wagmi";

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
      {formattedRewards.map(({ token, amount, value }) => (
        <TokenRewards key={token} {...{ token }} amount={amount} value={value} />
      ))}
    </Container>
  );
};

export default JurorRewards;
