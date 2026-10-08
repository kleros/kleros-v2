import React from "react";

import InfoCircle from "svgs/icons/info-circle.svg";

import { cn } from "utils/cn";

interface IInfoCard {
  msg: string;
  className?: string;
}

const InfoCard: React.FC<IInfoCard> = ({ msg, className }) => {
  return (
    <div
      className={cn(
        "grid [grid-template-columns:16px_auto]",
        "gap-[calc(6px_+_(8_-_6)_*_(min(max(100vw,_300px),_1250px)_-_300px)_/_(950))] items-center",
        "[justify-items:start] text-start text-klerosUIComponentsSecondaryText",
        className
      )}
    >
      <InfoCircle />
      {msg}
    </div>
  );
};

export default InfoCard;
