import { Button } from "@kleros/ui-components-library";
import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import { useLifiSDK } from "context/LiFiProvider";
import Popup, { PopupType } from "components/Popup";
import type { Route } from "@lifi/sdk";
import { formatValue } from "utils/format";
import { formatUnits, parseUnits } from "viem";
import ConnectWallet from "components/ConnectWallet";
import { useGasSufficiency } from "hooks/useGasSufficiency";

const StyledButton = styled(Button)`
  width: 100%;
`;
const StyledConnectButton = styled(ConnectWallet)`
  width: 100%;
`;
const SwapButton: React.FC = () => {
  const { isDisconnected } = useAccount();
  const { execute, swapData, routesLoading, routes, isExecuting, selectedRoute } = useLifiSDK();
  const { insufficientGas, isLoading } = useGasSufficiency(selectedRoute);

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

  const isSwapDisabled = useMemo(() => {
    if (
      routesLoading ||
      routes.length === 0 ||
      isExecuting ||
      !selectedRoute ||
      insufficientGas?.[0].insufficient ||
      isLoading
    )
      return true;
    if (
      swapData.fromToken &&
      swapData.tokenBalance &&
      parseUnits(swapData.fromAmount, swapData.fromToken?.decimals) >
        parseUnits(swapData.tokenBalance, swapData.fromToken?.decimals)
    )
      return true;
    return false;
  }, [routesLoading, routes, isExecuting, selectedRoute, swapData, insufficientGas, isLoading]);

  return (
    <>
      {isDisconnected ? (
        <StyledConnectButton />
      ) : (
        <StyledButton text={buttonText} onClick={handleSwap} disabled={isSwapDisabled} isLoading={isExecuting} />
      )}
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
