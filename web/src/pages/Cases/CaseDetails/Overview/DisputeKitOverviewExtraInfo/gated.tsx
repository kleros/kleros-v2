import React, { useState } from "react";

import { useGatedTokenInfo } from "hooks/useGatedTokenInfo";
import { shortenAddress } from "utils/shortenAddress";

import { OverviewExtraInfoProps } from "src/dispute-kits";
import { getAddressExplorerLink } from "src/utils";

import { Divider } from "components/Divider";
import { ExternalLink } from "components/ExternalLink";
import NewTabIcon from "components/StyledIcons/NewTabIcon";
import { StyledSkeleton } from "components/StyledSkeleton";
import WithHelpTooltip from "components/WithHelpTooltip";

const TokenImg: React.FC<{ isERC721: boolean; imageUri: string | null; displayName: string }> = ({
  isERC721,
  imageUri,
  displayName,
}) => {
  const [imgError, setImgError] = useState(false);

  if (isERC721 && imageUri && !imgError) {
    return (
      <div className="w-[120px] h-[120px] min-w-[120px] rounded-[12px] overflow-hidden bg-klerosUIComponentsLightBlue flex items-center justify-center lg:w-[100px] lg:h-[100px] lg:min-w-[100px]">
        <img
          src={imageUri}
          alt={displayName}
          onError={() => setImgError(true)}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>
    );
  } else if (isERC721) {
    return (
      <div className="w-[120px] h-[120px] min-w-[120px] rounded-[12px] overflow-hidden bg-klerosUIComponentsLightBlue flex items-center justify-center lg:w-[100px] lg:h-[100px] lg:min-w-[100px]">
        <span className="text-[32px] text-klerosUIComponentsSecondaryText">🖼️</span>
      </div>
    );
  }
  return null;
};

const GatedOverviewExtraInfo: React.FC<OverviewExtraInfoProps> = ({ disputeId, currentRoundIndex }) => {
  const { isERC721, tokenGateInfo, tokenName, tokenSymbol, imageUri, nftName, isLoading } = useGatedTokenInfo(
    disputeId,
    currentRoundIndex
  );

  const tokenAddress = tokenGateInfo?.tokenGate;
  if (isLoading) {
    return (
      <>
        <Divider />
        <div className="flex flex-col gap-3">
          <span className="w-fit inline-flex items-center gap-1 p-[2px_8px] rounded-[300px] bg-klerosUIComponentsMediumBlue text-klerosUIComponentsPrimaryBlue text-[12px] font-medium">
            Token Gated
          </span>
          <div className="flex flex-col items-center gap-3 p-4 rounded-[12px] border border-solid border-klerosUIComponentsStroke bg-klerosUIComponentsWhiteBackground lg:flex-row lg:gap-[calc(16px_+_(24_-_16)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]">
            <StyledSkeleton className="w-[120px] h-[120px] rounded-[12px]" />
            <div className="flex flex-col gap-1 items-center lg:items-start">
              <StyledSkeleton width={140} />
              <StyledSkeleton width={80} />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!tokenAddress) return null;

  const displayName = nftName || tokenName || "Unknown Token";
  const truncatedAddress = shortenAddress(tokenAddress);

  return (
    <>
      <Divider />
      <div className="flex flex-col gap-3">
        <WithHelpTooltip
          tooltipMsg={`Jurors must hold the required ${isERC721 ? "NFT" : "token"} to be eligible for this case.`}
        >
          <span className="w-fit inline-flex items-center gap-1 p-[2px_8px] rounded-[300px] bg-klerosUIComponentsMediumBlue text-klerosUIComponentsPrimaryBlue text-[12px] font-medium">
            Token Gated
          </span>
        </WithHelpTooltip>
        <div className="flex flex-col items-center gap-3 p-4 rounded-[12px] border border-solid border-klerosUIComponentsStroke bg-klerosUIComponentsWhiteBackground lg:flex-row lg:gap-[calc(16px_+_(24_-_16)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]">
          <TokenImg {...{ imageUri, isERC721, displayName }} />
          <div className="flex flex-col gap-1 items-center lg:items-start">
            <span className="text-[14px] font-semibold text-klerosUIComponentsPrimaryText text-center mb-1 lg:text-[16px]">
              {displayName}
            </span>
            {tokenSymbol ? (
              <span className="text-[14px] text-klerosUIComponentsSecondaryText">${tokenSymbol}</span>
            ) : null}
            {tokenAddress ? (
              <ExternalLink to={getAddressExplorerLink(tokenAddress)} target="_blank" rel="noopener noreferrer">
                {truncatedAddress} <NewTabIcon className="mb-1 [&:hover_path]:fill-klerosUIComponentsSecondaryBlue" />
              </ExternalLink>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default GatedOverviewExtraInfo;
