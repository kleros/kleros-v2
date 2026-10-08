import React from "react";

import WithHelpTooltip from "components/WithHelpTooltip";

const Header: React.FC<{ text: string; tooltipMsg: string }> = ({ text, tooltipMsg }) => (
  <div className="flex w-full items-center border-b border-klerosUIComponentsStroke py-2">
    <WithHelpTooltip tooltipMsg={tooltipMsg} place="right">
      <h2 className="m-0">{text}</h2>
    </WithHelpTooltip>
  </div>
);

export default Header;
