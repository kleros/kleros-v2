import React, { useState } from "react";

import AppealIcon from "svgs/icons/appeal.svg";

import { useSelectedOptionContext } from "hooks/useClassicAppealContext";
import { isUndefined } from "utils/index";

import HowItWorks from "components/HowItWorks";
import Popup, { PopupType } from "components/Popup";
import Appeal from "components/Popup/MiniGuides/Appeal";

import { AppealHeader, StyledTitle } from "..";

import Fund from "./Fund";
import Options from "./Options";

interface IClassic {
  isAppealMiniGuideOpen: boolean;
  toggleAppealMiniGuide: () => void;
}

const Classic: React.FC<IClassic> = ({ isAppealMiniGuideOpen, toggleAppealMiniGuide }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const { selectedOption } = useSelectedOptionContext();

  return (
    <>
      {isPopupOpen && (
        <Popup
          title="Thanks for Funding the Appeal"
          icon={AppealIcon}
          popupType={PopupType.APPEAL}
          setIsOpen={setIsPopupOpen}
          setAmount={setAmount}
          option={!isUndefined(selectedOption) ? selectedOption.title : ""}
          amount={amount}
        />
      )}
      <AppealHeader>
        <StyledTitle>Appeal crowdfunding</StyledTitle>
        <HowItWorks
          isMiniGuideOpen={isAppealMiniGuideOpen}
          toggleMiniGuide={toggleAppealMiniGuide}
          MiniGuideComponent={Appeal}
        />
      </AppealHeader>
      <label> The jury decision is appealed when two options are fully funded. </label>
      <Options setAmount={setAmount} />
      <Fund amount={amount as `${number}`} setAmount={setAmount} setIsOpen={setIsPopupOpen} />
    </>
  );
};

export default Classic;
