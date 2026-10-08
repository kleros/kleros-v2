import React from "react";

import { useTranslation } from "react-i18next";

import { cn } from "utils/cn";

const StakeWithdrawExtraInfo: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        "flex text-klerosUIComponentsSecondaryText text-center",
        "mt-[calc(8px_+_(24_-_8)_*_(min(max(100vw,_300px),_1250px)_-_300px)_/_(950))]",
        "mr-[calc(8px_+_(44_-_8)_*_(min(max(100vw,_300px),_1250px)_-_300px)_/_(950))]",
        "ml-[calc(8px_+_(44_-_8)_*_(min(max(100vw,_300px),_1250px)_-_300px)_/_(950))]"
      )}
    >
      {t("popups.subscribe_notifications_drawn")}
    </div>
  );
};
export default StakeWithdrawExtraInfo;
