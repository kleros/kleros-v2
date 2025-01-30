import React from "react";
import styled from "styled-components";

import ArrowIcon from "svgs/icons/arrow.svg";

import { IdenticonOrAvatar, AddressOrName } from "components/ConnectWallet/AccountDisplay";
import { StyledArrowLink } from "components/StyledArrowLink";
import { useAccount } from "wagmi";

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

export const ReStyledArrowLink = styled(StyledArrowLink)`
  label {
    cursor: pointer;
    color: ${({ theme }) => theme.primaryBlue};
  }

  :hover {
    label {
      color: ${({ theme }) => theme.secondaryBlue};
    }
  }
`;

interface IJurorTitle {
  address: string;
}

const JurorTitle: React.FC<IJurorTitle> = ({ address }) => {
  const { isConnected, address: connectedAddress } = useAccount();
  const profileLink =
    isConnected && connectedAddress?.toLowerCase() === address.toLowerCase()
      ? "/profile/1/desc/all"
      : `/profile/1/desc/all?address=${address}`;

  return (
    <Container>
      <IdenticonOrAvatar address={address} />
      <ReStyledArrowLink to={profileLink}>
        <AddressOrName address={address} />
        <ArrowIcon />
      </ReStyledArrowLink>
    </Container>
  );
};

export default JurorTitle;
