import React from "react";

import { useTranslation } from "react-i18next";

import VotesIcon from "svgs/icons/voted-ballot.svg";

interface IVoteCount {
  count: number;
}

const VoteCount: React.FC<IVoteCount> = ({ count }) => {
  const { t } = useTranslation();

  return (
    <div className="flex gap-2 items-center [&_small]:font-normal [&_small]:text-klerosUIComponentsSecondaryPurple [&_svg_path]:fill-klerosUIComponentsSecondaryPurple">
      <VotesIcon />
      <small>{t("voting.vote", { count })}</small>
    </div>
  );
};

export default VoteCount;
