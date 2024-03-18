import React, { useState } from "react";
import styled from "styled-components";

import { Card } from "@kleros/ui-components-library";

import { responsiveSize } from "styles/responsiveSize";

import ChainSelect from "../ChainSelect";
import TokenSelect from "../TokenSelect";

const Container = styled(Card)`
  width: 100%;
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: 19px;
  padding: 16px 16px 32px;
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
const StyledText = styled.h1`
  margin: 0px;
`;
const StyledLabel = styled.label``;

const ToCard: React.FC = () => {
  const [toChain, setToChain] = useState(421614);
  const [toToken, setToToken] = useState("PNK");

  return (
    <Container>
      <InnerContainer>
        <ChainContainer>
          <StyledLabel>To</StyledLabel>
          <ChainSelect chainId={toChain} setChainId={setToChain} />
        </ChainContainer>
      </InnerContainer>
      <InnerContainer>
        <TokenSelect token={toToken} setToken={setToToken} />
        <StyledText>0.0</StyledText>
      </InnerContainer>
    </Container>
  );
};

export default ToCard;
