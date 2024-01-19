import React from "react";
import styled from "styled-components";
import LatestCases from "components/LatestCases";
import CourtOverview from "./CourtOverview";
import Community from "./Community";
import HeroImage from "components/HeroImage";
import { HomePageProvider } from "hooks/useHomePageContext";
import { getOneYearAgoTimestamp } from "utils/date";
import TopJurors from "./TopJurors";
import { responsiveSize } from "styles/responsiveSize";

const Container = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.lightBackground};
  padding: ${responsiveSize(32, 72)} ${responsiveSize(24, 132)} ${responsiveSize(76, 96)};
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
