import React from "react";

import { HomePageProvider } from "hooks/useHomePageContext";
import { getOneYearAgoTimestamp } from "utils/date";

import HeroImage from "components/HeroImage";
import LatestCases from "components/LatestCases";
import ScrollTop from "components/ScrollTop";

import Community from "./Community";
import CourtOverview from "./CourtOverview";
import TopJurors from "./TopJurors";

const Home: React.FC = () => (
  <HomePageProvider timeframe={getOneYearAgoTimestamp()}>
    <div className="w-full">
      <HeroImage />
      <div className="w-full bg-klerosUIComponentsLightBackground p-[16px_16px_40px] max-w-[1400px] m-[0_auto] lg:p-[16px_calc(0px_+_(132_-_0)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))_60px]">
        <CourtOverview />
        <LatestCases />
        <TopJurors />
        <Community />
      </div>
      <ScrollTop />
    </div>
  </HomePageProvider>
);

export default Home;
