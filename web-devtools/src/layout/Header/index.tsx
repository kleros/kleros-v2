"use client";
import React from "react";

import DesktopHeader from "./DesktopHeader";
import MobileHeader from "./MobileHeader";

const Header: React.FC = () => {
  return (
    <div className="sticky top-0 z-[1] flex w-full flex-wrap bg-klerosUIComponentsPrimaryPurple">
      <div className="w-full px-6 py-2">
        <DesktopHeader />
        <MobileHeader />
      </div>
    </div>
  );
};

export default Header;
