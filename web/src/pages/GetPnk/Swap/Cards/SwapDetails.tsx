import React from "react";
import { Card } from "@kleros/ui-components-library";
import styled from "styled-components";
import SpinnerIcon from "tsx:svgs/icons/spinner.svg";
import ArrowIcon from "tsx:svgs/icons/arrow.svg";
import GasIcon from "tsx:svgs/icons/gas.svg";
import ClockIcon from "tsx:svgs/icons/clock.svg";
import { responsiveSize } from "styles/responsiveSize";

const Container = styled(Card)`
  width: 100%;
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 16px 23px;
  position: relative;
`;

const InnerContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SVGContainer = styled.div`
  display: flex;
  animation: rotate 2s infinite;
  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }
`;

const StyledSpan = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: ${({ theme }) => theme.primaryText};
`;

const Icon = styled.svg`
  width: 8px;
  height: 8px;
  path {
    fill: ${({ theme }) => theme.primaryText};
  }
`;

const GasAndTimeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${responsiveSize(12, 24)};
`;

const MiddleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StyledLabel = styled.label``;

const SwapDetails: React.FC = () => {
  return (
    <Container>
      <InnerContainer>
        <StyledLabel>
          Bridge from <small>Ethereum</small> to <small>Arbitrum</small>
        </StyledLabel>{" "}
        <SVGContainer>
          <SpinnerIcon />
        </SVGContainer>
      </InnerContainer>
      <InnerContainer>
        <StyledSpan>
          1000 ETH <Icon as={ArrowIcon} />
          999 PNK &nbsp;~ $18.11
        </StyledSpan>
      </InnerContainer>
      <GasAndTimeContainer>
        <MiddleContainer>
          <GasIcon />
          <StyledLabel>Gas Fees:</StyledLabel> <StyledSpan>~ $1.09 (estimated)</StyledSpan>
        </MiddleContainer>
        <MiddleContainer>
          <ClockIcon />
          <StyledSpan>~ 2 min</StyledSpan>
        </MiddleContainer>
      </GasAndTimeContainer>
    </Container>
  );
};

export default SwapDetails;
