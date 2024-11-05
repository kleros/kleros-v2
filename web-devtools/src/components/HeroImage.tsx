"use client";
import React, { useEffect, useState } from "react";

import HeroDarkDesktop from "svgs/hero/hero-darkmode-desktop.svg";
import HeroDarkMobile from "svgs/hero/hero-darkmode-mobile.svg";

import useIsDesktop from "hooks/useIsDesktop";

const HeroImage = () => {
  const [isMounted, setIsMounted] = useState(false);
  const isDesktop = useIsDesktop();
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <HeroDesktop />;
  }

  return <div>{isDesktop ? <HeroDesktop /> : <HeroMobile />}</div>;
};

const HeroDesktop: React.FC = () => {
  return <HeroDarkDesktop />;
};

const HeroMobile: React.FC = () => {
  return <HeroDarkMobile />;
};

export default HeroImage;
