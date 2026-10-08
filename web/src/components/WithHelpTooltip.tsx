import React from "react";

import { Tooltip } from "@kleros/ui-components-library";

import _HelpIcon from "svgs/menu-icons/help.svg";

import { cn } from "utils/cn";

interface IWithHelpTooltip {
  tooltipMsg: string;
  place?: "bottom" | "left" | "right" | "top";
  children?: React.ReactNode;
}

const WithHelpTooltip: React.FC<IWithHelpTooltip> = ({ tooltipMsg, children, place }) => (
  <div className="flex items-center">
    {children}
    <Tooltip small text={tooltipMsg} {...{ place }} className="[&_small]:text-[14px] [&_small]:leading-[20px]">
      <_HelpIcon
        className={cn(
          "flex items-center h-[12px] w-[12px] fill-klerosUIComponentsSecondaryText m-[0_0_0_8px] lg:h-[14px]",
          "lg:w-[14px]"
        )}
      />
    </Tooltip>
  </div>
);

export default WithHelpTooltip;
