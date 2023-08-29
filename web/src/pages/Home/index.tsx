import React from "react";
import styled, { useTheme } from "styled-components";
import { useMeasure } from "react-use";
import CourtOverview from "./CourtOverview";
import LatestCases from "./LatestCases";
import Community from "./Community";
import { HomePageProvider } from "hooks/useHomePageContext";
import { getOneYearAgoTimestamp } from "utils/date";
import { BREAKPOINT_SMALL_SCREEN } from "styles/smallScreenStyle";
import HeaderLightMobile from "tsx:svgs/header/header-lightmode-mobile.svg";
import HeaderDarkMobile from "tsx:svgs/header/header-darkmode-mobile.svg";
import HeaderLightDesktop from "tsx:svgs/header/header-lightmode-desktop.svg";
import HeaderDarkDesktop from "tsx:svgs/header/header-darkmode-desktop.svg";

const Container = styled.div`
  width: 100%;
  min-height: calc(100vh - 144px);
  background-color: ${({ theme }) => theme.lightBackground};
  padding: 32px;
`;

const Header = () => {
  const [ref, { width }] = useMeasure();
  const theme = useTheme();
  const themeIsLight = theme.name === "light";
  const breakpointIsBig = width > BREAKPOINT_SMALL_SCREEN;
  return (
    <div ref={ref}>
      {breakpointIsBig ? <HeaderDesktop themeIsLight={themeIsLight} /> : <HeaderMobile themeIsLight={themeIsLight} />}
    </div>
  );
};

const HeaderDesktop: React.FC<{ themeIsLight: boolean }> = ({ themeIsLight }) => {
  return themeIsLight ? <HeaderLightDesktop /> : <HeaderDarkDesktop />;
};

const HeaderMobile: React.FC<{ themeIsLight: boolean }> = ({ themeIsLight }) => {
  return themeIsLight ? <HeaderLightMobile /> : <HeaderDarkMobile />;
};

const Home: React.FC = () => {
  return (
    <HomePageProvider timeframe={getOneYearAgoTimestamp()}>
      <Header />
      <Container>
        <CourtOverview />
        <LatestCases />
        <Community />
      </Container>
    </HomePageProvider>
  );
};

export default Home;
