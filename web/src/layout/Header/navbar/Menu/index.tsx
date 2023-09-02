import React, { useState } from "react";
import styled, { css } from "styled-components";
import { smallScreenStyle } from "styles/smallScreenStyle";
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

  .button-text {
    display: none;
  }

  .button-svg {
    fill: ${({ theme }) => theme.white};
  }

  ${smallScreenStyle(
    () => css`
      .button-svg {
        fill: ${({ theme }) => theme.secondaryPurple};
      }
      .button-text {
        display: block;
      }
    `
  )}
`;

const Menu: React.FC = () => {
  const [theme, toggleTheme] = useToggleTheme();
  const [isHelpOpen, toggleIsHelpOpen] = useToggle(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isLightTheme = theme === "light";

  const buttons = [
    { text: "Notifications", Icon: NotificationsIcon },
    {
      text: "Settings",
      Icon: SettingsIcon,
      onClick: () => setIsSettingsOpen(true),
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
          <LightButton {...{ text, onClick, Icon }} />
        </ButtonContainer>
      ))}
      {isHelpOpen && <Help toggle={toggleIsHelpOpen} />}
      {isSettingsOpen && <Settings setIsSettingsOpen={setIsSettingsOpen} />}
    </Container>
  );
};

export default Menu;
