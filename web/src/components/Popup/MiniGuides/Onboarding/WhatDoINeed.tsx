import React from "react";

import WhatDoINeedSvg from "svgs/mini-guides/onboarding/what-do-i-need.svg";

import { cn } from "utils/cn";

import { miniGuideImageClassName } from "../PageContentsTemplate";

const StyledWhatDoINeedSvg = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof WhatDoINeedSvg>) => (
  <WhatDoINeedSvg
    {...props}
    className={cn(
      '[&_[class$="rect-1"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="rect-2"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="rect-3"]]:fill-klerosUIComponentsMediumBlue',
      '[&_[class$="rect-4"]]:fill-klerosUIComponentsMediumBlue',
      '[&_[class$="rect-5"]]:fill-klerosUIComponentsMediumBlue',
      '[&_[class$="rect-6"]]:fill-klerosUIComponentsMediumPurple',
      '[&_[class$="rect-7"]]:fill-klerosUIComponentsWhite [&_[class$="rect-8"]]:fill-klerosUIComponentsWhite',
      '[&_[class$="rect-9"]]:fill-klerosUIComponentsWhite',
      '[&_[class$="rect-10"]]:fill-klerosUIComponentsWhite',
      '[&_[class$="rect-11"]]:fill-klerosUIComponentsWhite',
      '[&_[class$="rect-12"]]:fill-klerosUIComponentsWhite',
      '[&_[class$="rect-13"]]:fill-klerosUIComponentsWhite',
      '[&_[class$="path-1"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-18"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-22"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-2"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-3"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-4"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-7"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-10"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-13"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-16"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-17"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-19"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-20"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-21"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-23"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-24"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-25"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-5"]]:fill-klerosUIComponentsPrimaryBlue',
      '[&_[class$="path-6"]]:fill-klerosUIComponentsPrimaryBlue',
      '[&_[class$="path-8"]]:fill-klerosUIComponentsPrimaryBlue',
      '[&_[class$="path-9"]]:fill-klerosUIComponentsPrimaryBlue',
      '[&_[class$="path-11"]]:fill-klerosUIComponentsPrimaryBlue',
      '[&_[class$="path-12"]]:fill-klerosUIComponentsPrimaryBlue',
      '[&_[class$="path-14"]]:fill-klerosUIComponentsSecondaryPurple',
      '[&_[class$="path-15"]]:fill-klerosUIComponentsSecondaryPurple',
      className
    )}
  />
);

const WhatDoINeed: React.FC = () => <StyledWhatDoINeedSvg className={miniGuideImageClassName} />;

export default WhatDoINeed;
