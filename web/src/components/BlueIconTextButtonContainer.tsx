import React from "react";

import { cn } from "utils/cn";

export const BlueIconTextButtonContainer = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(function BlueIconTextButtonContainer({ className, ...props }, ref) {
  return (
    <div
      {...props}
      ref={ref}
      className={cn(
        "[transition:0.1s] flex items-center text-center text-[14px] font-normal gap-2 cursor-pointer",
        "[&_svg_path]:fill-klerosUIComponentsPrimaryBlue [&_label]:mt-0.25",
        "[&_label]:text-klerosUIComponentsPrimaryBlue [&:hover_svg_path]:fill-klerosUIComponentsSecondaryBlue",
        "[&:hover_label]:cursor-pointer [&:hover_label]:text-klerosUIComponentsSecondaryBlue",
        className
      )}
    />
  );
});
