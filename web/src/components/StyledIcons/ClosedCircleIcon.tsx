import React from "react";

import ClosedCircle from "svgs/icons/close-circle.svg";

import { cn } from "utils/cn";

export const StyledClosedCircle = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof ClosedCircle>) => (
  <ClosedCircle {...props} className={cn("[&_path]:fill-klerosUIComponentsError", className)} />
);

const ClosedCircleIcon: React.FC = () => {
  return <StyledClosedCircle />;
};

export default ClosedCircleIcon;
