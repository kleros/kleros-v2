import React from "react";
import styled from "styled-components";
import { useLifiSDK } from "context/LiFiProvider";
import Skeleton from "react-loading-skeleton";
import RouteDetails from "./RouteDetails";
import NoRouteInfo from "./NoRouteInfo";

const Container = styled.div`
  width: 100%;
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Routes: React.FC = () => {
  const { routes, routesLoading } = useLifiSDK();

  if (routesLoading) return <Skeleton height={100} />;
  return (
    <Container>
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
