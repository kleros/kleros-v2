import React from "react";
import styled from "styled-components";
import LatestCases from "components/LatestCases";
import CourtOverview from "./CourtOverview";
import Community from "./Community";
import HeroImage from "./HeroImage";
import { HomePageProvider } from "hooks/useHomePageContext";
import { getOneYearAgoTimestamp } from "utils/date";

const Container = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.lightBackground};
  padding: calc(32px + (132 - 32) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  padding-top: calc(32px + (72 - 32) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  padding-bottom: calc(64px + (96 - 64) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
`;

const Home: React.FC = () => {
  return (
    <HomePageProvider timeframe={getOneYearAgoTimestamp()}>
      <HeroImage />
      <Container>
        <CourtOverview />
        <LatestCases />
        <Community />
      </Container>
    </HomePageProvider>
  );
};

export default Home;
