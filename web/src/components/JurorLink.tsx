import React, { useMemo, useCallback } from "react";
import styled from "styled-components";

import { ProfileTooltip } from "ethereum-identity-kit";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";

import ArrowIcon from "svgs/icons/arrow.svg";
import NewTabIcon from "svgs/icons/new-tab.svg";

import { DEFAULT_CHAIN } from "consts/chains";

import { IdenticonOrAvatar, AddressOrName } from "components/ConnectWallet/AccountDisplay";
import { StyledArrowLink } from "components/StyledArrowLink";

const Container = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;

  label {
    font-size: 16px;
  }

  canvas {
    width: 20px;
    height: 20px;
    border-radius: 10%;
  }
`;

export const ReStyledArrowLink = styled(StyledArrowLink)<{ smallDisplay?: boolean }>`
  label {
    cursor: pointer;
    color: ${({ theme }) => theme.primaryBlue};
  }

  :hover {
    label {
      color: ${({ theme }) => theme.secondaryBlue};
    }
  }

  ${({ smallDisplay }) =>
    smallDisplay &&
    `
    > svg {
      height: 14.5px;
      width: 14.5px;
    }
  `}
`;

interface IJurorLink {
  address: string;
  isInternalLink?: boolean;
  smallDisplay?: boolean;
}

const JurorLink: React.FC<IJurorLink> = ({ address, isInternalLink = true, smallDisplay }) => {
  const navigate = useNavigate();
  const { address: connectedAddress } = useAccount();
  const profileLink = `/profile/stakes/1?address=${address}`;
  const addressExplorerLink = useMemo(() => {
    return `${DEFAULT_CHAIN?.blockExplorers?.default.url}/address/${address}`;
  }, [address]);

  const handleProfileClick = useCallback(
    (addressOrName: string) => {
      navigate(`/profile/stakes/1?address=${addressOrName}`);
    },
    [navigate]
  );

  return (
    <ProfileTooltip
      addressOrName={address}
      showFollowButton={false}
      connectedAddress={connectedAddress}
      onProfileClick={handleProfileClick}
    >
      <Container>
        <IdenticonOrAvatar address={address} />
        <ReStyledArrowLink
          {...{ smallDisplay }}
          to={isInternalLink ? profileLink : addressExplorerLink}
          rel={`${isInternalLink ? "" : "noopener noreferrer"}`}
          target={`${isInternalLink ? "" : "_blank"}`}
        >
          <AddressOrName {...{ address, smallDisplay }} />
          {isInternalLink ? <ArrowIcon /> : <NewTabIcon />}
        </ReStyledArrowLink>
      </Container>
    </ProfileTooltip>
  );
};

export default JurorLink;
