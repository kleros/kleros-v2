import React from "react";

import { useTranslation } from "react-i18next";

import EnsureAuth from "components/EnsureAuth";
import { EnsureChain } from "components/EnsureChain";
import { ISettings } from "layout/Header/navbar/index";

import FormContactDetails from "./FormContactDetails";

const HeaderNotifs: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="flex justify-center text-[16px] font-semibold text-klerosUIComponentsPrimaryText mt-4 mb-3">
      {t("headers.contact_details")}
    </div>
  );
};

const NotificationSettings: React.FC<ISettings> = ({ toggleIsSettingsOpen }) => {
  return (
    <div className="flex justify-center pt-5 pb-5">
      <EnsureChain>
        <div className="flex flex-col items-center w-full h-full">
          <EnsureAuth>
            <>
              <HeaderNotifs />
              <FormContactDetails toggleIsSettingsOpen={toggleIsSettingsOpen} />
            </>
          </EnsureAuth>
        </div>
      </EnsureChain>
    </div>
  );
};

export default NotificationSettings;
