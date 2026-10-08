import React from "react";

import CrowdfundAppealSvg from "svgs/mini-guides/appeal/crowdfund-appeal.svg";

import { cn } from "utils/cn";

import { miniGuideImageClassName } from "../PageContentsTemplate";

const StyledCrowdfundAppealSvg = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CrowdfundAppealSvg>) => (
  <CrowdfundAppealSvg
    {...props}
    className={cn(
      '[&_[class$="rect-bg"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="rect-bg"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="path-1"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-2"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-3"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="rect-fg"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="rect-fg"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="rect-accent"]]:fill-klerosUIComponentsPrimaryBlue',
      '[&_[class$="path-4"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="path-5"]]:fill-klerosUIComponentsSecondaryText',
      className
    )}
  />
);

const CrowdfundAppeal: React.FC = () => <StyledCrowdfundAppealSvg className={miniGuideImageClassName} />;

export default CrowdfundAppeal;
