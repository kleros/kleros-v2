"use client";
import React from "react";

import { useLockBodyScroll } from "react-use";

import { cn } from "utils/cn";

import { useOpenContext } from "../MobileHeader";

import Explore from "./Explore";

const NavBar: React.FC = () => {
  const { isOpen } = useOpenContext();
  useLockBodyScroll(isOpen);

  return (
    <>
      <div className={cn("absolute left-0 top-full z-30 w-screen", isOpen ? "visible" : "invisible")}>
        <div
          className={cn(
            "absolute inset-x-0 top-0 z-[1] max-h-[calc(100vh-160px)] origin-top overflow-y-auto",
            "border border-klerosUIComponentsStroke bg-klerosUIComponentsWhiteBackground p-6 shadow-default",
            "transition-[transform,visibility] duration-[var(--klerosUIComponentsTransitionSpeed)]",
            "ease-ease [&_hr]:my-6",
            isOpen ? "visible scale-y-100" : "invisible scale-y-0"
          )}
        >
          <Explore />
        </div>
      </div>
    </>
  );
};

export default NavBar;
