"use client";
import React from "react";

import { cn } from "utils/cn";

import HeroImage from "components/HeroImage";

import Header from "./Header";
import Tools from "./Tools";

const Home: React.FC = () => {
  return (
    <div>
      <HeroImage />
      <div
        className={cn(
          "mx-auto w-full max-w-[1780px] bg-klerosUIComponentsLightBackground",
          "px-[calc(8px+(132-8)*(min(max(100vw,375px),1250px)-375px)/875)]",
          "pt-[calc(32px+(72-32)*(min(max(100vw,375px),1250px)-375px)/875)]",
          "pb-[calc(76px+(96-76)*(min(max(100vw,375px),1250px)-375px)/875)]"
        )}
      >
        <Header />
        <Tools />
      </div>
    </div>
  );
};

export default Home;
