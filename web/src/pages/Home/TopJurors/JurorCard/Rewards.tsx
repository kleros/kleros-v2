import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { getFormattedRewards } from "utils/jurorRewardConfig";
import EthIcon from "assets/svgs/icons/eth.svg";
import PnkIcon from "assets/svgs/icons/kleros.svg";

const Container = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  label {
    font-weight: 600;
  }
  width: 164px;
  flex-wrap: wrap;

  ${landscapeStyle(
    () =>
      css`
        width: calc(60px + (240 - 60) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
      `
  )}
`;

const StyledIcon = styled.div`
  width: 16px;
  height: 16px;

  path {
    fill: ${({ theme }) => theme.secondaryPurple};
  }
`;

interface IRewards {
  data: any;
}

const Rewards: React.FC<IRewards> = ({ data }) => {
  const formattedRewards = getFormattedRewards(data, {});
  console.log(data);
  const ethReward = formattedRewards.find((r) => r.token === "ETH")?.amount;
  const pnkReward = formattedRewards.find((r) => r.token === "PNK")?.amount;

  return (
    <Container>
      <label>{ethReward}</label>
      <StyledIcon as={EthIcon} />
      <label>+</label>
      <label>{pnkReward}</label>
      <StyledIcon as={PnkIcon} />
    </Container>
  );
};
export default Rewards;
