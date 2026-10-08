"use client";
import React from "react";

import KlerosDevtoolsLogo from "svgs/header/devtools-logo.svg";

import Explore from "./navbar/Explore";

const DesktopHeader: React.FC = () => {
  return (
    <>
      <div className="absolute hidden lg:relative lg:flex lg:w-full lg:items-center lg:justify-between">
        <div className="flex">
          <KlerosDevtoolsLogo />
        </div>
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 text-white!">
          <Explore />
        </div>
      </div>
    </>
  );
};
export default DesktopHeader;
