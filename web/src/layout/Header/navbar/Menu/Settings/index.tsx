import React, { useMemo, useRef, useState } from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
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
      width: ${responsiveSize(300, 500, 300)};
    `
  )}
`;

const Settings: React.FC<ISettings> = ({ toggleIsSettingsOpen, initialTab }) => {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const [currentTab, setCurrentTab] = useState<number>(initialTab ?? 0);
  const [searchParams, setSearchParams] = useSearchParams();
  useClickAway(containerRef, () => {
    toggleIsSettingsOpen();
    if (searchParams.get("notifications") === "true") {
      const next = new URLSearchParams(searchParams);
      next.delete("notifications");
      setSearchParams(next, { replace: true });
    }
  });

  const TABS = useMemo(
    () => [
      { id: 0, text: t("menu.general"), value: 0, content: <General {...{ toggleIsSettingsOpen }} /> },
      {
        id: 1,
        text: t("menu.notifications"),
        value: 1,
        content: <NotificationSettings {...{ toggleIsSettingsOpen }} />,
      },
    ],
    [t, toggleIsSettingsOpen]
  );

  // Pass both: `selectedKey` controls react-aria Tabs (panel selection),
  // `defaultSelectedKey` primes the library wrapper's internal underline state.
  return (
    <Container ref={containerRef}>
      <StyledSettingsText>{t("menu.settings")}</StyledSettingsText>
      <StyledTabs
        selectedKey={currentTab}
        defaultSelectedKey={initialTab ?? 0}
        items={TABS}
        callback={(_key, value) => setCurrentTab(value)}
      />
    </Container>
  );
};

export default Settings;
