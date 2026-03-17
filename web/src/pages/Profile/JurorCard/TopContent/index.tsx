import React from "react";
import styled, { css } from "styled-components";

import { FollowButton, FollowerTag, ProfileSocials, useProfileDetails } from "ethereum-identity-kit";
import { useTranslation } from "react-i18next";
import { useAccount } from "wagmi";

import { landscapeStyle } from "styles/landscapeStyle";

import JurorLink from "components/JurorLink";

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

const SocialsWrapper = styled.div`
  ${landscapeStyle(
    () => css`
      margin-left: auto;
    `
  )}
`;

interface ITopContent {
  address: `0x${string}`;
  totalResolvedDisputes: number;
}

const TopContent: React.FC<ITopContent> = ({ address, totalResolvedDisputes }) => {
  const { t } = useTranslation();
  const { address: connectedAddress } = useAccount();
  const { ens } = useProfileDetails({ addressOrName: address });
  const isOwnProfile = connectedAddress?.toLowerCase() === address.toLowerCase();

  return (
    <Container>
      <LeftGroup>
        <JurorLink {...{ address }} isInternalLink={false} />
        {totalResolvedDisputes > 0 ? (
          <StyledLabel>{t("profile.juror_in_cases", { count: totalResolvedDisputes })}</StyledLabel>
        ) : null}
        {connectedAddress ? <FollowerTag lookupAddressOrName={address} connectedAddress={connectedAddress} /> : null}
        {!isOwnProfile && connectedAddress ? (
          <FollowButton lookupAddress={address} connectedAddress={connectedAddress} />
        ) : null}
      </LeftGroup>
      <SocialsWrapper>
        <ProfileSocials userAddress={address} name={ens?.name} records={ens?.records ?? {}} />
      </SocialsWrapper>
    </Container>
  );
};
export default TopContent;
