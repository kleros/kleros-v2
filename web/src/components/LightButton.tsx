import React from "react";

import { Button } from "@kleros/ui-components-library";

import { cn } from "utils/cn";

interface ILightButton {
  text: string;
  Icon?: React.FC<React.SVGAttributes<SVGElement>>;
  onPress?: React.ComponentProps<typeof Button>["onPress"];
  disabled?: boolean;
  className?: string;
  isMobileNavbar?: boolean;
}

const LightButton: React.FC<ILightButton> = ({ text, Icon, onPress, disabled, className, isMobileNavbar }) => (
  <Button
    variant="primary"
    small
    isDisabled={disabled}
    {...{ text, Icon, onPress }}
    className={cn(
      "rounded-[7px] bg-transparent p-2! [transition:0.1s]",
      "hover:bg-[var(--klerosUIComponentsWhiteLowOpacityStrong)] [&_.button-text]:font-normal",
      "[&_.button-text]:text-klerosUIComponentsPrimaryText lg:[&_.button-svg]:mr-0",
      isMobileNavbar
        ? "[&_.button-svg]:fill-klerosUIComponentsSecondaryText! hover:[&_.button-svg]:fill-klerosUIComponentsPrimaryText!"
        : "[&_.button-svg]:fill-[#ffffffbf]! hover:[&_.button-svg]:fill-white!",
      className
    )}
  />
);

export default LightButton;
