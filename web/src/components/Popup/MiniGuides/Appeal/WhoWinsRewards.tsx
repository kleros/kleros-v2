import React from "react";

import WhoWinsRewardsSvg from "svgs/mini-guides/appeal/who-wins-rewards.svg";

import { cn } from "utils/cn";

import { miniGuideImageClassName } from "../PageContentsTemplate";

const StyledWhoWinsRewardsSvg = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof WhoWinsRewardsSvg>) => (
  <WhoWinsRewardsSvg
    {...props}
    className={cn(
      '[&_[class$="path-1"]]:fill-klerosUIComponentsLightBlue',
      '[&_[class$="path-1"]]:stroke-klerosUIComponentsMediumBlue',
      '[&_[class$="path-2"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-19"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-20"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-3"]]:fill-klerosUIComponentsSuccess',
      '[&_[class$="path-7"]]:fill-klerosUIComponentsSuccess',
      '[&_[class$="path-8"]]:fill-klerosUIComponentsSuccess',
      '[&_[class$="path-9"]]:fill-klerosUIComponentsSuccess',
      '[&_[class$="path-10"]]:fill-klerosUIComponentsSuccess',
      '[&_[class$="path-4"]]:fill-klerosUIComponentsTint [&_[class$="path-5"]]:fill-klerosUIComponentsTint',
      '[&_[class$="path-6"]]:fill-klerosUIComponentsTint [&_[class$="path-12"]]:fill-klerosUIComponentsTint',
      '[&_[class$="path-13"]]:fill-klerosUIComponentsTint [&_[class$="path-14"]]:fill-klerosUIComponentsTint',
      '[&_[class$="path-11"]]:fill-klerosUIComponentsError',
      '[&_[class$="path-15"]]:fill-klerosUIComponentsError',
      '[&_[class$="path-16"]]:fill-klerosUIComponentsError',
      '[&_[class$="path-17"]]:fill-klerosUIComponentsError',
      '[&_[class$="path-18"]]:fill-klerosUIComponentsError',
      '[&_[class$="line-1"]]:stroke-klerosUIComponentsMediumBlue',
      '[&_[class$="line-2"]]:stroke-klerosUIComponentsMediumBlue',
      '[&_[class$="rect-1"]]:fill-klerosUIComponentsTintMedium',
      '[&_[class$="rect-2"]]:fill-klerosUIComponentsTintMedium',
      className
    )}
  />
);

const WhoWinsRewards: React.FC = () => <StyledWhoWinsRewardsSvg className={miniGuideImageClassName} />;

export default WhoWinsRewards;
