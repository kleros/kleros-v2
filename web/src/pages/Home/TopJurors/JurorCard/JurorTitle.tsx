import React, { useMemo } from "react";
import styled from "styled-components";

import { IdenticonOrAvatar, AddressOrName } from "components/ConnectWallet/AccountDisplay";
import { DEFAULT_CHAIN, getChain } from "consts/chains";

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

const StyledA = styled.a`
  :hover {
    text-decoration: underline;
    label {
      cursor: pointer;
      color: ${({ theme }) => theme.secondaryBlue};
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
      <StyledA href={addressExplorerLink} rel="noopener noreferrer" target="_blank">
        <AddressOrName address={address} />
      </StyledA>
    </Container>
  );
};
export default JurorTitle;
