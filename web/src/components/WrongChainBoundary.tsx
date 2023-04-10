import React, { useEffect } from "react";
import styled from "styled-components";
import { ErrorBoundary } from "react-error-boundary";
import { Button } from "@kleros/ui-components-library";

import { DEFAULT_CHAIN, SUPPORTED_CHAINS } from "consts/chains";

import { useSwitchNetwork, useNetwork } from "wagmi";
import { arbitrumGoerli } from "wagmi/chains";

const WrongChainRecovery: React.FC<{
  resetErrorBoundary: () => void;
}> = ({ resetErrorBoundary }) => {
  const { switchNetwork } = useSwitchNetwork({
    throwForSwitchChainNotSupported: true,
  });
  const { chain } = useNetwork();

  useEffect(() => {
    if (chain?.id === arbitrumGoerli.id) {
      resetErrorBoundary();
    }
  }, [chain?.id, resetErrorBoundary]);

  return (
    <Container>
      <Button
        disabled={!switchNetwork}
        text={`Switch to ${SUPPORTED_CHAINS[DEFAULT_CHAIN].chainName}`}
        onClick={() => {
          switchNetwork?.(arbitrumGoerli.id);
        }}
      />
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

const WrongChainBoundary: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ErrorBoundary FallbackComponent={WrongChainRecovery}>
    {children}
  </ErrorBoundary>
);

export default WrongChainBoundary;
