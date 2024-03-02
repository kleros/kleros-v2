import React from "react";
import { Card, DisplaySmall } from "@kleros/ui-components-library";
import styled from "styled-components";
import { responsiveSize } from "styles/responsiveSize";
import PNKIcon from "tsx:svgs/tokens/pnk.svg";
import ArbIcon from "tsx:svgs/tokens/arbitrum.svg";
import { useLifiSDK } from "~src/context/LiFiProvider";
import { formatUnits } from "viem";
import { formatValue } from "utils/format";

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

const StyledDisplay = styled(DisplaySmall)`
  > div {
    height: auto;
    margin: 0px;
    padding: 0px;
    border: none;
  }
  .display-icon {
    max-width: 24px;
    max-height: 24px;
  }
`;
const ToCard: React.FC = () => {
  const { routes } = useLifiSDK();
  const route = routes?.[0];
  return (
    <Container>
      <InnerContainer>
        <ChainContainer>
          <StyledLabel>To</StyledLabel>
          <StyledDisplay Icon={ArbIcon} text="Arbitrum" />
        </ChainContainer>
      </InnerContainer>
      <InnerContainer>
        <StyledDisplay Icon={PNKIcon} text="PNK" />
        <StyledText>
          {route ? formatValue(formatUnits(BigInt(route.toAmount), route.toToken.decimals), 2, false) : "0.0"}
        </StyledText>
      </InnerContainer>
    </Container>
  );
};

export default ToCard;
