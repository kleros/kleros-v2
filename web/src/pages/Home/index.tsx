import React, { useEffect } from "react";
import styled from "styled-components";

import { HomePageProvider } from "hooks/useHomePageContext";
import { useScrollTop } from "hooks/useScrollTop";
import { getOneYearAgoTimestamp } from "utils/date";

import { responsiveSize } from "styles/responsiveSize";

import HeroImage from "components/HeroImage";
import LatestCases from "components/LatestCases";

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
  max-width: 1780px;
  margin: 0 auto;
`;

const Home: React.FC = () => {
  const scrollTop = useScrollTop();

  useEffect(() => {
    scrollTop();
  }, []);

  return (
    <HomePageProvider timeframe={getOneYearAgoTimestamp()}>
      <Wrapper>
        <HeroImage />
        <Container>
          <CourtOverview />
          <LatestCases />
          <TopJurors />
          <Community />
        </Container>
      </Wrapper>
    </HomePageProvider>
  );
};

export default Home;
