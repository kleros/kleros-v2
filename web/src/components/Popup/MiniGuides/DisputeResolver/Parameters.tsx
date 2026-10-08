import React from "react";

import ParametersSvg from "svgs/mini-guides/dispute-resolver/parameters.svg";

import { cn } from "utils/cn";

import { miniGuideImageClassName } from "../PageContentsTemplate";

const StyledParametersSvg = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof ParametersSvg>) => (
  <ParametersSvg
    {...props}
    className={cn(
      '[&_[class$="rect-1"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="rect-3"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="rect-7"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="path-3"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="rect-2"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="rect-6"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="rect-8"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="rect-4"]]:stroke-klerosUIComponentsPrimaryBlue',
      '[&_[class$="rect-5"]]:fill-klerosUIComponentsPrimaryBlue',
      '[&_[class$="path-2"]]:fill-klerosUIComponentsPrimaryBlue',
      '[&_[class$="path-1"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-4"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-7"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-8"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-5"]]:fill-klerosUIComponentsStroke',
      '[&_[class$="path-6"]]:fill-klerosUIComponentsSecondaryPurple',
      className
    )}
  />
);

const Parameters: React.FC = () => <StyledParametersSvg className={miniGuideImageClassName} />;

export default Parameters;
