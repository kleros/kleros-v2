import React from "react";

import VotingModuleSvg from "svgs/mini-guides/ranked-voting/voting-module.svg";

import { cn } from "utils/cn";

import { miniGuideImageClassName } from "../PageContentsTemplate";

const StyledVotingModuleSvg = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof VotingModuleSvg>) => (
  <VotingModuleSvg
    {...props}
    className={cn(
      '[&_[class$="path-1"]]:fill-klerosUIComponentsSuccess',
      '[&_[class$="path-5"]]:fill-klerosUIComponentsSuccess',
      '[&_[class$="rect-1"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="rect-2"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="rect-4"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="rect-8"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="rect-13"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="path-3"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="path-4"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="path-7"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="path-8"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="path-13"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="path-12"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="path-14"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="rect-1"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="rect-3"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="rect-5"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="rect-7"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="rect-9"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="rect-6"]]:stroke-klerosUIComponentsSuccess',
      '[&_[class$="rect-10"]]:stroke-klerosUIComponentsError',
      '[&_[class$="rect-14"]]:stroke-klerosUIComponentsPrimaryBlue',
      '[&_[class$="rect-11"]]:fill-klerosUIComponentsLightBlue',
      '[&_[class$="rect-12"]]:fill-klerosUIComponentsPrimaryBlue',
      '[&_[class$="path-11"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-2"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-6"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-9"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-10"]]:fill-klerosUIComponentsError',
      '[&_[class$="path-15"]]:fill-klerosUIComponentsPrimaryBlue',
      className
    )}
  />
);

const VotingModule: React.FC = () => <StyledVotingModuleSvg className={miniGuideImageClassName} />;

export default VotingModule;
