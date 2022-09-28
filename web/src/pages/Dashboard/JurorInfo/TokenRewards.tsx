import React from "react";
import styled from "styled-components";
import _ETH from "assets/svgs/styled/eth.svg";
import _PNK from "assets/svgs/styled/pnk.svg";

const RewardContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
`;

const ETH = styled(_ETH)`
  stroke: ${({ theme }) => theme.secondaryBlue};
`;

const PNK = styled(_PNK)`
  stroke: ${({ theme }) => theme.secondaryBlue};
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
      {token === "ETH" ? <ETH /> : <PNK />}
      <StyledH1>
        {amount} {token}
      </StyledH1>
      <label>$ {value}</label>
    </RewardContainer>
  );
};

export default TokenRewards;
