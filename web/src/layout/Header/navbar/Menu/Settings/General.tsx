import React from "react";
import styled from "styled-components";
import { useAccount } from "wagmi";
import Identicon from "react-identicons";
import { AddressDisplay, ChainDisplay } from "components/ConnectWallet";
import { EnsureChain } from "components/EnsureChain";

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

const EnsureChainContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 16px;
`;

const General: React.FC = () => {
  const { address } = useAccount();

  return (
    <EnsureChainContainer>
      <EnsureChain>
        <Container>
          <StyledChainContainer>
            <ChainDisplay />
          </StyledChainContainer>
          {address && (
            <StyledIdenticon>
              <Identicon size="24" string={address} />
            </StyledIdenticon>
          )}
          <StyledAddressContainer>
            <AddressDisplay />
          </StyledAddressContainer>
        </Container>
      </EnsureChain>
    </EnsureChainContainer>
  );
};

export default General;
