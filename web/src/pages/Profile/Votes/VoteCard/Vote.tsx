import React from "react";

import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";

import VotedIcon from "svgs/icons/voted-ballot.svg";

interface IVote {
  choice: string | null;
}

const Vote: React.FC<IVote> = ({ choice }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-row gap-2 items-center overflow-hidden min-w-0">
      <VotedIcon className="[&_path]:fill-klerosUIComponentsPrimaryBlue" />
      <small className="text-klerosUIComponentsPrimaryBlue -ml-0.5 shrink-0 font-normal">
        {t("voting.vote_label")}:{" "}
      </small>
      {choice === null ? (
        <Skeleton width={80} height={14} />
      ) : (
        <small className="font-normal overflow-hidden [text-overflow:ellipsis] whitespace-nowrap min-w-0">
          {choice}
        </small>
      )}
    </div>
  );
};
export default Vote;
