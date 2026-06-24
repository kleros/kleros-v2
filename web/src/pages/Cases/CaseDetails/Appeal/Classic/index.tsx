import React, { useState } from "react";

import { useTranslation } from "react-i18next";

import AppealIcon from "svgs/icons/appeal.svg";

import { useSelectedOptionContext } from "hooks/useClassicAppealContext";
import { isUndefined } from "utils/index";
import type { NumberString } from "utils/types";

import { DisputeKitAppealProps } from "src/dispute-kits";

import HowItWorks from "components/HowItWorks";
import Popup, { PopupType } from "components/Popup";
import Appeal from "components/Popup/MiniGuides/Appeal";

import { AppealHeader, StyledTitle } from "..";

import Fund from "./Fund";
import Options from "./Options";

const Classic: React.FC<DisputeKitAppealProps> = ({ isAppealMiniGuideOpen, toggleAppealMiniGuide, disputeKitId }) => {
  const { t } = useTranslation();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const { selectedOption } = useSelectedOptionContext();

  return (
    <>
      {isPopupOpen && (
        <Popup
          title={t("popups.thanks_for_funding_appeal")}
          icon={AppealIcon}
          popupType={PopupType.APPEAL}
          setIsOpen={setIsPopupOpen}
          setAmount={setAmount}
          option={!isUndefined(selectedOption) ? selectedOption.title : ""}
          amount={amount}
        />
      )}
      <AppealHeader>
        <StyledTitle>{t("appeal.appeal_crowdfunding")}</StyledTitle>
        <HowItWorks
          isMiniGuideOpen={isAppealMiniGuideOpen}
          toggleMiniGuide={toggleAppealMiniGuide}
          MiniGuideComponent={Appeal}
        />
      </AppealHeader>
      <label>{t("appeal.jury_decision_appealed")}</label>
      <Options setAmount={setAmount} />
      <Fund amount={amount as NumberString} setAmount={setAmount} setIsOpen={setIsPopupOpen} {...{ disputeKitId }} />
    </>
  );
};

export default Classic;
