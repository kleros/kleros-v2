import React, { useRef } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Button } from "@kleros/ui-components-library";

import CloseIcon from "svgs/icons/close.svg";

import { cn } from "utils/cn";

import { Overlay } from "components/Overlay";

import Appeal from "./Description/Appeal";
import DisputeCreated from "./Description/DisputeCreated";
import StakeWithdraw from "./Description/StakeWithdraw";
import SwapSuccess from "./Description/SwapSuccess";
import VoteWithCommit from "./Description/VoteWithCommit";
import VoteWithoutCommit from "./Description/VoteWithoutCommit";
import DisputeCreatedExtraInfo from "./ExtraInfo/DisputeCreatedExtraInfo";
import StakeWithdrawExtraInfo from "./ExtraInfo/StakeWithdrawExtraInfo";
import VoteWithCommitExtraInfo from "./ExtraInfo/VoteWithCommitExtraInfo";

export const VoteDescriptionEmphasizedDate = React.forwardRef<
  React.ElementRef<"span">,
  React.ComponentPropsWithoutRef<"span">
>(function VoteDescriptionEmphasizedDate({ className, ...props }, ref) {
  return (
    <span
      {...props}
      ref={ref}
      className={cn("text-[16px] font-normal leading-[21.8px] text-klerosUIComponentsPrimaryText", className)}
    />
  );
});

export enum PopupType {
  STAKE_WITHDRAW = "STAKE_WITHDRAW",
  APPEAL = "APPEAL",
  VOTE_WITHOUT_COMMIT = "VOTE_WITHOUT_COMMIT",
  VOTE_WITH_COMMIT = "VOTE_WITH_COMMIT",
  DISPUTE_CREATED = "DISPUTE_CREATED",
  SWAP_SUCCESS = "SWAP_SUCCESS",
}

interface IStakeWithdraw {
  popupType: PopupType.STAKE_WITHDRAW;
  pnkStaked: string;
  courtName: string;
  isStake: boolean;
  courtId: string;
}

interface IVoteWithoutCommit {
  popupType: PopupType.VOTE_WITHOUT_COMMIT;
  date: string;
}

interface IVoteWithCommit {
  popupType: PopupType.VOTE_WITH_COMMIT;
  date: string;
}

interface IAppeal {
  popupType: PopupType.APPEAL;
  amount: string;
  option: string;
}
interface IDisputeCreated {
  popupType: PopupType.DISPUTE_CREATED;
  disputeId: number;
  courtId: string;
}

interface ISwapSuccess {
  popupType: PopupType.SWAP_SUCCESS;
  hash: string;
  amount: string;
  isClaim?: boolean;
}
interface IPopup {
  title: string;
  icon?: React.FC<React.SVGAttributes<SVGElement>>;
  popupType: PopupType;
  setIsOpen: (val: boolean) => void;
  setAmount?: (val: string) => void;
  isCommit?: boolean;
  automaticVoteReveal?: boolean;
}

type PopupProps = IStakeWithdraw | IVoteWithoutCommit | IVoteWithCommit | IAppeal | IDisputeCreated | ISwapSuccess;

const Popup: React.FC<PopupProps & IPopup> = ({
  title,
  icon: Icon,
  popupType,
  setIsOpen,
  setAmount,
  automaticVoteReveal,
  ...props
}) => {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const resetValue = () => {
    if (setAmount) {
      setAmount("");
    }
  };

  let PopupComponent: JSX.Element | null = null;

  switch (popupType) {
    case PopupType.STAKE_WITHDRAW: {
      const { pnkStaked, courtName, isStake, courtId } = props as IStakeWithdraw;
      PopupComponent = (
        <StakeWithdraw pnkStaked={pnkStaked} courtName={courtName} isStake={isStake} courtId={courtId} />
      );
      break;
    }
    case PopupType.VOTE_WITHOUT_COMMIT: {
      const { date } = props as IVoteWithoutCommit;
      PopupComponent = (
        <div
          className={cn(
            "flex flex-col mb-[calc(16px_+_(32_-_16)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]",
            "ml-[calc(8px_+_(32_-_8)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]",
            "mr-[calc(8px_+_(32_-_8)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]",
            "text-klerosUIComponentsSecondaryText text-center leading-[21.8px]"
          )}
        >
          <VoteWithoutCommit date={date} />
        </div>
      );
      break;
    }
    case PopupType.VOTE_WITH_COMMIT: {
      const { date } = props as IVoteWithCommit;
      PopupComponent = (
        <div
          className={cn(
            "flex flex-col mb-[calc(16px_+_(32_-_16)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]",
            "ml-[calc(8px_+_(32_-_8)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]",
            "mr-[calc(8px_+_(32_-_8)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]",
            "text-klerosUIComponentsSecondaryText text-center leading-[21.8px]"
          )}
        >
          <VoteWithCommit {...{ date, automaticVoteReveal }} />
        </div>
      );
      break;
    }
    case PopupType.APPEAL: {
      const { amount, option } = props as IAppeal;
      PopupComponent = <Appeal amount={amount} option={option} />;
      break;
    }
    case PopupType.DISPUTE_CREATED: {
      const { courtId } = props as IDisputeCreated;
      PopupComponent = <DisputeCreated courtId={courtId} />;
      break;
    }
    case PopupType.SWAP_SUCCESS: {
      PopupComponent = <SwapSuccess {...(props as ISwapSuccess)} />;
      break;
    }
    default:
      break;
  }

  const closePopup = () => {
    setIsOpen(false);
    resetValue();
    // dispute data is cleared, so if popup is closed the preview will show empty,
    // instead redirect to start point.
    if (popupType === PopupType.DISPUTE_CREATED) navigate("/resolver");
  };

  return (
    <Overlay onClick={closePopup}>
      <div
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "flex fixed top-[50%] left-[50%] [transform:translate(-50%,_-50%)] max-h-[80vh] overflow-y-auto z-10",
          "flex-col items-center justify-center w-[86vw] max-w-[600px] rounded-[3px]",
          "border border-solid border-klerosUIComponentsStroke bg-klerosUIComponentsWhiteBackground",
          "[box-shadow:0px_2px_3px_rgba(0,_0,_0,_0.06)] [&_svg]:visible lg:overflow-y-hidden",
          "lg:w-[calc(300px_+_(600_-_300)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]"
        )}
      >
        {popupType === PopupType.SWAP_SUCCESS && (
          <div
            className={cn(
              "flex justify-end items-center w-full cursor-pointer absolute top-[18px] right-[24px] [&_svg]:w-[18px]",
              "[&_svg]:h-[18px] [&_svg]:fill-klerosUIComponentsStroke"
            )}
          >
            <CloseIcon onClick={() => setIsOpen(false)} />
          </div>
        )}
        <h1
          className={cn(
            "flex",
            "m-[calc(12px_+_(32_-_12)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))_calc(8px_+_(12_-_8)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))_calc(12px_+_(24_-_12)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]",
            "text-center text-[24px] font-semibold leading-[32.68px]"
          )}
        >
          {title}
        </h1>
        {PopupComponent}
        {Icon && (
          <div
            className={cn(
              "w-[calc(150px_+_(228_-_150)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] flex items-center",
              "justify-center [&_svg]:inline-block",
              "[&_svg]:w-[calc(150px_+_(228_-_150)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]",
              "[&_svg]:h-[calc(150px_+_(228_-_150)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]"
            )}
          >
            <Icon />
          </div>
        )}
        {popupType === PopupType.STAKE_WITHDRAW && <StakeWithdrawExtraInfo />}
        {popupType === PopupType.VOTE_WITH_COMMIT && <VoteWithCommitExtraInfo {...{ automaticVoteReveal }} />}
        {popupType === PopupType.DISPUTE_CREATED && <DisputeCreatedExtraInfo />}
        {popupType !== PopupType.SWAP_SUCCESS && (
          <Button
            variant="secondary"
            text={popupType === PopupType.DISPUTE_CREATED ? t("popups.check_the_case") : t("buttons.close")}
            onPress={() => {
              closePopup();
              if (popupType === PopupType.DISPUTE_CREATED) {
                const { disputeId } = props as IDisputeCreated;
                navigate(`/cases/${disputeId}`);
              }
            }}
            className="m-[calc(16px_+_(32_-_16)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]"
          />
        )}
      </div>
    </Overlay>
  );
};
export default Popup;
