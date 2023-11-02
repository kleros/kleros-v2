import React from "react";
import styled, { useTheme, css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import DarkModeNotificationsImage from "tsx:assets/svgs/mini-guides/staking/notifications-dark-mode.svg";
import LightModeNotificationsImage from "tsx:assets/svgs/mini-guides/staking/notifications-light-mode.svg";

const StyledNotificationsImage = styled.div`
  width: calc(260px + (340 - 260) * (min(max(100vw, 375px), 1250px) - 375px) / 875);

  ${landscapeStyle(
    () => css`
      width: 389px;
    `
  )}
`;

const Notifications: React.FC = () => {
  const theme = useTheme();
  const NotificationsImage = theme.name === "dark" ? DarkModeNotificationsImage : LightModeNotificationsImage;

  return <StyledNotificationsImage as={NotificationsImage} />;
};

export default Notifications;
