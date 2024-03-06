import React from "react";
import styled from "styled-components";
import { useLifiSDK } from "context/LiFiProvider";
import Skeleton from "react-loading-skeleton";
import RouteDetails from "./RouteDetails";
import NoRouteInfo from "./NoRouteInfo";
import SpinnerIcon from "tsx:svgs/icons/spinner.svg";

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

const SVGContainer = styled.div`
  display: flex;
  animation: rotate 2s infinite;
  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }
`;

const Routes: React.FC = () => {
  const { routes, routesLoading } = useLifiSDK();

  if (routesLoading) return <Skeleton height={100} />;
  return (
    <Container>
      <HeadingContainer>
        <StyledHeading>Routes</StyledHeading>
        <SVGContainer>
          <SpinnerIcon />
        </SVGContainer>
      </HeadingContainer>
      {routes.length !== 0 ? (
        routes.map((route) => {
          return <RouteDetails key={route.id} route={route} />;
        })
      ) : (
        <NoRouteInfo />
      )}
    </Container>
  );
};

export default Routes;
