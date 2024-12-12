import React from "react";
import styled from "styled-components";

import { HomePageProvider } from "hooks/useHomePageContext";
import { getOneYearAgoTimestamp } from "utils/date";

import { responsiveSize } from "styles/responsiveSize";

import HeroImage from "components/HeroImage";
import LatestCases from "components/LatestCases";
import ScrollTop from "components/ScrollTop";

import Community from "./Community";
import CourtOverview from "./CourtOverview";
import TopJurors from "./TopJurors";

const Wrapper = styled.div`
  width: 100%;
`;

const Container = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.lightBackground};
  padding: ${responsiveSize(32, 72)} ${responsiveSize(24, 132)} ${responsiveSize(76, 96)};
  max-width: 1400px;
  margin: 0 auto;
`;

const Home: React.FC = () => (
  <HomePageProvider timeframe={getOneYearAgoTimestamp()}>
    <Wrapper>
      <HeroImage />
      <Container>
        <CourtOverview />
        <LatestCases />
        <TopJurors />
        <Community />
      </Container>
      <ScrollTop />
    </Wrapper>
  </HomePageProvider>
);

export default Home;
