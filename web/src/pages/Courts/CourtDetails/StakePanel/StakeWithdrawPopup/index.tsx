import React from "react";

import { useTranslation } from "react-i18next";

import { AlertMessage, CustomTimeline } from "@kleros/ui-components-library";

import Close from "svgs/icons/close.svg";

import type { CustomTimelineItem } from "src/utils/uiComponentsTypes";

import { Divider } from "components/Divider";
import LightButton from "components/LightButton";
import { Overlay } from "components/Overlay";

import { ActionType } from "../StakeWithdrawButton";

import Header from "./Header";

interface IStakeWithdrawPopup {
  action: ActionType;
  amount: string;
  closePopup: () => void;
  steps?: [CustomTimelineItem, ...CustomTimelineItem[]];
  isSuccess: boolean;
}

const StakeWithdrawPopup: React.FC<IStakeWithdrawPopup> = ({ amount, closePopup, steps, isSuccess, action }) => {
  const { t } = useTranslation();

  return (
    <Overlay onClick={closePopup}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex top-[50%] left-[50%] [transform:translate(-50%,_-50%)] max-h-[80vh] overflow-y-auto relative z-10 flex-col items-center justify-center w-[86vw] max-w-[600px] rounded-[7px] border border-solid border-klerosUIComponentsStroke bg-klerosUIComponentsWhiteBackground [box-shadow:0px_2px_3px_rgba(0,_0,_0,_0.06)] p-2 [animation:stake-popup-enter_200ms_ease-in] [&_svg]:visible lg:overflow-y-hidden lg:w-[calc(300px_+_(600_-_300)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]"
      >
        <LightButton
          Icon={Close}
          text=""
          onPress={closePopup}
          className="absolute top-[8px] right-[8px] border-0! p-1! rounded-[7px]! h-fit! [&_.button-svg]:m-0 [&_.button-svg_path]:fill-klerosUIComponentsStroke"
        />
        <div className="w-full flex flex-col self-center gap-6 p-[16px_24px_24px]">
          <Header {...{ amount, isSuccess, action }} />
          <Divider />
          {steps && <CustomTimeline items={steps} className="[&_h2]:m-0" />}
          {isSuccess && action === ActionType.stake ? (
            <div className="mt-6 [&_h2]:m-0">
              <AlertMessage
                title={t("alerts.hey_avoid_missing_case")}
                msg={t("alerts.subscribe_to_notifications")}
                variant="info"
              />
            </div>
          ) : null}
        </div>
      </div>
    </Overlay>
  );
};

export default StakeWithdrawPopup;
