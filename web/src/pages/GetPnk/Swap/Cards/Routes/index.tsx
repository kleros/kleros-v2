import React, { useMemo } from "react";
import styled, { css } from "styled-components";
import { useLifiSDK } from "context/LiFiProvider";
import Skeleton from "react-loading-skeleton";
import RouteDetails from "./RouteDetails";
import NoRouteInfo from "./NoRouteInfo";
import SpinnerIcon from "tsx:svgs/icons/spinner.svg";
import InfoCard from "components/InfoCard";
import { useGasSufficiency } from "hooks/useGasSufficiency";
import { isUndefined } from "utils/index";
import { formatUnits } from "viem";

const Container = styled.div`
  width: 100%;
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const HeadingContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

const StyledHeading = styled.h3`
  margin: 0px;
`;

const SVGContainer = styled.div<{ isLoading?: boolean }>`
  display: flex;
  cursor: pointer;

  ${({ isLoading }) =>
    isLoading &&
    css`
      cursor: default;
      animation: rotate 2s infinite;
      @keyframes rotate {
        100% {
          transform: rotate(360deg);
        }
      }
    `}
`;

const StyledInfo = styled(InfoCard)`
  color: ${({ theme }) => theme.warning};
  margin-bottom: 16px;
  font-size: 12px;
  line-height: 16px;
  white-space: pre-line;
  path {
    fill: ${({ theme }) => theme.warning};
  }
`;

const Routes: React.FC = () => {
  const { routes, routesLoading, selectedRoute, swapData, refetch } = useLifiSDK();
  const { insufficientGas } = useGasSufficiency(selectedRoute);

  const msg = useMemo(() => {
    // both are alrd parsed
    if (Number(swapData.fromAmount) > Number(swapData.tokenBalance))
      return "You don't have enough funds to complete the transaction.";

    if (isUndefined(insufficientGas) || insufficientGas.length === 0 || routesLoading || routes.length === 0)
      return undefined;

    const baseGasMsg = "You don't have enough gas to complete the transaction. You need atleast :\n";
    const requiredGasMsg = insufficientGas.reduce((msg, gasCost) => {
      msg += `${formatUnits(gasCost.insufficientAmount ?? 0n, gasCost.token.decimals)} ${gasCost.token.symbol} on ${
        gasCost.chain?.name
      } \n`;
      return msg;
    }, "");

    return baseGasMsg + requiredGasMsg;
  }, [insufficientGas, swapData, routesLoading]);

  return (
    <Container>
      {msg && <StyledInfo {...{ msg }} />}
      <HeadingContainer>
        <StyledHeading>Routes</StyledHeading>
        <SVGContainer
          isLoading={routesLoading}
          onClick={() => {
            if (!routesLoading) refetch();
          }}
        >
          <SpinnerIcon />
        </SVGContainer>
      </HeadingContainer>
      {routesLoading ? (
        <Skeleton height={100} />
      ) : (
        <>
          {routes.length !== 0 ? (
            routes.map((route) => {
              return <RouteDetails key={route.id} route={route} />;
            })
          ) : (
            <NoRouteInfo />
          )}
        </>
      )}
    </Container>
  );
};

export default Routes;
