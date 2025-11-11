import React from "react";
import styled from "styled-components";

import ArrowSvg from "svgs/icons/arrow.svg";

import { AddressOrName, IdenticonOrAvatar } from "components/ConnectWallet/AccountDisplay";
import { StyledArrowLink } from "components/StyledArrowLink";
import { useWallet } from "context/walletProviders";

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

interface IJurorTitle {
  address: `0x${string}`;
  smallDisplay?: boolean;
}

const JurorTitle: React.FC<IJurorTitle> = ({ address, smallDisplay }) => {
  const { isConnected, account: connectedAddress } = useWallet();
  const profileLink =
    isConnected && connectedAddress?.toLowerCase() === address.toLowerCase()
      ? "/profile/1/desc/all"
      : `/profile/1/desc/all?address=${address}`;

  return (
    <Container>
      <IdenticonOrAvatar {...{ address }} />
      <ReStyledArrowLink to={profileLink} {...{ smallDisplay }}>
        <AddressOrName {...{ address, smallDisplay }} />
        <ArrowSvg />
      </ReStyledArrowLink>
    </Container>
  );
};

export default JurorTitle;
