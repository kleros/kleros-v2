import React from "react";
import styled from "styled-components";
import { useAccount, useNetwork } from "wagmi";
import { arbitrumGoerli } from "wagmi/chains";
import { useWeb3Modal } from "@web3modal/react";
import { shortenAddress } from "utils/shortenAddress";
import { Button } from "@kleros/ui-components-library";

const AccountDisplay: React.FC = () => {
  return (
    <StyledContainer>
      <ChainDisplay />
      <AddressDisplay />
    </StyledContainer>
  );
};

export const ChainDisplay: React.FC = () => {
  const { chain } = useNetwork();
  return <small>{chain?.name}</small>;
};

export const AddressDisplay: React.FC = () => {
  const { address } = useAccount();
  return <label>{address && shortenAddress(address)}</label>;
};

const StyledContainer = styled.div`
  width: fit-content;
  height: 34px;
  padding: 16px;
  gap: 0.5rem;
  border-radius: 300px;
  background-color: ${({ theme }) => theme.whiteLowOpacity};
  display: flex;
  align-items: center;
  > label {
    color: ${({ theme }) => theme.primaryText};
  }
  :before {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.success};
  }
`;

const ConnectButton: React.FC = () => {
  const { isConnected } = useAccount();
  const { open, setDefaultChain, isOpen } = useWeb3Modal();
  setDefaultChain(arbitrumGoerli);
  return isConnected ? (
    <AccountDisplay />
  ) : (
    <Button disabled={isOpen} small text={"Connect"} onClick={async () => await open({ route: "ConnectWallet" })} />
  );
};

export default ConnectButton;
