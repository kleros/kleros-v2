import React from "react";

import DottedMenu from "svgs/icons/dotted-menu.svg";

import { cn } from "utils/cn";

interface IMenuButton {
  toggle: () => void;
  displayRipple: boolean;
}

const MenuButton: React.FC<IMenuButton> = ({ toggle, displayRipple }) => {
  return (
    <div
      className={cn(
        "flex justify-center items-center",
        displayRipple &&
          "before:content-[''] after:content-[''] before:opacity-0 after:opacity-0 before:absolute after:absolute before:top-0 after:top-0 before:left-0 after:left-0 before:[transform:translate(50%)] after:[transform:translate(50%)] before:size-9 after:size-9 before:border-[3px] after:border-[3px] before:border-klerosUIComponentsPrimaryBlue after:border-klerosUIComponentsPrimaryBlue before:rounded-full after:rounded-full before:animate-[maintenance-ripple_3s_cubic-bezier(0.65,0,0.34,1)_0.5s_infinite] after:animate-[maintenance-ripple_3s_cubic-bezier(0.65,0,0.34,1)_infinite] before:z-0 after:z-0"
      )}
    >
      <div className="rounded-full z-1 bg-klerosUIComponentsLightBackground">
        <DottedMenu className="cursor-pointer size-9 fill-klerosUIComponentsPrimaryBlue" onClick={toggle} />
      </div>
    </div>
  );
};

export default MenuButton;
