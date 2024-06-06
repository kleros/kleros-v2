import React, { useEffect } from "react";
import styled from "styled-components";

import { useLocation, useToggle } from "react-use";

import { HomePageProvider } from "hooks/useHomePageContext";
import { getOneYearAgoTimestamp } from "utils/date";

import { responsiveSize } from "styles/responsiveSize";

import HeroImage from "components/HeroImage";
import LatestCases from "components/LatestCases";
import Onboarding from "components/Popup/MiniGuides/Onboarding";

import Community from "./Community";
import CourtOverview from "./CourtOverview";
import TopJurors from "./TopJurors";

const Container = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.lightBackground};
  padding: ${responsiveSize(32, 72)} ${responsiveSize(24, 132)} ${responsiveSize(76, 96)};
  max-width: 1780px;
  margin: 0 auto;
`;

const Home: React.FC = () => {
  const [isOnboardingMiniGuidesOpen, toggleIsOnboardingMiniGuidesOpen] = useToggle(false);
  const location = useLocation();

  useEffect(() => {
    toggleIsOnboardingMiniGuidesOpen(location.hash.includes("#onboarding"));
  }, [location.hash]);

  return (
    <HomePageProvider timeframe={getOneYearAgoTimestamp()}>
      {isOnboardingMiniGuidesOpen && <Onboarding toggleMiniGuide={toggleIsOnboardingMiniGuidesOpen} />}
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
