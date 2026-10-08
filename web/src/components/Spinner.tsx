import React from "react";

import SpinnerIcon from "svgs/icons/spinner.svg";

import { cn } from "utils/cn";

const Spinner: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...props }) => (
  <SpinnerIcon
    {...props}
    className={cn(
      "mr-1 size-4 animate-[kleros-rotating_2s_ease-in-out_infinite_normal]",
      "[&_path]:fill-klerosUIComponentsPrimaryBlue",
      className
    )}
  />
);

export default Spinner;
