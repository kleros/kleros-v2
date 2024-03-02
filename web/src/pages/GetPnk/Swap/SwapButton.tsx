import { Button } from "@kleros/ui-components-library";
import React, { useMemo } from "react";
import styled from "styled-components";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { useLifiSDK } from "context/LiFiProvider";

const StyledButton = styled(Button)`
  width: 100%;
`;

const SwapButton: React.FC = () => {
  const { execute, swapData, routesLoading, routes, isExecuting, selectedRoute } = useLifiSDK();
  const { switchNetwork } = useSwitchNetwork();
  const { chain } = useNetwork();

  const handleSwap = () => {
    if (chain && swapData.fromChainId !== chain.id) {
      switchNetwork && switchNetwork(swapData.fromChainId);
      return;
    }
    execute();
  };

  const buttonText = useMemo(
    () => (chain && swapData.fromChainId !== chain.id ? "Switch Network" : "Swap"),
    [chain, swapData]
  );

  const isSwapDisabled = useMemo(
    () => routesLoading || routes.length === 0 || isExecuting || !selectedRoute,
    [routesLoading, routes, isExecuting, selectedRoute]
  );
  return <StyledButton text={buttonText} onClick={handleSwap} disabled={isSwapDisabled} isLoading={isExecuting} />;
};

export default SwapButton;
