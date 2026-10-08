import React from "react";

import StageTwoSvg from "svgs/mini-guides/appeal/stage-two.svg";

import { cn } from "utils/cn";

import { miniGuideImageClassName } from "../PageContentsTemplate";

const StyledStageTwoSvg = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof StageTwoSvg>) => (
  <StageTwoSvg
    {...props}
    className={cn(
      '[&_[class$="rect-1"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="rect-2"]]:fill-klerosUIComponentsLightBlue',
      '[&_[class$="rect-2"]]:stroke-klerosUIComponentsMediumBlue',
      '[&_[class$="rect-6"]]:fill-klerosUIComponentsLightBlue',
      '[&_[class$="rect-6"]]:stroke-klerosUIComponentsMediumBlue',
      '[&_[class$="rect-3"]]:fill-klerosUIComponentsSuccess',
      '[&_[class$="path-2"]]:fill-klerosUIComponentsSuccess',
      '[&_[class$="path-3"]]:fill-klerosUIComponentsSuccess',
      '[&_[class$="rect-4"]]:fill-klerosUIComponentsStroke',
      '[&_[class$="rect-5"]]:fill-klerosUIComponentsPrimaryBlue',
      '[&_[class$="rect-7"]]:fill-klerosUIComponentsWhite',
      '[&_[class$="line-1"]]:stroke-klerosUIComponentsMediumBlue',
      '[&_[class$="path-1"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-4"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-5"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-6"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-7"]]:fill-klerosUIComponentsSecondaryPurple',
      '[&_[class$="path-8"]]:fill-klerosUIComponentsSecondaryPurple',
      className
    )}
  />
);

const StageTwo: React.FC = () => <StyledStageTwoSvg className={miniGuideImageClassName} />;

export default StageTwo;
