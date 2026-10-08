import React, { useContext, useMemo, useRef } from "react";

import { useClickAway, useToggle } from "react-use";

import HamburgerIcon from "svgs/header/hamburger.svg";

import LightButton from "components/LightButton";

import Logo from "./Logo";
import NavBar from "./navbar";

const OpenContext = React.createContext({
  isOpen: false,
  toggleIsOpen: () => {
    // Placeholder
  },
});

export function useOpenContext() {
  return useContext(OpenContext);
}

const MobileHeader = () => {
  const [isOpen, toggleIsOpen] = useToggle(false);
  const containerRef = useRef(null);
  useClickAway(containerRef, () => toggleIsOpen(false));
  const memoizedContext = useMemo(() => ({ isOpen, toggleIsOpen }), [isOpen, toggleIsOpen]);
  return (
    <div ref={containerRef} className="flex items-center justify-between w-full h-[64px] lg:hidden">
      <OpenContext.Provider value={memoizedContext}>
        <Logo />
        <NavBar />
        <LightButton text="" Icon={HamburgerIcon} onPress={toggleIsOpen} className="p-0! [&_.button-svg]:mr-0" />
      </OpenContext.Provider>
    </div>
  );
};
export default MobileHeader;
