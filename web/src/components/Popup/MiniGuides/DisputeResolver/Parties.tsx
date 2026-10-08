import React from "react";

import PartiesSvg from "svgs/mini-guides/dispute-resolver/parties.svg";

import { cn } from "utils/cn";

import { miniGuideImageClassName } from "../PageContentsTemplate";

const StyledPartiesSvg = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof PartiesSvg>) => (
  <PartiesSvg
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
      '[&_[class$="rect-6"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="rect-6"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="path-1"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-3"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-5"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-7"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-2"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-4"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-6"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-8"]]:fill-klerosUIComponentsPrimaryText',
      className
    )}
  />
);

const Parties: React.FC = () => <StyledPartiesSvg className={miniGuideImageClassName} />;

export default Parties;
