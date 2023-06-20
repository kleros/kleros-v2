import React from "react";
import styled from "styled-components";
import { useAccount, useNetwork } from "wagmi";
import Identicon from "react-identicons";
import ConnectButton, { AddressDisplay, ChainDisplay } from "components/ConnectButton";
import { SUPPORTED_CHAINIDS } from "consts/chains";

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
  const { address } = useAccount();
  const { chain } = useNetwork();

  return chain && SUPPORTED_CHAINIDS.includes(chain.id) ? (
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
  ) : (
    <StyledConnectButtonContainer>
      <ConnectButton />
    </StyledConnectButtonContainer>
  );
};

export default General;
