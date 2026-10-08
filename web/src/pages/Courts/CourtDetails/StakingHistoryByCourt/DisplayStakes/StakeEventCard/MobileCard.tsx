import React from "react";

import { useTranslation } from "react-i18next";
import { Hash } from "viem";

import { formatDateWithTime } from "utils/date";
import { formatPNK } from "utils/format";
import { getTxnExplorerLink } from "utils/index";

import { InternalLink } from "components/InternalLink";
import JurorLink from "components/JurorLink";

interface IMobileCard {
  address: string;
  stake: string;
  timestamp: string;
  transactionHash: Hash;
  courtName: string;
  courtId: number;
  currentCourtId?: number;
}

const MobileCard: React.FC<IMobileCard> = ({
  address,
  stake,
  timestamp,
  transactionHash,
  courtName,
  courtId,
  currentCourtId,
}) => {
  const { t } = useTranslation();
  const isCurrentCourt = currentCourtId === courtId;

  return (
    <div className="[transition:0.1s] flex flex-col w-full bg-klerosUIComponentsWhiteBackground border border-solid border-klerosUIComponentsStroke border-t-0 p-[12px_16px] gap-3 lg:hidden [&:hover]:[background-color:color-mix(in_srgb,_var(--klerosUIComponentsLightGrey)_73.33333333333333%,_transparent)]">
      <JurorLink address={address} />
      <div className="flex justify-between items-center gap-2">
        <span className="text-[12px] text-klerosUIComponentsSecondaryText font-normal">{t("misc.pnk_staked")}</span>
        <span className="text-[14px] text-klerosUIComponentsPrimaryText font-normal text-right">
          {formatPNK(BigInt(stake))}
        </span>
      </div>
      <div className="flex justify-between items-center gap-2">
        <span className="text-[12px] text-klerosUIComponentsSecondaryText font-normal">{t("profile.court")}</span>
        {isCurrentCourt ? (
          <span
            title={courtName}
            className="text-[14px] text-klerosUIComponentsPrimaryText overflow-hidden [text-overflow:ellipsis] whitespace-nowrap max-w-[200px] text-right"
          >
            {courtName}
          </span>
        ) : (
          <InternalLink
            to={`/courts/${courtId}`}
            title={courtName}
            className="text-[14px] text-klerosUIComponentsPrimaryText cursor-pointer no-underline overflow-hidden [text-overflow:ellipsis] whitespace-nowrap max-w-[200px] text-right"
          >
            {courtName}
          </InternalLink>
        )}
      </div>
      <div className="flex justify-between items-center gap-2">
        <span className="text-[12px] text-klerosUIComponentsSecondaryText font-normal">{t("profile.date")}</span>
        <a
          href={getTxnExplorerLink(transactionHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[14px] text-klerosUIComponentsPrimaryText cursor-pointer no-underline text-right [&:hover]:underline"
        >
          {formatDateWithTime(timestamp)}
        </a>
      </div>
    </div>
  );
};

export default MobileCard;
