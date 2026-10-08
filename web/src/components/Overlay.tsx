import React from "react";

import { cn } from "utils/cn";

export const Overlay = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  function Overlay({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        className={cn("fixed top-0 left-0 w-[100vw] h-[100vh] bg-klerosUIComponentsBlackLowOpacity z-30", className)}
      />
    );
  }
);
