import React, { useMemo } from "react";
import styled from "styled-components";

import { useAccount } from "wagmi";

import ArrowIcon from "svgs/icons/arrow.svg";
import NewTabIcon from "svgs/icons/new-tab.svg";

import { DEFAULT_CHAIN, getChain } from "consts/chains";

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

const JurorLink: React.FC<IJurorLink> = ({ address, isInternalLink = true }) => {
  const { isConnected, address: connectedAddress } = useAccount();
  const profileLink =
    isConnected && connectedAddress?.toLowerCase() === address.toLowerCase()
      ? "/profile"
      : `/profile/stakes/1?address=${address}`;
  const addressExplorerLink = useMemo(() => {
    return `${getChain(DEFAULT_CHAIN)?.blockExplorers?.default.url}/address/${address}`;
  }, [address]);

  return (
    <Container>
      <IdenticonOrAvatar address={address} />
      <ReStyledArrowLink
        to={isInternalLink ? profileLink : addressExplorerLink}
        rel={`${isInternalLink ? "" : "noopener noreferrer"}`}
        target={`${isInternalLink ? "" : "_blank"}`}
      >
        <AddressOrName address={address} />
        {isInternalLink ? <ArrowIcon /> : <NewTabIcon />}
      </ReStyledArrowLink>
    </Container>
  );
};

export default JurorLink;
