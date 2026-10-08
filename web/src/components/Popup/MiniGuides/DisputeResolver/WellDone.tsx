import React from "react";

import WellDoneSvg from "svgs/mini-guides/dispute-resolver/well-done.svg";

import { cn } from "utils/cn";

import { miniGuideImageClassName } from "../PageContentsTemplate";

const StyledWellDoneSvg = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof WellDoneSvg>) => (
  <WellDoneSvg
    {...props}
    className={cn(
      '[&_[class$="rect-1"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="rect-2"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="rect-3"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="line-1"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="line-2"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="circle-1"]]:fill-klerosUIComponentsPrimaryPurple',
      '[&_[class$="path-1"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-2"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-4"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-5"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-7"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-9"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-11"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-15"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-18"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-21"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-3"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-6"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-8"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-10"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-12"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-14"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-17"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-20"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-13"]]:fill-klerosUIComponentsSecondaryPurple',
      '[&_[class$="path-16"]]:fill-klerosUIComponentsSecondaryPurple',
      '[&_[class$="path-19"]]:fill-klerosUIComponentsSecondaryPurple',
      className
    )}
  />
);

const WellDone: React.FC = () => <StyledWellDoneSvg className={miniGuideImageClassName} />;

export default WellDone;
