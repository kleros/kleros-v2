import React from "react";

import { cn } from "utils/cn";

export const ErrorButtonMessage = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  function ErrorButtonMessage({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        className={cn("flex items-center gap-1 justify-center m-3 text-klerosUIComponentsError text-[14px]", className)}
      />
    );
  }
);
