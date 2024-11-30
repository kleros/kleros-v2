import React, { useMemo } from "react";
import styled from "styled-components";

import { useAccount, useDisconnect } from "wagmi";

import { Button } from "@kleros/ui-components-library";

import { AddressOrName, ChainDisplay, IdenticonOrAvatar } from "components/ConnectWallet/AccountDisplay";
import { EnsureChain } from "components/EnsureChain";
import TranslateDropdown from "components/TranslateDropdown";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 12px;
  align-items: center;
`;

const StyledChainContainer = styled.div`
  display: flex;
  height: 34px;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
  :before {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.success};
  }
  > label {
    color: ${({ theme }) => theme.success};
  }
`;

const StyledAddressContainer = styled.div`
  display: flex;
  justify-content: center;
  > label {
    color: ${({ theme }) => theme.primaryText};
    font-size: 16px;
    font-weight: 600;
  }
`;

const StyledAvatarContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 12px;
`;

const StyledButton = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 16px;
`;

const EnsureChainContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  justify-content: center;
  padding: 16px;
`;

const UserContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StyledA = styled.a`
  text-decoration: none;
  label {
    cursor: pointer;
    color: ${({ theme }) => theme.primaryBlue};
  }

  :hover {
    text-decoration: underline;
  }
`;

export const DisconnectWalletButton: React.FC = () => {
  const { disconnect } = useDisconnect();
  return <Button text={`Disconnect`} onClick={() => disconnect()} />;
};

const General: React.FC = () => {
  const { address, chain } = useAccount();

  const addressExplorerLink = useMemo(() => {
    return `${chain?.blockExplorers?.default.url}/address/${address}`;
  }, [address, chain]);

  return (
    <EnsureChainContainer>
      <TranslateDropdown />
      <EnsureChain>
        <Container>
          {address && (
            <UserContainer>
              <StyledAvatarContainer>
                <IdenticonOrAvatar size="48" />
              </StyledAvatarContainer>
              <StyledAddressContainer>
                <StyledA href={addressExplorerLink} rel="noreferrer" target="_blank">
                  <AddressOrName />
                </StyledA>
              </StyledAddressContainer>
              <StyledChainContainer>
                <ChainDisplay />
              </StyledChainContainer>
              <StyledButton>
                <DisconnectWalletButton />
              </StyledButton>
            </UserContainer>
          )}
        </Container>
      </EnsureChain>
    </EnsureChainContainer>
  );
};

export default General;
