import React, { useState } from "react";
import styled, { css } from "styled-components";

import NewTabIcon from "svgs/icons/new-tab.svg";

import { useGatedTokenInfo } from "hooks/useGatedTokenInfo";
import { shortenAddress } from "utils/shortenAddress";

import { OverviewExtraInfoProps } from "src/dispute-kits";
import { getAddressExplorerLink } from "src/utils";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import { Divider } from "components/Divider";
import { ExternalLink } from "components/ExternalLink";
import { StyledSkeleton } from "components/StyledSkeleton";
import WithHelpTooltip from "components/WithHelpTooltip";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Badge = styled.span`
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 300px;
  background-color: ${({ theme }) => theme.mediumBlue};
  color: ${({ theme }) => theme.primaryBlue};
  font-size: 12px;
  font-weight: 500;
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.stroke};
  background-color: ${({ theme }) => theme.whiteBackground};

  ${landscapeStyle(
    () => css`
      flex-direction: row;
      gap: ${responsiveSize(16, 24)};
    `
  )}
`;

const ImageContainer = styled.div`
  width: 120px;
  height: 120px;
  min-width: 120px;
  border-radius: 12px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.lightBlue};
  display: flex;
  align-items: center;
  justify-content: center;

  ${landscapeStyle(
    () => css`
      width: 100px;
      height: 100px;
      min-width: 100px;
    `
  )}
`;

const NFTImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PlaceholderText = styled.span`
  font-size: 32px;
  color: ${({ theme }) => theme.secondaryText};
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;

  ${landscapeStyle(
    () => css`
      align-items: flex-start;
    `
  )}
`;

const TokenName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.primaryText};
  text-align: center;
  margin-bottom: 4px;

  ${landscapeStyle(
    () => css`
      font-size: 16px;
    `
  )}
`;

const TokenSymbolLabel = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.secondaryText};
`;

const StyledNewTabIcon = styled(NewTabIcon)`
  margin-bottom: 4px;
  path {
    fill: ${({ theme }) => theme.primaryBlue};
  }
  :hover {
    path {
      fill: ${({ theme }) => theme.secondaryBlue};
    }
  }
`;

const SkeletonImage = styled(StyledSkeleton)`
  width: 120px;
  height: 120px;
  border-radius: 12px;
`;

const TokenImg: React.FC<{ isERC721: boolean; imageUri: string | null; displayName: string }> = ({
  isERC721,
  imageUri,
  displayName,
}) => {
  const [imgError, setImgError] = useState(false);

  if (isERC721 && imageUri && !imgError) {
    return (
      <ImageContainer>
        <NFTImage src={imageUri} alt={displayName} onError={() => setImgError(true)} loading="lazy" />
      </ImageContainer>
    );
  } else if (isERC721) {
    return (
      <ImageContainer>
        <PlaceholderText>🖼️</PlaceholderText>
      </ImageContainer>
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
        <Wrapper>
          <Badge>Token Gated</Badge>
          <CardContainer>
            <SkeletonImage />
            <InfoSection>
              <StyledSkeleton width={140} />
              <StyledSkeleton width={80} />
            </InfoSection>
          </CardContainer>
        </Wrapper>
      </>
    );
  }

  if (!tokenAddress) return null;

  const displayName = nftName || tokenName || "Unknown Token";
  const truncatedAddress = shortenAddress(tokenAddress);

  return (
    <>
      <Divider />
      <Wrapper>
        <WithHelpTooltip
          tooltipMsg={`Jurors must hold the required ${isERC721 ? "NFT" : "token"} to be eligible for this case.`}
        >
          <Badge>Token Gated</Badge>
        </WithHelpTooltip>
        <CardContainer>
          <TokenImg {...{ imageUri, isERC721, displayName }} />
          <InfoSection>
            <TokenName>{displayName}</TokenName>
            {tokenSymbol ? <TokenSymbolLabel>${tokenSymbol}</TokenSymbolLabel> : null}
            {tokenAddress ? (
              <ExternalLink to={getAddressExplorerLink(tokenAddress)} target="_blank" rel="noopener noreferrer">
                {truncatedAddress} <StyledNewTabIcon />
              </ExternalLink>
            ) : null}
          </InfoSection>
        </CardContainer>
      </Wrapper>
    </>
  );
};

export default GatedOverviewExtraInfo;
