import React from "react";
import styled from "styled-components";

import GradientTokenIcons from "components/GradientTokenIcons";
import NumberDisplay from "components/NumberDisplay";
import { StyledSkeleton } from "components/StyledSkeleton";

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
      <StyledH1>
        {amount ? <NumberDisplay value={amount} unit={token} place="left" /> : <StyledSkeleton width={76} />}
      </StyledH1>
      <label>
        {value ? <NumberDisplay value={value} place="right" unit="$" isCurrency /> : <StyledSkeleton width={32} />}
      </label>
    </RewardContainer>
  );
};

export default TokenRewards;
