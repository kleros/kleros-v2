import React from "react";
import { useTheme } from "styled-components";
import HeroLightMobile from "tsx:svgs/hero/hero-lightmode-mobile.svg";
import HeroDarkMobile from "tsx:svgs/hero/hero-darkmode-mobile.svg";
import HeroLightDesktop from "tsx:svgs/hero/hero-lightmode-desktop.svg";
import HeroDarkDesktop from "tsx:svgs/hero/hero-darkmode-desktop.svg";
import useIsDesktop from "hooks/useIsDesktop";

const HeroImage = () => {
  const theme = useTheme();
  const themeIsLight = theme.name === "light";
  const isDesktop = useIsDesktop();
  return <div>{isDesktop ? <HeroDesktop {...{ themeIsLight }} /> : <HeroMobile {...{ themeIsLight }} />}</div>;
};

const HeroDesktop: React.FC<{ themeIsLight: boolean }> = ({ themeIsLight }) => {
  return themeIsLight ? <HeroLightDesktop /> : <HeroDarkDesktop />;
};

const HeroMobile: React.FC<{ themeIsLight: boolean }> = ({ themeIsLight }) => {
  return themeIsLight ? <HeroLightMobile /> : <HeroDarkMobile />;
};

export default HeroImage;
