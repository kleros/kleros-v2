import React from "react";

import DottedMenu from "svgs/icons/dotted-menu.svg";

import { cn } from "utils/cn";

interface IMenuButton {
  toggle: () => void;
  displayRipple: boolean;
  className?: string;
}

const DottedMenuButton: React.FC<IMenuButton> = ({ toggle, displayRipple, className }) => (
  <div
    className={cn(
      "flex size-9 items-center justify-center",
      displayRipple &&
        "before:absolute before:top-0 before:left-0 before:z-0 before:size-full before:rounded-full before:border-[3px] before:border-klerosUIComponentsPrimaryBlue before:opacity-0 before:content-[''] before:animate-[kleros-ripple_3s_cubic-bezier(0.65,0,0.34,1)_0.5s_infinite] after:absolute after:top-0 after:left-0 after:z-0 after:size-full after:rounded-full after:border-[3px] after:border-klerosUIComponentsPrimaryBlue after:opacity-0 after:content-[''] after:animate-[kleros-ripple_3s_cubic-bezier(0.65,0,0.34,1)_infinite]",
      className
    )}
  >
    <div
      className={cn(
        "button-container z-[1] rounded-full bg-klerosUIComponentsLightBackground [transition:0.1s]",
        "hover:bg-klerosUIComponentsLightGrey hover:[&_svg]:fill-klerosUIComponentsSecondaryBlue"
      )}
    >
      <DottedMenu onClick={toggle} className="menu-icon size-full cursor-pointer fill-klerosUIComponentsPrimaryBlue" />
    </div>
  </div>
);

export default DottedMenuButton;
