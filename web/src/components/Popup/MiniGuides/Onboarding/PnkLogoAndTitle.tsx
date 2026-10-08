import React from "react";

import PnkIcon from "svgs/styled/pnk.svg";

import { cn } from "utils/cn";

const PnkLogoAndTitle = () => {
  return (
    <div className="flex flex-col justify-center gap-8 items-center">
      <PnkIcon
        className={
          'w-[calc(220px_+_(280_-_220)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] h-[calc(220px_+_(252_-_220)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] [&_[class$="stop-1"]]:[stop-color:var(--klerosUIComponentsPrimaryBlue)] [&_[class$="stop-2"]]:[stop-color:var(--klerosUIComponentsSecondaryPurple)]'
        }
      />
      <label
        className={cn(
          "text-[24px]",
          "[background-image:linear-gradient(_90deg,_var(--klerosUIComponentsSecondaryPurple)_0%,_var(--klerosUIComponentsPrimaryBlue)_100%_)]",
          "[background-clip:text] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]"
        )}
      >
        Court v.2
      </label>
    </div>
  );
};

export default PnkLogoAndTitle;
