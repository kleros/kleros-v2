import React, { useRef, useState } from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { Tabs } from "@kleros/ui-components-library";
import General from "./General";
import SendMeNotifications from "./SendMeNotifications";
import { useFocusOutside } from "hooks/useFocusOutside";

const Container = styled.div`
  display: flex;
  position: absolute;
  max-height: 80vh;
  overflow-y: auto;
  z-index: 1;
  background-color: ${({ theme }) => theme.whiteBackground};
  flex-direction: column;
  top: 5%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  background-color: ${({ theme }) => theme.whiteBackground};
  border: 1px solid ${({ theme }) => theme.stroke};
  border-radius: 3px;
  overflow-y: auto;

  ${landscapeStyle(
    () => css`
      margin-top: 64px;
      top: 0;
      right: 0;
      left: auto;
      transform: none;
    `
  )}
`;

const StyledSettingsText = styled.div`
  display: flex;
  justify-content: center;
  font-size: 24px;
  color: ${({ theme }) => theme.primaryText};
  margin-top: 24px;
`;

const StyledTabs = styled(Tabs)`
  padding: 0 calc(8px + (32 - 8) * ((100vw - 300px) / (1250 - 300)));
  width: calc(300px + (424 - 300) * ((100vw - 300px) / (1250 - 300)));
`;

const TABS = [
  {
    text: "General",
    value: 0,
  },
  {
    text: "Notifications",
    value: 1,
  },
];

interface ISettings {
  toggleIsSettingsOpen: () => void;
}

const Settings: React.FC<ISettings> = ({ toggleIsSettingsOpen }) => {
  const [currentTab, setCurrentTab] = useState<number>(0);
  const containerRef = useRef(null);
  useFocusOutside(containerRef, () => toggleIsSettingsOpen());

  return (
    <Container ref={containerRef}>
      <StyledSettingsText>Settings</StyledSettingsText>
      <StyledTabs
        currentValue={currentTab}
        items={TABS}
        callback={(n: number) => {
          setCurrentTab(n);
        }}
      />
      {currentTab === 0 ? <General /> : <SendMeNotifications />}
    </Container>
  );
};

export default Settings;
