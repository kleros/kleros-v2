import React from "react";

import StageOneSvg from "svgs/mini-guides/appeal/stage-one.svg";

import { cn } from "utils/cn";

import { miniGuideImageClassName } from "../PageContentsTemplate";

const StyledStageOneSvg = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof StageOneSvg>) => (
  <StageOneSvg
    {...props}
    className={cn(
      '[&_[class$="rect-1"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="rect-2"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="rect-6"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="circle-1"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="circle-2"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="rect-4"]]:fill-klerosUIComponentsStroke',
      '[&_[class$="rect-8"]]:fill-klerosUIComponentsStroke',
      '[&_[class$="rect-5"]]:fill-klerosUIComponentsSecondaryPurple',
      '[&_[class$="path-9"]]:fill-klerosUIComponentsSecondaryPurple',
      '[&_[class$="path-10"]]:fill-klerosUIComponentsSecondaryPurple',
      '[&_[class$="rect-9"]]:fill-klerosUIComponentsPrimaryBlue',
      '[&_[class$="circle-3"]]:fill-klerosUIComponentsPrimaryBlue',
      '[&_[class$="rect-10"]]:fill-klerosUIComponentsLightBlue',
      '[&_[class$="rect-10"]]:stroke-klerosUIComponentsMediumBlue',
      '[&_[class$="rect-11"]]:fill-klerosUIComponentsWhite',
      '[&_[class$="rect-12"]]:fill-klerosUIComponentsWhite',
      '[&_[class$="path-2"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-6"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-1"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-5"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-3"]]:fill-klerosUIComponentsSuccess',
      '[&_[class$="path-4"]]:fill-klerosUIComponentsSuccess',
      '[&_[class$="path-7"]]:fill-klerosUIComponentsWarning',
      '[&_[class$="path-8"]]:fill-klerosUIComponentsWarning',
      '[&_[class$="rect-3"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="rect-7"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="circle-1"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="circle-2"]]:stroke-klerosUIComponentsPrimaryBlue',
      className
    )}
  />
);

const StageOne: React.FC = () => <StyledStageOneSvg className={miniGuideImageClassName} />;

export default StageOne;
