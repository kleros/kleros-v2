import { Button } from "@kleros/ui-components-library";
import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { useLifiSDK } from "context/LiFiProvider";
import Popup, { PopupType } from "components/Popup";
import type { Route } from "@lifi/sdk";
import { formatValue } from "utils/format";
import { formatUnits } from "viem";

const StyledButton = styled(Button)`
  width: 100%;
`;

const SwapButton: React.FC = () => {
  const { execute, swapData, routesLoading, routes, isExecuting, selectedRoute } = useLifiSDK();
  const { switchNetwork } = useSwitchNetwork();
  const { chain } = useNetwork();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [executedRoute, setExecutedRoute] = useState<Route | undefined>();

  const handleSwap = () => {
    if (chain && swapData.fromChainId !== chain.id && switchNetwork) {
      switchNetwork(swapData.fromChainId);
      return;
    }
    execute()?.then(({ status, route }) => {
      setIsPopupOpen(status);
      setExecutedRoute(route);
    });
  };

  const buttonText = useMemo(
    () => (chain && swapData.fromChainId !== chain.id ? "Switch Network" : "Swap"),
    [chain, swapData]
  );

  const isSwapDisabled = useMemo(
    () => routesLoading || routes.length === 0 || isExecuting || !selectedRoute,
    [routesLoading, routes, isExecuting, selectedRoute]
  );
  return (
    <>
      <StyledButton text={buttonText} onClick={handleSwap} disabled={isSwapDisabled} isLoading={isExecuting} />;
      {isPopupOpen && (
        <Popup
          title="Success!"
          popupType={PopupType.SWAP_SUCCESS}
          amount={
            executedRoute
              ? formatValue(formatUnits(BigInt(executedRoute.toAmount), executedRoute.toToken.decimals), 2, false)
              : "0.0"
          }
          route={executedRoute}
          setIsOpen={setIsPopupOpen}
        />
      )}
    </>
  );
};

export default SwapButton;
