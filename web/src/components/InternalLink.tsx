import React from "react";

import { Link } from "react-router-dom";

import { cn } from "utils/cn";

export const InternalLink = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof Link>) => (
  <Link {...props} className={cn("[&:hover]:text-klerosUIComponentsSecondaryBlue!", className)} />
);
