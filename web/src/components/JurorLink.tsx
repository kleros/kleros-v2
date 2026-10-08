import React, { useMemo } from "react";

import { Address } from "viem";

import ArrowIcon from "svgs/icons/arrow.svg";

import { DEFAULT_CHAIN } from "consts/chains";
import { cn } from "utils/cn";

import { AddressOrName, IdenticonOrAvatar } from "components/ConnectWallet/AccountDisplay";
import { StyledArrowLink } from "components/StyledArrowLink";
import NewTabIcon from "components/StyledIcons/NewTabIcon";

export const ReStyledArrowLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<typeof StyledArrowLink> & { smallDisplay?: boolean }
>(({ smallDisplay, className, ...props }, ref) => (
  <StyledArrowLink
    ref={ref}
    {...props}
    className={cn(
      "[&_label]:cursor-pointer [&_label]:text-klerosUIComponentsPrimaryBlue",
      "hover:[&_label]:text-klerosUIComponentsSecondaryBlue",
      smallDisplay && "[&>svg]:size-[14.5px]",
      className
    )}
  />
));
ReStyledArrowLink.displayName = "ReStyledArrowLink";

interface IJurorLink {
  address: string;
  isInternalLink?: boolean;
  smallDisplay?: boolean;
}

const JurorLink: React.FC<IJurorLink> = ({ address, isInternalLink = true, smallDisplay }) => {
  const profileLink = `/profile/stakes/1?address=${address}`;
  const addressExplorerLink = useMemo(() => {
    return `${DEFAULT_CHAIN?.blockExplorers?.default.url}/address/${address}`;
  }, [address]);

  return (
    <div className="flex items-center gap-2 [&_label]:text-[16px] [&_canvas]:size-5 [&_canvas]:rounded-[10%]">
      <IdenticonOrAvatar address={address as Address} />
      <ReStyledArrowLink
        {...{ smallDisplay }}
        to={isInternalLink ? profileLink : addressExplorerLink}
        rel={`${isInternalLink ? "" : "noopener noreferrer"}`}
        target={`${isInternalLink ? "" : "_blank"}`}
      >
        <AddressOrName address={address as Address} smallDisplay={smallDisplay} />
        {isInternalLink ? <ArrowIcon /> : <NewTabIcon />}
      </ReStyledArrowLink>
    </div>
  );
};

export default JurorLink;
