import React, { useEffect, useState } from "react";
import styled, { useTheme } from "styled-components";
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
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const theme = useTheme();
  const themeIsLight = theme.name === "light";
  const breakpointIsBig = windowWidth > BREAKPOINT_SMALL_SCREEN;
  return (
    <>
      {themeIsLight && breakpointIsBig && <HeaderLightDesktop />}
      {!themeIsLight && breakpointIsBig && <HeaderDarkDesktop />}
      {themeIsLight && !breakpointIsBig && <HeaderLightMobile />}
      {!themeIsLight && !breakpointIsBig && <HeaderDarkMobile />}
    </>
  );
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
