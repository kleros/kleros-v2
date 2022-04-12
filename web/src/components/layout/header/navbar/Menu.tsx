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

const Explore: React.FC = () => {
  const [theme, toggleTheme] = useToggleTheme();
  const isLightTheme = theme === "light";
  const buttons = [
    { text: "Notifications", icon: NotificationsIcon },
    { text: "Settings", icon: SettingsIcon },
    { text: "Help", icon: HelpIcon },
    {
      text: `${isLightTheme ? "Dark" : "Light"} Mode`,
      icon: isLightTheme ? DarkModeIcon : LightModeIcon,
      onClick: () => toggleTheme(),
    },
  ];

  return (
    <Container>
      {buttons.map(({ text, icon: Icon, onClick }) => (
        <ButtonContainer key={text}>
          <LightButton
            {...{ text, onClick }}
            icon={(className: string) => <Icon {...{ className }} />}
          />
        </ButtonContainer>
      ))}
    </Container>
  );
};

export default Explore;
