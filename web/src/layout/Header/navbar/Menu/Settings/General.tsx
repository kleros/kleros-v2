import React from "react";
import styled from "styled-components";
import Identicon from "react-identicons";
import ConnectButton, { AddressDisplay, ChainDisplay } from "components/ConnectButton";
import { useWeb3 } from "hooks/useWeb3";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 32px;
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
  > small {
    color: ${({ theme }) => theme.success};
  }
`;

const StyledAddressContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 12px;
  padding-bottom: 32px;
`;

const StyledIdenticon = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 32px;
`;

const StyledConnectButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 16px;
`;

const General: React.FC = () => {
  const { account } = useWeb3();

  return account ? (
    <Container>
      <StyledChainContainer>
        <ChainDisplay />
      </StyledChainContainer>
      {account ? (
        <StyledIdenticon>
          <Identicon size="24" string={account} />
        </StyledIdenticon>
      ) : null}
      <StyledAddressContainer>
        <AddressDisplay />
      </StyledAddressContainer>
    </Container>
  ) : (
    <StyledConnectButtonContainer>
      <ConnectButton />
    </StyledConnectButtonContainer>
  );
};

export default General;
