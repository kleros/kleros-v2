import React from "react";

import { useTranslation } from "react-i18next";
import { Hash } from "viem";

import { Card as _Card } from "@kleros/ui-components-library";

import { cn } from "utils/cn";
import { formatDate } from "utils/date";
import { getTxnExplorerLink } from "utils/index";

import { StyledArrowLink } from "components/StyledArrowLink";
import NewTabIcon from "components/StyledIcons/NewTabIcon";

import CourtName from "./CourtName";
import Stake from "./Stake";

interface ICourtCard {
  name: string;
  stake: bigint;
  id: string;
  timestamp?: number;
  transactionHash?: Hash;
  isCurrentStakeCard?: boolean;
}

const CourtCard: React.FC<ICourtCard> = ({
  name,
  stake,
  id,
  timestamp,
  transactionHash,
  isCurrentStakeCard = true,
}) => {
  const { i18n } = useTranslation();

  return (
    <_Card
      hover
      className={cn(
        "flex flex-col h-auto w-full pt-5 px-4 pb-6 border-l-[5px] gap-4 hover:cursor-auto not-dark:shadow-[0px_2px_3px_0px_var(--klerosUIComponentsStroke)] lg:grid lg:grid-cols-[160px_120px_auto] lg:items-center lg:py-[21.5px] lg:px-7 lg:gap-5",
        isCurrentStakeCard ? "border-l-klerosUIComponentsSecondaryPurple" : "border-l-klerosUIComponentsSecondaryText"
      )}
    >
      <CourtName {...{ name, id }} />
      <Stake {...{ stake }} />
      <div className="flex flex-row items-center gap-2 lg:justify-end">
        {timestamp ? <label>{formatDate(timestamp, false, i18n.language)}</label> : null}
        {transactionHash ? (
          <StyledArrowLink
            to={getTxnExplorerLink(transactionHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit [&&_>_svg]:h-[14px] [&&_>_svg]:w-[14px]"
          >
            <NewTabIcon />
          </StyledArrowLink>
        ) : null}
      </div>
    </_Card>
  );
};

export default CourtCard;
