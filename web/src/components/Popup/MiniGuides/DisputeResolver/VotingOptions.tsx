import React from "react";

import VotingOptionsSvg from "svgs/mini-guides/dispute-resolver/voting-options.svg";

import { cn } from "utils/cn";

import { miniGuideImageClassName } from "../PageContentsTemplate";

const StyledVotingOptionsSvg = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof VotingOptionsSvg>) => (
  <VotingOptionsSvg
    {...props}
    className={cn(
      '[&_[class$="rect-1"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="rect-2"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="rect-2"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="rect-3"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="rect-3"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="rect-4"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="rect-4"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="rect-5"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="rect-5"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="circle-1"]]:fill-klerosUIComponentsPrimaryBlue',
      '[&_[class$="circle-2"]]:fill-klerosUIComponentsPrimaryBlue',
      '[&_[class$="path-8"]]:fill-klerosUIComponentsPrimaryBlue',
      '[&_[class$="path-1"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-3"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-5"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-7"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-2"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-4"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-6"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-9"]]:fill-klerosUIComponentsSecondaryText',
      className
    )}
  />
);

const VotingOptions: React.FC = () => <StyledVotingOptionsSvg className={miniGuideImageClassName} />;

export default VotingOptions;
