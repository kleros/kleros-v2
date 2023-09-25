import React from "react";
import { useTheme } from "styled-components";
import { useWindowSize } from "react-use";
import { BREAKPOINT_LANDSCAPE } from "styles/landscapeStyle";
import HeroLightMobile from "tsx:svgs/hero/hero-lightmode-mobile.svg";
import HeroDarkMobile from "tsx:svgs/hero/hero-darkmode-mobile.svg";
import HeroLightDesktop from "tsx:svgs/hero/hero-lightmode-desktop.svg";
import HeroDarkDesktop from "tsx:svgs/hero/hero-darkmode-desktop.svg";

const HeroImage = () => {
  const { width } = useWindowSize();
  const theme = useTheme();
  const themeIsLight = theme.name === "light";
  const screenIsBig = width > BREAKPOINT_LANDSCAPE;
  return <div>{screenIsBig ? <HeroDesktop {...{ themeIsLight }} /> : <HeroMobile {...{ themeIsLight }} />}</div>;
};

const HeroDesktop: React.FC<{ themeIsLight: boolean }> = ({ themeIsLight }) => {
  return themeIsLight ? <HeroLightDesktop /> : <HeroDarkDesktop />;
};

const HeroMobile: React.FC<{ themeIsLight: boolean }> = ({ themeIsLight }) => {
  return themeIsLight ? <HeroLightMobile /> : <HeroDarkMobile />;
};

export default HeroImage;
