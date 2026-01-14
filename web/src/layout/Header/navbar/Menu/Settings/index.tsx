import React, { useRef, useState } from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useClickAway } from "react-use";

import { Tabs } from "@kleros/ui-components-library";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import { ISettings } from "../../index";

import General from "./General";
import NotificationSettings from "./Notifications";

const Container = styled.div`
  display: flex;
  position: absolute;
  max-height: 80vh;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.whiteBackground};
  flex-direction: column;
  top: 5%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
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
  padding: 0 ${responsiveSize(8, 32, 300)};
  width: 86vw;
  max-width: 660px;
  align-self: center;
  ${landscapeStyle(
    () => css`
      width: ${responsiveSize(300, 424, 300)};
    `
  )}
`;

const Settings: React.FC<ISettings> = ({ toggleIsSettingsOpen, initialTab }) => {
  const { t } = useTranslation();
  const [currentTab, setCurrentTab] = useState<number>(initialTab || 0);
  const containerRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  useClickAway(containerRef, () => {
    toggleIsSettingsOpen();
    if (location.hash.includes("#notifications")) navigate("#", { replace: true });
  });

  const TABS = [
    {
      text: t("menu.general"),
      value: 0,
    },
    {
      text: t("menu.notifications"),
      value: 1,
    },
  ];

  return (
    <Container ref={containerRef}>
      <StyledSettingsText>{t("menu.settings")}</StyledSettingsText>
      <StyledTabs
        currentValue={currentTab}
        items={TABS}
        callback={(n: number) => {
          setCurrentTab(n);
        }}
      />
      {currentTab === 0 ? (
        <General {...{ toggleIsSettingsOpen }} />
      ) : (
        <NotificationSettings {...{ toggleIsSettingsOpen }} />
      )}
    </Container>
  );
};

export default Settings;
