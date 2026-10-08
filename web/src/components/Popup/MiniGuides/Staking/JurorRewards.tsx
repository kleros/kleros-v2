import React from "react";

import JurorRewardsSvg from "svgs/mini-guides/staking/juror-rewards.svg";

import { cn } from "utils/cn";

import { miniGuideImageClassName } from "../PageContentsTemplate";

const StyledJurorRewardsSvg = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof JurorRewardsSvg>) => (
  <JurorRewardsSvg
    {...props}
    className={cn(
      '[&_[class$="rect-1"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="rect-2"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="path-2"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="rect-3"]]:fill-klerosUIComponentsWhite [&_[class$="rect-4"]]:fill-klerosUIComponentsWhite',
      '[&_[class$="rect-5"]]:fill-klerosUIComponentsWhite [&_[class$="rect-6"]]:fill-klerosUIComponentsWhite',
      '[&_[class$="rect-7"]]:fill-klerosUIComponentsWhite [&_[class$="mask-1"]]:fill-klerosUIComponentsWhite',
      '[&_[class$="stop-1"]]:[stop-color:var(--klerosUIComponentsSecondaryPurple)]',
      '[&_[class$="stop-4"]]:[stop-color:var(--klerosUIComponentsSecondaryPurple)]',
      '[&_[class$="stop-6"]]:[stop-color:var(--klerosUIComponentsSecondaryPurple)]',
      '[&_[class$="stop-2"]]:[stop-color:var(--klerosUIComponentsPrimaryBlue)]',
      '[&_[class$="stop-3"]]:[stop-color:var(--klerosUIComponentsPrimaryBlue)]',
      '[&_[class$="stop-5"]]:[stop-color:var(--klerosUIComponentsPrimaryBlue)]',
      '[&_[class$="path-3"]]:fill-klerosUIComponentsPrimaryBlue',
      '[&_[class$="path-5"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-6"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-9"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-13"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-14"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-7"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-8"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-10"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-11"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-12"]]:fill-klerosUIComponentsSecondaryText',
      className
    )}
  />
);

const JurorRewards: React.FC = () => <StyledJurorRewardsSvg className={miniGuideImageClassName} />;

export default JurorRewards;
