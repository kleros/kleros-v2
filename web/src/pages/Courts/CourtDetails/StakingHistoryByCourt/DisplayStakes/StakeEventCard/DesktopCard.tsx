import React from "react";

import { Hash } from "viem";

import { cn } from "utils/cn";
import { formatDateWithTime } from "utils/date";
import { formatPNK } from "utils/format";
import { getTxnExplorerLink } from "utils/index";

import { InternalLink } from "components/InternalLink";
import JurorLink from "components/JurorLink";

const StyledLabel = React.forwardRef<React.ElementRef<"label">, React.ComponentPropsWithoutRef<"label">>(
  function StyledLabel({ className, ...props }, ref) {
    return (
      <label
        {...props}
        ref={ref}
        className={cn("text-[14px] text-klerosUIComponentsPrimaryText shrink-0", className)}
      />
    );
  }
);

interface IDesktopCard {
  address: string;
  stake: string;
  timestamp: string;
  transactionHash: Hash;
  courtName: string;
  courtId: number;
  currentCourtId?: number;
}

const truncateCourtName = (name: string, maxLength: number = 15): string => {
  if (name.length <= maxLength) return name;
  return name.slice(0, maxLength - 3) + "...";
};

const DesktopCard: React.FC<IDesktopCard> = ({
  address,
  stake,
  timestamp,
  transactionHash,
  courtName,
  courtId,
  currentCourtId,
}) => {
  const isCurrentCourt = currentCourtId === courtId;

  return (
    <div className="[transition:0.1s] hidden w-full min-w-[100%] bg-klerosUIComponentsWhiteBackground border border-solid border-klerosUIComponentsStroke border-t-0 items-center p-[16px_20px] gap-3 lg:flex [&:hover]:[background-color:color-mix(in_srgb,_var(--klerosUIComponentsLightGrey)_73.33333333333333%,_transparent)]">
      <div className="flex-1 min-w-[150px] overflow-hidden">
        <JurorLink address={address} smallDisplay />
      </div>
      <StyledLabel className="w-[80px] text-right">{formatPNK(BigInt(stake))}</StyledLabel>
      <div className="w-[120px] text-right shrink-0">
        {isCurrentCourt ? (
          <span
            title={courtName}
            className="text-[14px] text-klerosUIComponentsPrimaryText overflow-hidden [text-overflow:ellipsis] whitespace-nowrap"
          >
            {truncateCourtName(courtName)}
          </span>
        ) : (
          <InternalLink
            to={`/courts/${courtId}`}
            title={courtName}
            className="text-[14px] text-klerosUIComponentsPrimaryText cursor-pointer no-underline overflow-hidden [text-overflow:ellipsis] whitespace-nowrap [&:hover]:text-klerosUIComponentsPrimaryBlue"
          >
            {truncateCourtName(courtName)}
          </InternalLink>
        )}
      </div>
      <div className="w-[120px] text-right shrink-0">
        <a
          href={getTxnExplorerLink(transactionHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[14px] text-klerosUIComponentsPrimaryText cursor-pointer no-underline [&:hover]:underline"
        >
          {formatDateWithTime(timestamp)}
        </a>
      </div>
    </div>
  );
};

export default DesktopCard;
