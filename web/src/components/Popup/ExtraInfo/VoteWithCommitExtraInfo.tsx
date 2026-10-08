import React from "react";

import { useTranslation } from "react-i18next";

import { cn } from "utils/cn";

import InfoCard from "components/InfoCard";

interface Props {
  automaticVoteReveal?: boolean;
}

const VoteWithCommitExtraInfo: React.FC<Props> = ({ automaticVoteReveal = false }) => {
  const { t } = useTranslation();

  const msg = automaticVoteReveal ? t("popups.enable_notifications_progress") : t("popups.enable_notifications_reveal");
  return (
    <InfoCard
      msg={msg}
      className={cn(
        "m-[calc(8px_+_(24_-_8)_*_(min(max(100vw,_300px),_1250px)_-_300px)_/_(950))_calc(8px_+_(32_-_8)_*_(min(max(100vw,_300px),_1250px)_-_300px)_/_(950))_0]",
        "text-[14px] font-normal leading-[19px]"
      )}
    />
  );
};

export default VoteWithCommitExtraInfo;
