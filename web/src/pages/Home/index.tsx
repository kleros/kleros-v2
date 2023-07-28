import React from "react";
import styled from "styled-components";
import CourtOverview from "./CourtOverview";
import LatestCases from "./LatestCases";
import Community from "./Community";
import { HomePageProvider } from "hooks/useHomePageContext";
import { getOneYearAgoTimestamp } from "utils/date";
import Popup from "components/Popup";
import PolygonBalance from "tsx:svgs/icons/polygon-balance.svg";

const Container = styled.div`
  width: 100%;
  min-height: calc(100vh - 144px);
  background-color: ${({ theme }) => theme.lightBackground};
  padding: 32px;
`;

const Home: React.FC = () => (
  <HomePageProvider timeframe={getOneYearAgoTimestamp()}>
    <Container>
      <CourtOverview />
      <LatestCases />
      <Community />
      <Popup title="Thanks for voting" icon={PolygonBalance} />
    </Container>
  </HomePageProvider>
);

export default Home;
