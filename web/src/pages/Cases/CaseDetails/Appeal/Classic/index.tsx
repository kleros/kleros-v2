import React, { useState } from "react";
import { ClassicAppealProvider, useOptionsContext, useSelectedOptionContext } from "hooks/useClassicAppealContext";
import Options from "./Options";
import Fund from "./Fund";
import Popup, { PopupType } from "components/Popup";
import AppealIcon from "svgs/icons/appeal.svg";
import { isUndefined } from "utils/index";

const Classic: React.FC = () => {
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
      <h1>Appeal crowdfunding</h1>
      <label> The jury decision is appealed when two options are fully funded. </label>
      <Options />
      <Fund amount={amount} setAmount={setAmount} setIsOpen={setIsPopupOpen} />
    </>
  );
};

const ClassicWrapper: React.FC = () => {
  return (
    <ClassicAppealProvider>
      <Classic />
    </ClassicAppealProvider>
  );
};

export default ClassicWrapper;
