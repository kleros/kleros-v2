import React from "react";

import VotingModuleSvg from "svgs/mini-guides/binary-voting/voting-module.svg";

import { cn } from "utils/cn";

import { miniGuideImageClassName } from "../PageContentsTemplate";

const StyledVotingModuleSvg = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof VotingModuleSvg>) => (
  <VotingModuleSvg
    {...props}
    className={cn(
      '[&_[class$="rect-1"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="rect-4"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="path-1"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="path-2"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="rect-2"]]:fill-klerosUIComponentsPrimaryBlue',
      '[&_[class$="rect-3"]]:fill-klerosUIComponentsPrimaryBlue',
      '[&_[class$="path-4"]]:fill-klerosUIComponentsPrimaryBlue',
      '[&_[class$="path-3"]]:fill-klerosUIComponentsLightBlue',
      '[&_[class$="path-5"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="rect-1"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="rect-5"]]:stroke-klerosUIComponentsPrimaryBlue',
      className
    )}
  />
);

const VotingModule: React.FC = () => <StyledVotingModuleSvg className={miniGuideImageClassName} />;

export default VotingModule;
