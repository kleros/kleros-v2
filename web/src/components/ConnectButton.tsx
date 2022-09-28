import React from "react";
import styled from "styled-components";
import { shortenAddress } from "utils/shortenAddress";
import { Button } from "@kleros/ui-components-library";
import { useWeb3 } from "hooks/useWeb3";
import { useConnect } from "hooks/useConnect";
import { SUPPORTED_CHAINS } from "consts/supportedChains";

const AccountDisplay: React.FC = () => {
  const { account, chainId } = useWeb3();
  const chainName = chainId ? SUPPORTED_CHAINS[chainId].chainName : undefined;
  const shortAddress = account ? shortenAddress(account) : undefined;
  return (
    <StyledContainer>
      <small>{chainName}</small>
      <label>{shortAddress}</label>
    </StyledContainer>
  );
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
  const { active } = useWeb3();
  const { activate, connecting } = useConnect();
  return active ? (
    <AccountDisplay />
  ) : (
    <Button disabled={connecting} small text={"Connect"} onClick={activate} />
  );
};

export default ConnectButton;
