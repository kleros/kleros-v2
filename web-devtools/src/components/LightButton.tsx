import React from "react";

import { Button } from "@kleros/ui-components-library";

import { cn } from "utils/cn";

interface ILightButton {
  text: string;
  Icon?: React.FC<React.SVGAttributes<SVGElement>>;
  onClick?: React.ComponentProps<typeof Button>["onClick"];
  disabled?: boolean;
  className?: string;
}

const LightButton: React.FC<ILightButton> = ({ text, Icon, onClick, disabled, className }) => (
  <Button
    aria-label={text || "Open navigation"}
    variant="primary"
    small
    isDisabled={disabled}
    className={cn("[&_.button-text]:font-normal [&_svg]:fill-klerosUIComponentsSecondaryPurple", className)}
    {...{ text, Icon, onClick }}
  />
);

export default LightButton;
