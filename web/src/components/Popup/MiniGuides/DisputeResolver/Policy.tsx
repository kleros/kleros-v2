import React from "react";

import PolicySvg from "svgs/mini-guides/dispute-resolver/policy.svg";

import { cn } from "utils/cn";

import { miniGuideImageClassName } from "../PageContentsTemplate";

const StyledPolicySvg = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof PolicySvg>) => (
  <PolicySvg
    {...props}
    className={cn(
      '[&_[class$="rect-1"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="rect-2"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="rect-3"]]:fill-klerosUIComponentsMediumBlue',
      '[&_[class$="rect-3"]]:stroke-klerosUIComponentsPrimaryBlue',
      '[&_[class$="path-1"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-3"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-2"]]:fill-klerosUIComponentsPrimaryBlue',
      '[&_[class$="path-4"]]:fill-klerosUIComponentsPrimaryBlue',
      className
    )}
  />
);

const Policy: React.FC = () => <StyledPolicySvg className={miniGuideImageClassName} />;

export default Policy;
