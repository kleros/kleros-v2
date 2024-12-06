import React, { useMemo } from "react";
import styled from "styled-components";

import { DEFAULT_CHAIN, getChain } from "consts/chains";

import { IdenticonOrAvatar, AddressOrName } from "components/ConnectWallet/AccountDisplay";
import { ExternalLink } from "components/ExternalLink";

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

const StyledExternalLink = styled(ExternalLink)`
  :hover {
    label {
      cursor: pointer;
      color: ${({ theme }) => theme.primaryBlue};
    }
  }
`;

interface IJurorTitle {
  address: string;
}

const JurorTitle: React.FC<IJurorTitle> = ({ address }) => {
  const addressExplorerLink = useMemo(() => {
    return `${getChain(DEFAULT_CHAIN)?.blockExplorers?.default.url}/address/${address}`;
  }, [address]);

  return (
    <Container>
      <IdenticonOrAvatar address={address} />
      <StyledExternalLink to={addressExplorerLink} rel="noopener noreferrer" target="_blank">
        <AddressOrName address={address} />
      </StyledExternalLink>
    </Container>
  );
};
export default JurorTitle;
