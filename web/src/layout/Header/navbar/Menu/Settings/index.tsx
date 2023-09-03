import React, { Dispatch, SetStateAction, useRef, useState } from "react";
import styled, { css } from "styled-components";
import { useLockBodyScroll } from "react-use";
import { smallScreenStyle } from "styles/smallScreenStyle";
import { Tabs } from "@kleros/ui-components-library";
import General from "./General";
import SendMeNotifications from "./SendMeNotifications";
import { useFocusOutside } from "hooks/useFocusOutside";
import { Overlay } from "components/Overlay";

const Container = styled.div`
  display: flex;
  position: absolute;
  flex-direction: column;
  top: 100%;
  transform: translateX(-75%);
  z-index: 1;
  background-color: ${({ theme }) => theme.whiteBackground};
  border: 1px solid ${({ theme }) => theme.stroke};
  border-radius: 3px;
  overflow-y: auto;

  ${smallScreenStyle(
    () => css`
      top: 5%;
      left: 50%;
      transform: translateX(-50%);
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
  setIsSettingsOpen: Dispatch<SetStateAction<boolean>>;
}

const Settings: React.FC<ISettings> = ({ setIsSettingsOpen }) => {
  const [currentTab, setCurrentTab] = useState<number>(0);
  const containerRef = useRef(null);
  useFocusOutside(containerRef, () => setIsSettingsOpen(false));
  useLockBodyScroll(true);

  return (
    <>
      <Overlay />
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
    </>
  );
};

export default Settings;
