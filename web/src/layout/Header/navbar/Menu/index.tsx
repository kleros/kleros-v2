import React, { useState } from "react";
import styled, { css } from "styled-components";
import { BREAKPOINT_SMALL_SCREEN, smallScreenStyle } from "styles/smallScreenStyle";
import { useToggle } from "react-use";
import LightButton from "components/LightButton";
import Help from "./Help";
import DarkModeIcon from "svgs/menu-icons/dark-mode.svg";
import HelpIcon from "svgs/menu-icons/help.svg";
import LightModeIcon from "svgs/menu-icons/light-mode.svg";
import NotificationsIcon from "svgs/menu-icons/notifications.svg";
import SettingsIcon from "svgs/menu-icons/settings.svg";
import Settings from "./Settings";
import { useToggleTheme } from "hooks/useToggleThemeContext";
import { useWindowWidth } from "hooks/useWindowWidth";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  ${smallScreenStyle(
    () => css`
      flex-direction: column;
      gap: 0px;
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

  .button-svg {
    fill: ${({ theme }) => theme.white};
  }

  ${smallScreenStyle(
    () => css`
      .button-svg {
        fill: ${({ theme }) => theme.secondaryPurple};
      }
    `
  )}
`;

const getThemeButtonText = (isScreenBig: boolean, isLightTheme: boolean): string => {
  if (isScreenBig) {
    return "";
  }
  return isLightTheme ? "Dark Mode" : "Light Mode";
};

const Menu: React.FC = () => {
  const [theme, toggleTheme] = useToggleTheme();
  const [isHelpOpen, toggleIsHelpOpen] = useToggle(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const windowWidth = useWindowWidth();

  const isLightTheme = theme === "light";
  const isScreenBig = windowWidth > BREAKPOINT_SMALL_SCREEN;

  const buttons = [
    { text: isScreenBig ? "" : "Notifications", Icon: NotificationsIcon },
    {
      text: isScreenBig ? "" : "Settings",
      Icon: SettingsIcon,
      onClick: () => setIsSettingsOpen(true),
    },
    {
      text: isScreenBig ? "" : "Help",
      Icon: HelpIcon,
      onClick: () => {
        toggleIsHelpOpen();
      },
    },
    {
      text: getThemeButtonText(isScreenBig, isLightTheme),
      Icon: isLightTheme ? DarkModeIcon : LightModeIcon,
      onClick: () => toggleTheme(),
    },
  ];

  return (
    <Container>
      {buttons.map(({ text, Icon, onClick }) => (
        <ButtonContainer key={Icon}>
          <LightButton {...{ text, onClick, Icon }} />
        </ButtonContainer>
      ))}
      {isHelpOpen && <Help toggle={toggleIsHelpOpen} />}
      {isSettingsOpen && <Settings setIsSettingsOpen={setIsSettingsOpen} />}
    </Container>
  );
};

export default Menu;
