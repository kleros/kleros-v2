import React, { Dispatch, SetStateAction, useRef, useState } from "react";
import { Tabs } from "@kleros/ui-components-library";
import styled from "styled-components";
import { useFocusOutside } from "hooks/useFocusOutside";
import General from "./General";
import Notifications from "./Notifications";

const tabsItems = [
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

  return (
    <Container ref={containerRef}>
      <StyledSettingsText>Settings</StyledSettingsText>
      <StyledTabs
        currentValue={currentTab}
        items={tabsItems}
        callback={(n: number) => {
          setCurrentTab(n);
        }}
      />
      {currentTab === 0 ? <General /> : <Notifications />}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  position: absolute;
  z-index: 1;
  background-color: ${({ theme }) => theme.whiteBackground};
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.stroke};
  border-radius: 3px;
`;

const StyledSettingsText = styled.div`
  display: flex;
  justify-content: center;
  font-size: 24px;
  color: ${({ theme }) => theme.primaryText};
  margin-top: 24px;
`;

const StyledTabs = styled(Tabs)`
  padding-left: 32px;
  padding-right: 32px;
`;

export default Settings;
