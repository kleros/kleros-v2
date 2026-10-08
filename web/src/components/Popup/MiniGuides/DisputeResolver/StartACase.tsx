import React from "react";

import StartACaseSvg from "svgs/mini-guides/dispute-resolver/start-a-case.svg";

import { cn } from "utils/cn";

import { miniGuideImageClassName } from "../PageContentsTemplate";

const StyledStartACaseSvg = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof StartACaseSvg>) => (
  <StartACaseSvg
    {...props}
    className={cn(
      '[&_[class$="rect-1"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="path-1"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="rect-2"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="circle-2"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="circle-3"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="circle-4"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="path-12"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="path-13"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="circle-1"]]:stroke-klerosUIComponentsPrimaryBlue',
      '[&_[class$="circle-1"]]:fill-klerosUIComponentsPrimaryBlue',
      '[&_[class$="path-11"]]:stroke-klerosUIComponentsPrimaryBlue',
      '[&_[class$="path-11"]]:fill-klerosUIComponentsPrimaryBlue',
      '[&_[class$="circle-2"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="circle-3"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="circle-4"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="path-2"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-18"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-3"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-5"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-6"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-7"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-8"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-9"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-10"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-15"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-17"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-4"]]:fill-klerosUIComponentsStroke',
      '[&_[class$="path-14"]]:fill-klerosUIComponentsStroke',
      '[&_[class$="path-16"]]:fill-klerosUIComponentsStroke',
      className
    )}
  />
);

const StartACase: React.FC = () => <StyledStartACaseSvg className={miniGuideImageClassName} />;

export default StartACase;
