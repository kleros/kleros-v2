import React from "react";

import { useTranslation } from "react-i18next";

import DarkModeIcon from "svgs/menu-icons/dark-mode.svg";
import HelpIcon from "svgs/menu-icons/help.svg";
import LightModeIcon from "svgs/menu-icons/light-mode.svg";
// import NotificationsIcon from "svgs/menu-icons/notifications.svg";
import SettingsIcon from "svgs/menu-icons/settings.svg";

import { useToggleTheme } from "hooks/useToggleThemeContext";

import LightButton from "components/LightButton";

import { IHelp, ISettings } from "../index";

interface IMenu {
  isMobileNavbar?: boolean;
}

const Menu: React.FC<ISettings & IHelp & IMenu> = ({ toggleIsHelpOpen, toggleIsSettingsOpen, isMobileNavbar }) => {
  const { t } = useTranslation();
  const [theme, toggleTheme] = useToggleTheme();
  const isLightTheme = theme === "light";

  const buttons = [
    // { text: "Notifications", Icon: NotificationsIcon },
    {
      text: t("menu.settings"),
      Icon: SettingsIcon,
      onPress: () => toggleIsSettingsOpen(),
    },
    {
      text: t("menu.help"),
      Icon: HelpIcon,
      onPress: () => {
        toggleIsHelpOpen();
      },
    },
    {
      text: isLightTheme ? t("menu.dark_mode") : t("menu.light_mode"),
      Icon: isLightTheme ? DarkModeIcon : LightModeIcon,
      onPress: () => toggleTheme(),
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row">
      {buttons.map(({ text, Icon, onPress }) => (
        <div
          key={text}
          className="min-h-[32px] flex items-center [&_button]:p-0 [&_.button-text]:block lg:[&_.button-text]:hidden"
        >
          <LightButton {...{ text, onPress, Icon, isMobileNavbar }} />
        </div>
      ))}
    </div>
  );
};

export default Menu;
