import React from "react";
import styled from "styled-components";
import { useToggleTheme } from "hooks/useToggleThemeContext";
import LightButton from "components/LightButton";
import NotificationsIcon from "svgs/menu-icons/notifications.svg";
import DarkModeIcon from "svgs/menu-icons/dark-mode.svg";
import LightModeIcon from "svgs/menu-icons/light-mode.svg";
import HelpIcon from "svgs/menu-icons/help.svg";
import SettingsIcon from "svgs/menu-icons/settings.svg";

const Container = styled.div``;

const ButtonContainer = styled.div`
  min-height: 32px;

  display: flex;
  align-items: center;
`;

const Menu: React.FC = () => {
  const [theme, toggleTheme] = useToggleTheme();
  const isLightTheme = theme === "light";
  const buttons = [
    { text: "Notifications", Icon: NotificationsIcon },
    { text: "Settings", Icon: SettingsIcon },
    { text: "Help", Icon: HelpIcon },
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
