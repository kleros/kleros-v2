import React from "react";
import styled from "styled-components";
import { shortenAddress } from "utils/shortenAddress";
import { Button } from "@kleros/ui-components-library";

import { useAccount, useConnect, useNetwork, useEnsAvatar } from "wagmi";
import { arbitrumGoerli } from "wagmi/chains";
import { useErrorHandler } from "react-error-boundary";

const AccountDisplay: React.FC = () => {
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { data } = useEnsAvatar({ address });

  const shortAddress = address ? shortenAddress(address) : undefined;
  const addressOrAvatar = data ? data : shortAddress;

  return (
    <StyledContainer>
      <small>{chain?.name}</small>
      <label>{addressOrAvatar}</label>
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
  const { isConnected } = useAccount();

  const { chain } = useNetwork();

  const handleError = useErrorHandler();

  const { connect, connectors } = useConnect();

  try {
    if (isConnected) {
      if (chain?.id !== arbitrumGoerli.id) {
        throw new Error("chain not configure");
      }
    }
  } catch (e) {
    handleError(e);
  }

  return isConnected ? (
    <AccountDisplay />
  ) : (
    <>
      {connectors.map((connector) => (
        <Button
          small
          text={"Connect"}
          disabled={!connector.ready}
          key={connector.id}
          onClick={() => connect({ connector })}
        />
      ))}
    </>
  );
};

export default ConnectButton;
