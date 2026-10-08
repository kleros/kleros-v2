import React from "react";

import NewTab from "svgs/icons/new-tab.svg";

import { cn } from "utils/cn";

/* svgs/icons/new-tab.svg has no fill of its own, so it renders black unless every usage
   colors the path (kleros/kleros-v2#2433). Import this instead of the raw svg. */
const NewTabIcon = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof NewTab>) => (
  <NewTab {...props} className={cn("[&_path]:fill-klerosUIComponentsPrimaryBlue", className)} />
);

export default NewTabIcon;
