import React from "react";
import { useTheme } from "styled-components";
import { StyledImage } from "../Template";
import DarkModeNotificationsImage from "tsx:assets/svgs/mini-guides/staking/notifications-dark-mode.svg";
import LightModeNotificationsImage from "tsx:assets/svgs/mini-guides/staking/notifications-light-mode.svg";

const Notifications: React.FC = () => {
  const theme = useTheme();
  const NotificationsImage = theme.name === "dark" ? DarkModeNotificationsImage : LightModeNotificationsImage;

  return <StyledImage as={NotificationsImage} />;
};

export default Notifications;
