import React from "react";

import StakingSectionSvg from "svgs/mini-guides/staking/staking-section.svg";

import { cn } from "utils/cn";

import { miniGuideImageClassName } from "../PageContentsTemplate";

const StyledStakingSectionSvg = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof StakingSectionSvg>) => (
  <StakingSectionSvg
    {...props}
    className={cn(
      '[&_[class$="rect-1"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="path-2"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="rect-2"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="rect-3"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="rect-3"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="rect-4"]]:fill-klerosUIComponentsPrimaryBlue',
      '[&_[class$="rect-5"]]:fill-klerosUIComponentsWhite [&_[class$="rect-6"]]:fill-klerosUIComponentsWhite',
      '[&_[class$="path-1"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-6"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-9"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-3"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-4"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-7"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-10"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-5"]]:fill-klerosUIComponentsSecondaryPurple',
      '[&_[class$="path-8"]]:fill-klerosUIComponentsSecondaryPurple',
      className
    )}
  />
);

const StakingSection: React.FC = () => <StyledStakingSectionSvg className={miniGuideImageClassName} />;

export default StakingSection;
