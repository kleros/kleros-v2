import React, { useState } from "react";
import { useOptionsContext, useSelectedOptionContext } from "hooks/useClassicAppealContext";
import Options from "./Options";
import Fund from "./Fund";
import Popup, { PopupType } from "components/Popup";
import Appeal from "components/Popup/MiniGuides/Appeal";
import HowItWorks from "components/HowItWorks";
import AppealIcon from "svgs/icons/appeal.svg";
import { isUndefined } from "utils/index";
import { AppealHeader, StyledTitle } from "..";

interface IClassic {
  isAppealMiniGuideOpen: boolean;
  toggleAppealMiniGuide: () => void;
}

const Classic: React.FC<IClassic> = ({ isAppealMiniGuideOpen, toggleAppealMiniGuide }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const { selectedOption } = useSelectedOptionContext();
  const options = useOptionsContext();

  return (
    <>
      {isPopupOpen && (
        <Popup
          title="Thanks for Funding the Appeal"
          icon={AppealIcon}
          popupType={PopupType.APPEAL}
          setIsOpen={setIsPopupOpen}
          setAmount={setAmount}
          option={!isUndefined(options) && !isUndefined(selectedOption) ? options[selectedOption] : ""}
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
      <Fund amount={amount} setAmount={setAmount} setIsOpen={setIsPopupOpen} />
    </>
  );
};

export default Classic;
