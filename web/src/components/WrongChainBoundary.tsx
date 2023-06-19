import React from "react";
import styled from "styled-components";
import { ErrorBoundary } from "react-error-boundary";
import { Button } from "@kleros/ui-components-library";
import { useSwitchNetwork } from "wagmi";
import { DEFAULT_CHAIN, SUPPORTED_CHAINS } from "consts/chains";

const WrongChainRecovery: React.FC<{ resetErrorBoundary: () => void }> = ({ resetErrorBoundary }) => {
  const { switchNetwork, error, isLoading } = useSwitchNetwork({
    onSuccess() {
      resetErrorBoundary();
    },
  });
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
    <Container>
      <Button
        isLoading={isLoading}
        disabled={isLoading}
        text={`Switch to ${SUPPORTED_CHAINS[DEFAULT_CHAIN].chainName}`}
        onClick={handleSwitch}
      />
      {error && <p>Error: {error.message}</p>}
    </Container>
  );
};
const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.whiteBackground};
`;
const WrongChainBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorBoundary FallbackComponent={WrongChainRecovery}>{children}</ErrorBoundary>
);
export default WrongChainBoundary;
