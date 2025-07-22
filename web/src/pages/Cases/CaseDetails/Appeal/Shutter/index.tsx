import React, { useState } from "react";

import AppealIcon from "svgs/icons/appeal.svg";

import { useSelectedOptionContext } from "hooks/useClassicAppealContext";

import HowItWorks from "components/HowItWorks";
import Popup, { PopupType } from "components/Popup";
import Appeal from "components/Popup/MiniGuides/Appeal";

import { AppealHeader, StyledTitle } from "..";
import Options from "../Classic/Options";

import Fund from "./Fund";

interface IShutter {
  isAppealMiniGuideOpen: boolean;
  toggleAppealMiniGuide: () => void;
  isGated: boolean;
}

const Shutter: React.FC<IShutter> = ({ isAppealMiniGuideOpen, toggleAppealMiniGuide, isGated }) => {
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
          option={selectedOption?.title ?? ""}
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
      <label>The jury decision is appealed when two options are fully funded.</label>
      <Options setAmount={setAmount} />
      <Fund amount={amount as `${number}`} setAmount={setAmount} setIsOpen={setIsPopupOpen} {...{ isGated }} />
    </>
  );
};

export default Shutter;
