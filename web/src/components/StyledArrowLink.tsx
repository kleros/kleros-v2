import React from "react";

import { Link } from "react-router-dom";

import { cn } from "utils/cn";

export const StyledArrowLink = React.forwardRef<HTMLAnchorElement, React.ComponentPropsWithoutRef<typeof Link>>(
  ({ className, ...props }, ref) => (
    <Link
      ref={ref}
      {...props}
      className={cn(
        "flex gap-2 items-center text-[16px] [&>svg]:h-[16px] [&>svg]:w-[16px]",
        "[&>svg_path]:fill-klerosUIComponentsPrimaryBlue [&:hover]:text-klerosUIComponentsSecondaryBlue",
        "[&:hover_svg_path]:[transition:fill_0.1s] [&:hover_svg_path]:fill-klerosUIComponentsSecondaryBlue",
        className
      )}
    />
  )
);
StyledArrowLink.displayName = "StyledArrowLink";
