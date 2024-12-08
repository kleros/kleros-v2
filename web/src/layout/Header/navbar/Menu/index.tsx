import React from "react";
import styled, { css } from "styled-components";

import DarkModeIcon from "svgs/menu-icons/dark-mode.svg";
import HelpIcon from "svgs/menu-icons/help.svg";
import LightModeIcon from "svgs/menu-icons/light-mode.svg";
// import NotificationsIcon from "svgs/menu-icons/notifications.svg";
import SettingsIcon from "svgs/menu-icons/settings.svg";

import { useToggleTheme } from "hooks/useToggleThemeContext";

import { landscapeStyle } from "styles/landscapeStyle";

import LightButton from "components/LightButton";

import { IHelp, ISettings } from "../index";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  ${landscapeStyle(
    () => css`
      flex-direction: row;
    `
  )}
`;

const ButtonContainer = styled.div`
  min-height: 32px;
  display: flex;
  align-items: center;

  button {
    padding: 0px;
  }

  .button-text {
    display: block;
  }

  ${landscapeStyle(
    () => css`
      .button-text {
        display: none;
      }
    `
  )}
`;

interface IMenu {
  isMobileNavbar?: boolean;
}

const Menu: React.FC<ISettings & IHelp & IMenu> = ({ toggleIsHelpOpen, toggleIsSettingsOpen, isMobileNavbar }) => {
  const [theme, toggleTheme] = useToggleTheme();
  const isLightTheme = theme === "light";

  const buttons = [
    // { text: "Notifications", Icon: NotificationsIcon },
    {
      text: "Settings",
      Icon: SettingsIcon,
      onClick: () => toggleIsSettingsOpen(),
    },
    {
      text: "Help",
      Icon: HelpIcon,
      onClick: () => {
        toggleIsHelpOpen();
      },
    },
    {
      text: `${isLightTheme ? "Dark" : "Light"} Mode`,
      Icon: isLightTheme ? DarkModeIcon : LightModeIcon,
      onClick: () => toggleTheme(),
    },
  ];

  return (
    <Container>
      {buttons.map(({ text, Icon, onClick }) => (
        <ButtonContainer key={Icon}>
          <LightButton {...{ text, onClick, Icon, isMobileNavbar }} />
        </ButtonContainer>
      ))}
    </Container>
  );
};

export default Menu;
