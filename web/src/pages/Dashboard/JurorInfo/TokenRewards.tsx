import React from "react";
import styled from "styled-components";
import GradientTokenIcons from "components/GradientTokenIcons";
import { StyledSkeleton } from "components/StyledSkeleton";
import NumberDisplay from "components/NumberDisplay";

const RewardContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
`;

const StyledH1 = styled.h1`
  margin: 0;
`;

interface ITokenRewards {
  token: "ETH" | "PNK";
  amount: string | undefined;
  value: string | undefined;
}

const TokenRewards: React.FC<ITokenRewards> = ({ token, amount, value }) => {
  return (
    <RewardContainer>
      {token && <GradientTokenIcons icon={token} />}
      <StyledH1>{amount ? <NumberDisplay value={amount} place="left" /> : <StyledSkeleton width={76} />}</StyledH1>
      <StyledH1>{token}</StyledH1>
      <label>$ </label>
      <label>{value ? <NumberDisplay value={value} place="right" /> : <StyledSkeleton width={32} />}</label>
    </RewardContainer>
  );
};

export default TokenRewards;
