import React from "react";

import HowItWorksSvg from "svgs/mini-guides/onboarding/how-it-works.svg";

import { cn } from "utils/cn";

import { miniGuideImageClassName } from "../PageContentsTemplate";

const StyledHowItWorksSvg = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof HowItWorksSvg>) => (
  <HowItWorksSvg
    {...props}
    className={cn(
      '[&_[class$="rect-1"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="rect-3"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="path-1"]]:fill-klerosUIComponentsSecondaryPurple',
      '[&_[class$="path-2"]]:fill-klerosUIComponentsSecondaryPurple',
      '[&_[class$="rect-2"]]:stroke-klerosUIComponentsStroke',
      className
    )}
  />
);

const HowItWorks: React.FC = () => <StyledHowItWorksSvg className={miniGuideImageClassName} />;

export default HowItWorks;
