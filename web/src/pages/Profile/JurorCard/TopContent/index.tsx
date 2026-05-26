import React from "react";
import styled, { css } from "styled-components";

import { /* FollowButton, FollowerTag, */ ProfileSocials, useProfileDetails } from "ethereum-identity-kit";
import { useTranslation } from "react-i18next";
// import { useAccount } from "wagmi";
import { Address } from "viem";

import ScoutIcon from "svgs/icons/scout.svg";

import { landscapeStyle } from "styles/landscapeStyle";

import JurorLink from "components/JurorLink";

const getScoutProfileUrl = (address: string) => `https://scout-app.kleros.io/#/profile/pending?address=${address}`;

const HIDE_ALL_EXCEPT_TWITTER = [
  "etherscan",
  "ens",
  "grails",
  "opensea",
  "vision",
  "com.github",
  "org.telegram",
  "com.discord",
  "email",
] as const;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px 16px;
  flex-wrap: wrap;

  ${landscapeStyle(
    () => css`
      flex-direction: row;
      align-items: center;
    `
  )}
`;

const LeftGroup = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px 16px;
  flex-wrap: wrap;
`;

const StyledLabel = styled.label`
  font-size: 14px;
`;

const KlerosAppsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;

  ${landscapeStyle(
    () => css`
      margin-left: auto;
    `
  )}
`;

const KlerosAppLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    opacity 0.2s ease,
    scale 0.2s ease;

  &:hover {
    opacity: 0.8;
    scale: 1.1;
  }

  svg {
    width: 28px;
    height: 28px;
    color: ${({ theme }) => theme.primaryText};
  }
`;

interface ITopContent {
  address: Address;
  totalResolvedDisputes: number;
}

const TopContent: React.FC<ITopContent> = ({ address, totalResolvedDisputes }) => {
  const { t } = useTranslation();
  // const { address: connectedAddress } = useAccount();
  const { ens } = useProfileDetails({ addressOrName: address });
  // const isOwnProfile = connectedAddress?.toLowerCase() === address.toLowerCase();

  return (
    <Container>
      <LeftGroup>
        <JurorLink {...{ address }} isInternalLink={false} />
        {totalResolvedDisputes > 0 ? (
          <StyledLabel>{t("profile.juror_in_cases", { count: totalResolvedDisputes })}</StyledLabel>
        ) : null}
        {/* TODO: Re-enable when there's a use case for EFP follow in the app
        {connectedAddress ? <FollowerTag lookupAddressOrName={address} connectedAddress={connectedAddress} /> : null}
        {!isOwnProfile && connectedAddress ? (
          <FollowButton lookupAddress={address} connectedAddress={connectedAddress} />
        ) : null} */}
      </LeftGroup>
      <KlerosAppsWrapper>
        <KlerosAppLink
          href={getScoutProfileUrl(address)}
          target="_blank"
          rel="noopener noreferrer"
          title="Kleros Scout"
        >
          <ScoutIcon />
        </KlerosAppLink>
        <ProfileSocials
          userAddress={address}
          name={ens?.name}
          records={ens?.records ?? {}}
          hideSocials={[...HIDE_ALL_EXCEPT_TWITTER]}
          iconSize={28}
        />
      </KlerosAppsWrapper>
    </Container>
  );
};
export default TopContent;
