import React from "react";

import { cn } from "utils/cn";

export const Divider = React.forwardRef<React.ElementRef<"hr">, React.ComponentPropsWithoutRef<"hr">>(function Divider(
  { className, ...props },
  ref
) {
  return (
    <hr
      {...props}
      ref={ref}
      className={cn("flex w-full border-0 h-[1px] bg-klerosUIComponentsStroke m-0", className)}
    />
  );
});
