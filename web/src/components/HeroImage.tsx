import React from "react";

import HeroDarkDesktop from "svgs/hero/hero-darkmode-desktop.svg";
import HeroDarkMobile from "svgs/hero/hero-darkmode-mobile.svg";
import HeroLightDesktop from "svgs/hero/hero-lightmode-desktop.svg";
import HeroLightMobile from "svgs/hero/hero-lightmode-mobile.svg";

import useIsDesktop from "hooks/useIsDesktop";
import useTheme from "hooks/useTheme";

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
