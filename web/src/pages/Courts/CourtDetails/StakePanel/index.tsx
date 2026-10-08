import React, { useState } from "react";

import { useTranslation } from "react-i18next";

import { cn } from "utils/cn";

import Tag from "components/Tag";

import InputDisplay from "./InputDisplay";
import Simulator from "./Simulator";
import { ActionType } from "./StakeWithdrawButton";

const TagArea = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(function TagArea(
  { className, ...props },
  ref
) {
  return <div {...props} ref={ref} className={cn("flex gap-2.5", className)} />;
});

const StakePanel: React.FC<{ courtName: string | undefined }> = ({ courtName }) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [action, setAction] = useState<ActionType>(ActionType.stake);

  const handleClick = (action: ActionType) => {
    setIsActive(action === ActionType.stake);
    setAction(action);
  };

  const isStaking = action === ActionType.stake;
  return (
    <div className="relative flex flex-col gap-4 lg:gap-6 lg:flex-col">
      <div className="flex flex-col gap-6">
        <TagArea>
          <Tag text={t("buttons.stake")} active={isActive} onClick={() => handleClick(ActionType.stake)} />
          <Tag text={t("buttons.withdraw")} active={!isActive} onClick={() => handleClick(ActionType.withdraw)} />
        </TagArea>
        <div className="text-klerosUIComponentsPrimaryText">
          <strong>{`${isStaking ? t("buttons.stake") : t("buttons.withdraw")} PNK`}</strong>{" "}
          {`${isStaking ? t("staking.to_join_the") : t("staking.from")}`} {courtName}
          {courtName?.toLowerCase().endsWith("court") || courtName?.toLowerCase().startsWith("corte") ? null : " Court"}
        </div>
        <TagArea className="flex-col">
          <InputDisplay {...{ action, amount, setAmount }} />
        </TagArea>
      </div>
      <Simulator amountToStake={amount ? Number(amount) : 0} {...{ isStaking }} />
    </div>
  );
};

export default StakePanel;
