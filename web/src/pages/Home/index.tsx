import React from "react";
import styled from "styled-components";
import LatestCases from "components/LatestCases";
import CourtOverview from "./CourtOverview";
import Community from "./Community";
import HeroImage from "./HeroImage";
import { HomePageProvider } from "hooks/useHomePageContext";
import { getOneYearAgoTimestamp } from "utils/date";
import TopJurors from "./TopJurors";

const Container = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.lightBackground};
  padding: calc(24px + (132 - 24) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  padding-top: calc(32px + (72 - 32) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  padding-bottom: calc(76px + (96 - 76) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  max-width: 1780px;
  margin: 0 auto;
`;

const Home: React.FC = () => {
  return (
    <HomePageProvider timeframe={getOneYearAgoTimestamp()}>
      <HeroImage />
      <Container>
        <CourtOverview />
        <LatestCases />
        <TopJurors />
        <Community />
      </Container>
    </HomePageProvider>
  );
};

export default Home;
