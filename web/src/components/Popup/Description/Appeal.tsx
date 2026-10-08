import React from "react";

import { useTranslation } from "react-i18next";

import { cn } from "utils/cn";

interface IAppeal {
  amount: string;
  option: string;
}

const Appeal: React.FC<IAppeal> = ({ amount, option }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "flex ml-[calc(8px_+_(44_-_8)_*_(min(max(100vw,_300px),_1250px)_-_300px)_/_(950))]",
          "mr-[calc(8px_+_(44_-_8)_*_(min(max(100vw,_300px),_1250px)_-_300px)_/_(950))]",
          "text-klerosUIComponentsSecondaryText text-center"
        )}
      >
        {t("popups.you_have_funded")} &nbsp;<div className="text-klerosUIComponentsPrimaryText">{amount} ETH</div>
      </div>
      <div
        className={cn(
          "flex mb-[calc(16px_+_(32_-_16)_*_(min(max(100vw,_300px),_1250px)_-_300px)_/_(950))]",
          "ml-[calc(8px_+_(44_-_8)_*_(min(max(100vw,_300px),_1250px)_-_300px)_/_(950))]",
          "mr-[calc(8px_+_(44_-_8)_*_(min(max(100vw,_300px),_1250px)_-_300px)_/_(950))]",
          "text-klerosUIComponentsSecondaryText text-center"
        )}
      >
        {t("popups.option_funded")} &nbsp;<div className="text-klerosUIComponentsPrimaryText">{option}</div>
      </div>
    </div>
  );
};
export default Appeal;
