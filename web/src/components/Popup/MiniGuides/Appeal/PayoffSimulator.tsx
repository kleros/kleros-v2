import React from "react";

import PayoffSimulatorSvg from "svgs/mini-guides/appeal/payoff-simulator.svg";

import { cn } from "utils/cn";

import { miniGuideImageClassName } from "../PageContentsTemplate";

const StyledPayoffSimulatorSvg = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof PayoffSimulatorSvg>) => (
  <PayoffSimulatorSvg
    {...props}
    className={cn(
      '[&_[class$="circle-1"]]:fill-klerosUIComponentsSuccessLight',
      '[&_[class$="rect-2"]]:fill-klerosUIComponentsMediumBlue',
      '[&_[class$="circle-2"]]:fill-klerosUIComponentsMediumPurple',
      '[&_[class$="rect-1"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="rect-1"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="rect-5"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="rect-5"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="rect-6"]]:fill-klerosUIComponentsWhite [&_[class$="rect-7"]]:fill-klerosUIComponentsWhite',
      '[&_[class$="rect-8"]]:fill-klerosUIComponentsWhite',
      '[&_[class$="path-2"]]:fill-klerosUIComponentsSuccess',
      '[&_[class$="path-3"]]:fill-klerosUIComponentsSecondaryPurple',
      '[&_[class$="path-16"]]:fill-klerosUIComponentsSecondaryPurple',
      '[&_[class$="path-11"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="path-13"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="path-4"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-5"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-6"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-7"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-8"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-9"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-10"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-12"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-14"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-15"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-17"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="rect-3"]]:fill-klerosUIComponentsPrimaryBlue',
      '[&_[class$="rect-4"]]:fill-klerosUIComponentsPrimaryBlue',
      '[&_[class$="line-1"]]:stroke-klerosUIComponentsMediumBlue',
      '[&_[class$="line-2"]]:stroke-klerosUIComponentsMediumBlue',
      '[&_[class$="path-1"]]:stroke-klerosUIComponentsMediumBlue',
      '[&_[class$="path-1"]]:fill-klerosUIComponentsLightBlue',
      className
    )}
  />
);

const PayoffSimulator: React.FC = () => <StyledPayoffSimulatorSvg className={miniGuideImageClassName} />;

export default PayoffSimulator;
