import React from "react";

import NotificationsSvg from "svgs/mini-guides/staking/notifications.svg";

import { cn } from "utils/cn";

import { miniGuideImageClassName } from "../PageContentsTemplate";

const StyledNotificationsSvg = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof NotificationsSvg>) => (
  <NotificationsSvg
    {...props}
    className={cn(
      '[&_[class$="rect-1"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="rect-5"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="rect-6"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="path-5"]]:fill-klerosUIComponentsWhiteBackground',
      '[&_[class$="rect-2"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="line-1"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="rect-3"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="rect-5"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="rect-6"]]:stroke-klerosUIComponentsStroke',
      '[&_[class$="rect-4"]]:fill-klerosUIComponentsPrimaryBlue',
      '[&_[class$="rect-7"]]:fill-klerosUIComponentsPrimaryBlue',
      '[&_[class$="path-7"]]:fill-klerosUIComponentsPrimaryBlue',
      '[&_[class$="line-2"]]:stroke-klerosUIComponentsPrimaryBlue',
      '[&_[class$="path-1"]]:fill-klerosUIComponentsSecondaryText',
      '[&_[class$="path-2"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-3"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-4"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-6"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-8"]]:fill-klerosUIComponentsPrimaryText',
      '[&_[class$="path-9"]]:fill-klerosUIComponentsPrimaryText',
      className
    )}
  />
);

const Notifications: React.FC = () => <StyledNotificationsSvg className={miniGuideImageClassName} />;

export default Notifications;
