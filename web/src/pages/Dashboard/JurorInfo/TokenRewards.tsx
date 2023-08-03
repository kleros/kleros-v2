import React from "react";
import styled from "styled-components";
import GradientTokenIcons from "components/GradientTokenIcons";

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
  amount: string;
  value: string;
}

const TokenRewards: React.FC<ITokenRewards> = ({ token, amount, value }) => {
  return (
    <RewardContainer>
      {token && <GradientTokenIcons icon={token} />}
      <StyledH1>
        {amount} {token}
      </StyledH1>
      <label>$ {value}</label>
    </RewardContainer>
  );
};

export default TokenRewards;
