import React, { useState } from "react";
import styled from "styled-components";
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

interface IMenu {
  toggleLocked: (val: boolean) => void;
}

const Container = styled.div``;

const ButtonContainer = styled.div`
  min-height: 32px;
  display: flex;
  align-items: center;
`;

const Menu: React.FC<IMenu> = ({ toggleLocked }) => {
  const [theme, toggleTheme] = useToggleTheme();
  const [isHelpOpen, toggle] = useToggle(true);
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
        toggleLocked(true);
        toggle();
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
          {text === "Help" && isHelpOpen && <Help toggle={toggle} toggleLocked={toggleLocked} />}
          {text === "Settings" && isSettingsOpen && <Settings setIsSettingsOpen={setIsSettingsOpen} />}
        </ButtonContainer>
      ))}
    </Container>
  );
};

export default Menu;
