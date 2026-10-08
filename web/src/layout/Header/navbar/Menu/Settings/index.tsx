import React, { useMemo, useRef, useState } from "react";

import { useTranslation } from "react-i18next";
import { useClickAway } from "react-use";

import { Tabs } from "@kleros/ui-components-library";

import { cn } from "utils/cn";

import { ISettings } from "../../index";

import General from "./General";
import NotificationSettings from "./Notifications";

const Settings: React.FC<ISettings> = ({ toggleIsSettingsOpen, initialTab }) => {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const [currentTab, setCurrentTab] = useState<number>(initialTab ?? 0);
  useClickAway(containerRef, toggleIsSettingsOpen);

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

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex absolute max-h-[80vh] overflow-y-auto bg-klerosUIComponentsWhiteBackground flex-col top-[5%]",
        "left-[50%] [transform:translateX(-50%)] z-1 border border-solid border-klerosUIComponentsStroke",
        "rounded-[3px] lg:mt-16 lg:top-0 lg:right-0 lg:left-auto lg:[transform:none]"
      )}
    >
      <div className="flex justify-center text-[24px] text-klerosUIComponentsPrimaryText mt-6">
        {t("menu.settings")}
      </div>
      <Tabs
        selectedKey={currentTab}
        items={TABS}
        callback={(_key, value) => setCurrentTab(value)}
        className={
          'tabs-selected-underline w-[86vw] max-w-[660px] [align-self:center] lg:w-[calc(300px_+_(500_-_300)_*_(min(max(100vw,_300px),_1250px)_-_300px)_/_(950))] [&>[role="tablist"]]:p-[0_calc(8px_+_(32_-_8)_*_(min(max(100vw,_300px),_1250px)_-_300px)_/_(950))]'
        }
      />
    </div>
  );
};

export default Settings;
