"use client";
import React, { useContext, useMemo, useRef, createContext } from "react";

import Link from "next/link";
import { useClickAway, useToggle } from "react-use";

import KlerosDevtoolsLogo from "svgs/header/devtools-logo.svg";
import HamburgerIcon from "svgs/header/hamburger.svg";

import LightButton from "components/LightButton";

import NavBar from "./navbar";

const OpenContext = createContext({
  isOpen: false,
  toggleIsOpen: () => {
    // Placeholder
  },
});

export function useOpenContext() {
  return useContext(OpenContext);
}

const MobileHeader: React.FC = () => {
  const [isOpen, toggleIsOpen] = useToggle(false);
  const containerRef = useRef(null);
  useClickAway(containerRef, () => toggleIsOpen(false));
  const memoizedContext = useMemo(() => ({ isOpen, toggleIsOpen }), [isOpen, toggleIsOpen]);
  return (
    <div className="flex w-full items-center justify-between lg:hidden" ref={containerRef}>
      <OpenContext.Provider value={memoizedContext}>
        <Link href="/">
          <KlerosDevtoolsLogo />
        </Link>
        <NavBar />
        <LightButton
          className="bg-transparent p-0 hover:bg-transparent [&_svg]:mr-0 [&_svg]:fill-white [&_.button-text]:hidden"
          text=""
          Icon={HamburgerIcon}
          onClick={toggleIsOpen}
        />
      </OpenContext.Provider>
    </div>
  );
};

export default MobileHeader;
