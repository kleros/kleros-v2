import React from "react";
import styled, { css } from "styled-components";

import { MAX_WIDTH_LANDSCAPE, landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import { HomePageProvider } from "hooks/useHomePageContext";
import { getOneYearAgoTimestamp } from "utils/date";

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
  padding: 16px 16px 40px;
  max-width: ${MAX_WIDTH_LANDSCAPE};
  margin: 0 auto;

  ${landscapeStyle(
    () => css`
      padding: 16px ${responsiveSize(0, 132)} 60px;
    `
  )}
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
