import React, { useState } from "react";
import styled from "styled-components";
import { ErrorBoundary } from "react-error-boundary";
import { Button } from "@kleros/ui-components-library";
import { switchChain } from "utils/switchChain";

const WrongChainRecovery: React.FC<{ resetErrorBoundary: () => void }> = ({
  resetErrorBoundary,
}) => {
  const [loading, setLoading] = useState(false);
  return (
    <Container>
      <Button
        isLoading={loading}
        disabled={loading}
        text="Switch to Arbitrum"
        onClick={() => {
          setLoading(true);
          switchChain(421611)
            .then(resetErrorBoundary)
            .finally(() => setLoading(false));
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
