import React from "react";
import styled from "styled-components";
import NotificationsSvg from "tsx:assets/svgs/mini-guides/staking/notifications.svg";
import { StyledImage } from "../PageContentsTemplate";

const StyledNotificationsSvg = styled(NotificationsSvg)`
  [class$="rect-1"],
  [class$="rect-5"],
  [class$="rect-6"],
  [class$="path-5"] {
    fill: ${({ theme }) => theme.whiteBackground};
  }

  [class$="rect-2"],
  [class$="line-1"],
  [class$="rect-3"],
  [class$="rect-5"],
  [class$="rect-6"] {
    stroke: ${({ theme }) => theme.stroke};
  }

  [class$="rect-4"],
  [class$="rect-7"],
  [class$="path-7"] {
    fill: ${({ theme }) => theme.primaryBlue};
  }

  [class$="line-2"] {
    stroke: ${({ theme }) => theme.primaryBlue};
  }

  [class$="path-1"] {
    fill: ${({ theme }) => theme.secondaryText};
  }

  [class$="path-2"],
  [class$="path-3"],
  [class$="path-4"],
  [class$="path-6"],
  [class$="path-8"],
  [class$="path-9"] {
    fill: ${({ theme }) => theme.primaryText};
  }
`;

const Notifications: React.FC = () => <StyledImage as={StyledNotificationsSvg} />;

export default Notifications;
