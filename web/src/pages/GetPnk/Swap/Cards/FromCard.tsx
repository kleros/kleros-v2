import React, { useState } from "react";
import { Button, Card } from "@kleros/ui-components-library";
import styled from "styled-components";
import ChainSelect from "../ChainSelect";
import TokenSelect from "../TokenSelect";
import { responsiveSize } from "styles/responsiveSize";
import NumberField from "../NumberInput";
import DownArrow from "tsx:svgs/icons/down-arrow.svg";

const Container = styled(Card)`
  width: 100%;
  display: flex;
  height: fit-content;
  flex-direction: column;
  gap: 19px;
  padding: 16px 16px 32px;
  background-color: ${({ theme }) => theme.lightBlue};
  border-color: ${({ theme }) => theme.primaryBlue};
  position: relative;
`;
const InnerContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const ChainContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${responsiveSize(8, 16)};
`;
const StyledButton = styled(Button)`
  border: none;
  background-color: transparent;
  padding: 0;
`;

const SVGContainer = styled.div`
  display: flex;
  justify-content: center;
  position: absolute;
  left: 0;
  right: 0;
  bottom: -28px;
  z-index: 100;
`;

const FromCard: React.FC = () => {
  const [fromChain, setFromChain] = useState(421614);
  const [fromToken, setFromToken] = useState("PNK");

  return (
    <Container>
      <InnerContainer>
        <ChainContainer>
          <label>From</label>
          <ChainSelect chainId={fromChain} setChainId={setFromChain} />
        </ChainContainer>
        <StyledButton variant="secondary" text="MAX" />
      </InnerContainer>
      <InnerContainer>
        <TokenSelect token={fromToken} setToken={setFromToken} />
        <NumberField placeholder="Enter amount" value="0.0" />
      </InnerContainer>
      <SVGContainer>
        <DownArrow />
      </SVGContainer>
    </Container>
  );
};

export default FromCard;
