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

const Container = styled.div``;

const ButtonContainer = styled.div`
  min-height: 32px;
  display: flex;
  align-items: center;
`;

const Menu: React.FC = () => {
  const [theme, toggleTheme] = useToggleTheme();
  const [isHelpOpen, toggleIsHelpOpen] = useToggle(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<number>(0);

  const isLightTheme = theme === "light";
  const buttons = [
    {
      text: "Notifications",
      Icon: NotificationsIcon,
      onClick: () => {
        setIsSettingsOpen(true);
        setCurrentTab(1);
      },
    },
    {
      text: "Settings",
      Icon: SettingsIcon,
      onClick: () => {
        setIsSettingsOpen(true);
        setCurrentTab(0);
      },
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
      {isHelpOpen && <Help toggle={toggleIsHelpOpen} />}
      {isSettingsOpen && (
        <Settings setIsSettingsOpen={setIsSettingsOpen} currentTab={currentTab} setCurrentTab={setCurrentTab} />
      )}
    </Container>
  );
};

export default Menu;
