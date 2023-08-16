import React from "react";
import styled from "styled-components";
import { useAccount, useDisconnect } from "wagmi";
import { Button } from "@kleros/ui-components-library";
import { AddressOrNameDisplay, ChainDisplay, IdenticonOrAvatarDisplay } from "components/ConnectWallet";
import { EnsureChain } from "components/EnsureChain";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 12px;
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

const StyledAvatar = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 12px;

  // FIX ME: not working
  > img {
    width: 32px;
    height: 32px;
  }
  > svg {
    width: 32px;
    height: 32px;
  }
`;

const StyledButton = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 24px;
`;

const EnsureChainContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 16px;
`;

const UserContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const DisconnectWalletButton: React.FC = () => {
  const { disconnect } = useDisconnect();
  return <Button text={`Disconnect`} onClick={() => disconnect()} />;
};

const General: React.FC = () => {
  const { address } = useAccount();
  return (
    <EnsureChainContainer>
      <EnsureChain>
        <Container>
          {address && (
            <UserContainer>
              <StyledAvatar>
                <IdenticonOrAvatarDisplay />
              </StyledAvatar>
              <StyledAddressContainer>
                <AddressOrNameDisplay />
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
