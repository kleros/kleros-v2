import React from "react";
import styled from "styled-components";
import LightButton from "components/LightButton";
import DarkModeIcon from "svgs/menu-icons/dark-mode.svg";
import HelpIcon from "svgs/menu-icons/help.svg";
import LightModeIcon from "svgs/menu-icons/light-mode.svg";
import NotificationsIcon from "svgs/menu-icons/notifications.svg";
import SettingsIcon from "svgs/menu-icons/settings.svg";
import { useToggleTheme } from "hooks/useToggleThemeContext";

const Container = styled.div``;

const ButtonContainer = styled.div`
  min-height: 32px;
  display: flex;
  align-items: center;
`;

interface IMenu {
  toggleIsSettingsOpen: () => void;
  toggleIsHelpOpen: () => void;
}

const Menu: React.FC<IMenu> = ({ toggleIsHelpOpen, toggleIsSettingsOpen }) => {
  const [theme, toggleTheme] = useToggleTheme();

  const isLightTheme = theme === "light";
  const buttons = [
    { text: "Notifications", Icon: NotificationsIcon },
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
        <ButtonContainer key={text}>
          <LightButton {...{ text, onClick, Icon }} />
        </ButtonContainer>
      ))}
    </Container>
  );
};

export default Menu;
