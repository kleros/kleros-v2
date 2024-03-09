import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { LiFi, Token, RoutesResponse, RoutesRequest, Route } from "@lifi/sdk";
import { useAccount } from "wagmi";
import { useLocalStorage } from "hooks/useLocalStorage";
import { useEthersSigner } from "utils/getSigner";
import { switchChainHook, updateRouteHook } from "utils/lifiUtils";
import { useRoutesFetch } from "hooks/useRoutesFetch";

export interface SwapData extends RoutesRequest {
  fromToken?: Token;
  tokenBalance?: string;
  slippage: number;
  gasPrice: "slow" | "normal" | "fast";
}

interface ILifiProvider {
  tokens: Token[];
  routes: RoutesResponse["routes"];
  selectedRoute?: Route;
  refetch: () => void;
  setSelectedRoute: (route: Route) => void;
  swapData: SwapData;
  setSwapData: (swapData: SwapData) => void;
  routesLoading?: boolean;
  isExecuting?: boolean;
  execute: () => Promise<{ status: boolean; route?: Route }> | undefined;
}

const initialSwapData: SwapData = {
  fromChainId: 5,
  fromAmount: "1", // 1
  fromTokenAddress: "0x0000000000000000000000000000000000000000", // ETH
  slippage: 0.03, // "3%"
  gasPrice: "normal",
  // these are hardcoded, set to PNK on production deploy
  toChainId: 5,
  toTokenAddress: "0xd87ba7a50b2e7e660f678a895e4b72e7cb4ccd9c", // PNK
};

const LifiContext = createContext<ILifiProvider>({
  tokens: [],
  routes: [],
  swapData: initialSwapData,
  setSwapData: () => {},
  setSelectedRoute: () => {},
  execute: () => undefined,
  refetch: () => {},
});

export const useLifiSDK = () => {
  const context = useContext(LifiContext);
  if (!context) {
    throw new Error("Context Provider not found.");
  }
  return context;
};

export const lifi = new LiFi({
  integrator: "Kleros",
  apiUrl: "https://staging.li.quest/v1",
});

export const LifiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address } = useAccount();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route>();
  const [isExecuting, setIsExecuting] = useState(false);
  const [swapData, setSwapData] = useLocalStorage<SwapData>("swapData", { ...initialSwapData, fromAddress: address });

  const signer = useEthersSigner({ chainId: swapData.fromChainId });

  const { routes, isLoading: routesLoading, refetch } = useRoutesFetch(swapData);

  // update tokens for the chain
  useEffect(() => {
    lifi.getTokens({ chains: [swapData.fromChainId] }).then((res) => {
      setTokens(res.tokens[swapData.fromChainId].slice(0, 1000));
    });
  }, [swapData.fromChainId]);

  // get token balance for the chain.
  useEffect(() => {
    if (!address || tokens.length === 0) return;
    const fromToken = swapData?.fromToken ?? tokens.find((token) => token.address === swapData.fromTokenAddress)!;

    lifi
      .getTokenBalance(address, fromToken)
      .then((res) => setSwapData({ ...swapData, tokenBalance: res?.amount }))
      .catch((err) => console.log("Error fetching token balance: ", { err }));
  }, [swapData?.fromToken, address, tokens, swapData.fromTokenAddress, lifi]);

  // execute the selected route
  const execute = useCallback(() => {
    if (!signer || !selectedRoute) return;
    setIsExecuting(true);
    return lifi
      .executeRoute(signer, selectedRoute, {
        updateRouteHook,
        switchChainHook,
        updateTransactionRequestHook: async (req) => {
          return {
            ...req,
            gasPrice: await fetchGasPrice(swapData.fromChainId, swapData.gasPrice ?? "normal"),
          };
        },
        acceptExchangeRateUpdateHook: async () => true,
      })
      .then((res) => {
        console.log({ result: res });
        return { status: true, route: res };
      })
      .catch((err) => {
        console.log("Swap execution failed :", { err });
        return { status: false };
      })
      .finally(() => setIsExecuting(false));
  }, [selectedRoute, signer, lifi]);

  return (
    <LifiContext.Provider
      value={useMemo(
        () => ({
          tokens,
          routes,
          swapData,
          setSwapData,
          routesLoading,
          selectedRoute,
          setSelectedRoute,
          execute,
          isExecuting,
          refetch,
        }),
        [
          tokens,
          routes,
          swapData,
          setSwapData,
          routesLoading,
          selectedRoute,
          setSelectedRoute,
          execute,
          isExecuting,
          refetch,
        ]
      )}
    >
      {children}
    </LifiContext.Provider>
  );
};

const fetchGasPrice = async (chainId: number, gasSetting: string) => {
  try {
    const response = await fetch(`https://staging.li.quest/v1/gas/prices/${chainId}`);
    const data = await response.json();
    switch (gasSetting) {
      case "slow":
        return data.standard;
      case "normal":
        return data.fast;
      case "fast":
        return data.fastest;
      default:
        return data.normal;
    }
  } catch (err) {
    console.log("Error fetching gas prices :", { err });
  }
};
