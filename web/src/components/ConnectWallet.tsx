import React from "react";
import styled from "styled-components";
import { useAccount, useEnsAvatar, useEnsName, useNetwork, useSwitchNetwork } from "wagmi";
import Identicon from "react-identicons";
import { useWeb3Modal } from "@web3modal/react";
import { shortenAddress } from "utils/shortenAddress";
import { Button } from "@kleros/ui-components-library";
import { SUPPORTED_CHAINS, DEFAULT_CHAIN } from "consts/chains";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-content: center;
  align-items: center;
`;

const AccountContainer = styled.div`
  min-height: 32px;
  display: flex;
  align-items: center;
  width: fit-content;
  > label {
    color: ${({ theme }) => theme.primaryText};
    font-size: 16px;
    font-weight: 600;
  }
`;

const IconContainer = styled.div`
  margin-right: 8px;
`;

const IdenticonOrAvatarContainer = styled.div`
  align-items: center;
  > img {
    width: 16px;
    height: 16px;
  }
  > svg {
    width: 16px;
    height: 16px;
  }
`;

const ChainConnectionContainer = styled.div`
  width: fit-content;
  min-height: 32px;
  display: flex;
  align-items: center;
  > label {
    color: ${({ theme }) => theme.success};
    font-size: 16px;
    margin-right: 4px;
  }
  :before {
    content: "";
    width: 8px;
    height: 8px;
    margin: 0px 13px 0px 3px;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.success};
  }
`;

const AccountDisplay: React.FC = () => {
  return (
    <Container>
      <AccountContainer>
        <IconContainer>
          <IdenticonOrAvatarDisplay />
        </IconContainer>
        <AddressOrNameDisplay />
      </AccountContainer>
      <ChainConnectionContainer>
        <ChainDisplay />
      </ChainConnectionContainer>
    </Container>
  );
};

export const IdenticonOrAvatarDisplay: React.FC = () => {
  const { address } = useAccount();
  const { data: name } = useEnsName({
    address,
    chainId: 1,
  });
  const { data: avatar } = useEnsAvatar({
    name,
    chainId: 1,
  });
  return (
    <IdenticonOrAvatarContainer>
      {avatar && <img src={avatar} alt="avatar" />}
      {!avatar && <Identicon size="16" string={address} />}
    </IdenticonOrAvatarContainer>
  );
};

export const AddressOrNameDisplay: React.FC = () => {
  const { address } = useAccount();
  const { data } = useEnsName({
    address,
    chainId: 1,
  });
  return <label>{data ?? (address && shortenAddress(address))}</label>;
};

export const ChainDisplay: React.FC = () => {
  const { chain } = useNetwork();
  return <label>{chain?.name}</label>;
};

export const SwitchChainButton: React.FC = () => {
  const { switchNetwork, isLoading } = useSwitchNetwork();
  const handleSwitch = () => {
    if (!switchNetwork) {
      console.error("Cannot switch network. Please do it manually.");
      return;
    }
    try {
      switchNetwork(DEFAULT_CHAIN);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <Button
      isLoading={isLoading}
      disabled={isLoading}
      text={`Switch to ${SUPPORTED_CHAINS[DEFAULT_CHAIN].chainName}`}
      onClick={handleSwitch}
    />
  );
};

const ConnectButton: React.FC = () => {
  const { open, isOpen } = useWeb3Modal();
  return (
    <Button disabled={isOpen} small text={"Connect"} onClick={async () => await open({ route: "ConnectWallet" })} />
  );
};

const ConnectWallet: React.FC = () => {
  const { chain } = useNetwork();
  const { isConnected } = useAccount();
  if (isConnected) {
    if (chain && chain.id !== DEFAULT_CHAIN) {
      return <SwitchChainButton />;
    } else return <AccountDisplay />;
  } else return <ConnectButton />;
};

export default ConnectWallet;
