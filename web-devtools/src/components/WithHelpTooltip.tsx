import React from "react";

import { Tooltip } from "@kleros/ui-components-library";

import _HelpIcon from "svgs/icons/help.svg";

interface IWithHelpTooltip {
  tooltipMsg: string;
  place?: "bottom" | "left" | "right" | "top";
  children?: React.ReactNode;
}

const WithHelpTooltip: React.FC<IWithHelpTooltip> = ({ tooltipMsg, children, place }) => (
  <div className="flex items-center">
    {children}
    <Tooltip small text={tooltipMsg} wrapperProps={{ tabIndex: 0, "aria-label": "Help" }} {...{ place }}>
      <_HelpIcon className="ml-2 flex size-3 items-center fill-klerosUIComponentsSecondaryText lg:size-3.5" />
    </Tooltip>
  </div>
);

export default WithHelpTooltip;
