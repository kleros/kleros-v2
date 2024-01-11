import React from "react";
import styled from "styled-components";
import { useAccount } from "wagmi";
import TokenRewards from "./TokenRewards";
import WithHelpTooltip from "components/WithHelpTooltip";
import { getFormattedRewards } from "utils/jurorRewardConfig";
import { CoinIds } from "consts/coingecko";
import { useUserQuery } from "queries/useUser";
import { useCoinPrice } from "hooks/useCoinPrice";

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

const JurorRewards: React.FC = () => {
  const { address } = useAccount();
  const { data } = useUserQuery(address?.toLowerCase());
  const coinIds = [CoinIds.PNK, CoinIds.ETH];
  const { prices: pricesData } = useCoinPrice(coinIds);

  const formattedRewards = getFormattedRewards(data, pricesData);

  return (
    <>
      <Container>
        <WithHelpTooltip place="bottom" {...{ tooltipMsg }}>
          <label> Juror Rewards </label>
        </WithHelpTooltip>
        {formattedRewards.map(({ token, amount, value }) => (
          <TokenRewards key={token} {...{ token }} amount={amount} value={value} />
        ))}
      </Container>
    </>
  );
};

export default JurorRewards;
