import React from "react";

import PrivateVotingSvg from "svgs/mini-guides/binary-voting/private-voting.svg";

import { cn } from "utils/cn";

import { miniGuideImageClassName } from "../PageContentsTemplate";

const StyledPrivateVotingSvg = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof PrivateVotingSvg>) => (
  <PrivateVotingSvg
    {...props}
    className={cn(
      '[&_[class$="rect-1"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="circle-2"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="path-2"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="path-9"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="circle-1"]]:fill-klerosUIComponentsPrimaryBlue',
      '[&_[class$="circle-1"]]:stroke-klerosUIComponentsPrimaryBlue',
      '[&_[class$="circle-3"]]:fill-klerosUIComponentsPrimaryBlue',
      '[&_[class$="circle-3"]]:stroke-klerosUIComponentsPrimaryBlue',
      '[&_[class$="rect-1"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="circle-2"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="path-4"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="path-8"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="path-11"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="path-1"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-7"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-3"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-6"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-10"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-5"]]:fill-klerosUIComponentsStroke',
      className
    )}
  />
);

const PrivateVoting: React.FC = () => <StyledPrivateVotingSvg className={miniGuideImageClassName} />;

export default PrivateVoting;
