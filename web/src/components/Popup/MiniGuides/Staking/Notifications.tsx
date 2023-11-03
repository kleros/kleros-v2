import React from "react";
import DarkModeNotificationsImage from "tsx:assets/svgs/mini-guides/staking/notifications-dark-mode.svg";
import LightModeNotificationsImage from "tsx:assets/svgs/mini-guides/staking/notifications-light-mode.svg";
import ImageRenderer from "../ImageRenderer";

const Notifications: React.FC = () => (
  <ImageRenderer darkModeImage={DarkModeNotificationsImage} lightModeImage={LightModeNotificationsImage} />
);

export default Notifications;
