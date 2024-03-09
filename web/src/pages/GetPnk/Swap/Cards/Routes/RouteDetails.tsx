import React from "react";
import { Card } from "@kleros/ui-components-library";
import styled, { css } from "styled-components";
import ArrowIcon from "tsx:svgs/icons/arrow.svg";
import GasIcon from "tsx:svgs/icons/gas.svg";
import ClockIcon from "tsx:svgs/icons/clock.svg";
import { responsiveSize } from "styles/responsiveSize";
import { formatUnits } from "viem";
import * as all from "viem/chains";
import NumberDisplay from "components/NumberDisplay";
import { formatTimeApprox } from "utils/date";
import { getRouteEstimateTime } from "utils/lifiUtils";
import type { Route } from "@lifi/sdk";
import { useLifiSDK } from "context/LiFiProvider";
import ToolsInfo from "./ToolsInfo";
const { ...chains } = all;

export function getChain(chainId: number) {
  for (const chain of Object.values(chains)) {
    if (chain.id === chainId) {
      return chain;
    }
  }

  throw new Error(`Chain with id ${chainId} not found`);
}

const Container = styled(Card)<{ isSelected?: boolean }>`
  width: 100%;
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 16px 23px;
  position: relative;
  &:hover {
    cursor: pointer;
  }
  ${({ isSelected }) =>
    isSelected &&
    css`
      border-color: ${({ theme }) => theme.primaryBlue};
    `}
`;

const StyledSpan = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: ${({ theme }) => theme.primaryText};
  flex-wrap: wrap;
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

interface IRouteDetails {
  route: Route;
}
const RouteDetails: React.FC<IRouteDetails> = ({ route }) => {
  const { selectedRoute, setSelectedRoute } = useLifiSDK();
  const isSelected = selectedRoute?.id === route.id;

  return (
    <Container {...{ isSelected }} onClick={() => setSelectedRoute(route)}>
      <StyledLabel>
        Bridge from <small>{getChain(route.fromChainId).name}</small> to <small>{getChain(route.toChainId).name}</small>
      </StyledLabel>{" "}
      <ToolsInfo steps={route.steps} />
      <StyledSpan>
        <NumberDisplay
          value={formatUnits(BigInt(route.fromAmount), route.fromToken.decimals)}
          unit={route.fromToken.name}
        />
        <Icon as={ArrowIcon} />
        <NumberDisplay value={formatUnits(BigInt(route.toAmount), route.toToken.decimals)} unit={route.toToken.name} />
        &nbsp;~
        <NumberDisplay value={route.toAmountUSD} isCurrency unit="$" />
      </StyledSpan>
      <GasAndTimeContainer>
        <MiddleContainer>
          <GasIcon />
          <StyledLabel>Gas Fees:</StyledLabel> <StyledSpan>~ ${route.gasCostUSD} (estimated)</StyledSpan>
        </MiddleContainer>
        <MiddleContainer>
          <ClockIcon />
          <StyledSpan>{formatTimeApprox(getRouteEstimateTime(route))}</StyledSpan>
        </MiddleContainer>
      </GasAndTimeContainer>
    </Container>
  );
};

export default RouteDetails;
