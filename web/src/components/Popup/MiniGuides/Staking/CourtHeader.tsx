import React from "react";

import CourtHeaderSvg from "svgs/mini-guides/staking/court-header.svg";

import { cn } from "utils/cn";

import { miniGuideImageClassName } from "../PageContentsTemplate";

const StyledCourtHeaderSvg = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof CourtHeaderSvg>) => (
  <CourtHeaderSvg
    {...props}
    className={cn(
      '[&_[class$="circle-1"]]:fill-klerosUIComponentsSuccessLight',
      '[&_[class$="circle-2"]]:fill-klerosUIComponentsMediumPurple',
      '[&_[class$="circle-3"]]:fill-klerosUIComponentsMediumPurple',
      '[&_[class$="circle-4"]]:fill-klerosUIComponentsMediumPurple',
      '[&_[class$="line-1"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="line-2"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="rect-1"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="rect-5"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="path-2"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="rect-3"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="rect-2"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="rect-3"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="rect-4"]]:fill-klerosUIComponentsPrimaryBlue',
      '[&_[class$="path-3"]]:fill-klerosUIComponentsPrimaryBlue',
      '[&_[class$="rect-7"]]:fill-klerosUIComponentsWhite [&_[class$="rect-8"]]:fill-klerosUIComponentsWhite',
      '[&_[class$="rect-9"]]:fill-klerosUIComponentsWhite',
      '[&_[class$="rect-10"]]:fill-klerosUIComponentsWhite',
      '[&_[class$="rect-11"]]:fill-klerosUIComponentsWhite',
      '[&_[class$="rect-12"]]:fill-klerosUIComponentsWhite',
      '[&_[class$="rect-13"]]:fill-klerosUIComponentsWhite',
      '[&_[class$="rect-6"]]:stroke-klerosUIComponentsPrimaryBlue',
      '[&_[class$="path-4"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-5"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-8"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-11"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-14"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-21"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-22"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-23"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-26"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-29"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-32"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-1"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-7"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-10"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-13"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-15"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-16"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-17"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-18"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-19"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-20"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-24"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-25"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-27"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-28"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-30"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-31"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-33"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-34"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-6"]]:fill-klerosUIComponentsSecondaryPurple',
      '[&_[class$="path-9"]]:fill-klerosUIComponentsSecondaryPurple',
      '[&_[class$="path-12"]]:fill-klerosUIComponentsSecondaryPurple',
      '[&_[class$="path-36"]]:fill-klerosUIComponentsSecondaryPurple',
      '[&_[class$="path-37"]]:fill-klerosUIComponentsSecondaryPurple',
      '[&_[class$="path-38"]]:fill-klerosUIComponentsSecondaryPurple',
      '[&_[class$="path-39"]]:fill-klerosUIComponentsSecondaryPurple',
      '[&_[class$="path-40"]]:fill-klerosUIComponentsSecondaryPurple',
      '[&_[class$="path-41"]]:fill-klerosUIComponentsSecondaryPurple',
      '[&_[class$="path-42"]]:fill-klerosUIComponentsSecondaryPurple',
      '[&_[class$="path-43"]]:fill-klerosUIComponentsSecondaryPurple',
      '[&_[class$="path-44"]]:fill-klerosUIComponentsSecondaryPurple',
      '[&_[class$="path-45"]]:fill-klerosUIComponentsSecondaryPurple',
      '[&_[class$="path-35"]]:fill-klerosUIComponentsSuccess',
      className
    )}
  />
);

const CourtHeader: React.FC = () => <StyledCourtHeaderSvg className={miniGuideImageClassName} />;

export default CourtHeader;
