import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import React from "react";
import { LiFi, Token, RoutesResponse, RoutesRequest, Route } from "@lifi/sdk";
import { useAccount } from "wagmi";
import { useLocalStorage } from "hooks/useLocalStorage";
import { useDebounce } from "react-use";
import { parseUnits } from "viem";
import { useEthersSigner } from "utils/getSigner";
import { switchChainHook, updateRouteHook } from "utils/lifiUtils";

interface SwapData extends RoutesRequest {
  fromToken?: Token;
  tokenBalance?: string;
}

interface ILifiProvider {
  tokens: Token[];
  routes: RoutesResponse["routes"];
  selectedRoute?: Route;
  setSelectedRoute: (route: Route) => void;
  swapData: SwapData;
  setSwapData: (swapData: SwapData) => void;
  routesLoading?: boolean;
  isExecuting?: boolean;
  execute: () => void;
}

const initialSwapData: SwapData = {
  fromChainId: 5,
  fromAmount: "1", // 1
  fromTokenAddress: "0x0000000000000000000000000000000000000000", // ETH

  // these are hardcoded, set to PNK on production deploy
  toChainId: 5,
  toTokenAddress: "0xd87ba7a50b2e7e660f678a895e4b72e7cb4ccd9c", // USDC
};

const LifiContext = createContext<ILifiProvider>({
  tokens: [],
  routes: [],
  swapData: initialSwapData,
  setSwapData: () => {},
  setSelectedRoute: () => {},
  execute: () => {},
});

export const useLifiSDK = () => {
  const context = useContext(LifiContext);
  if (!context) {
    throw new Error("Context Provider not found.");
  }
  return context;
};

const lifi = new LiFi({
  integrator: "Kleros",
  apiUrl: "https://staging.li.quest/v1",
});

export const LifiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address } = useAccount();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [routes, setRoutes] = useState<RoutesResponse["routes"]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route>();
  const [routesLoading, setRoutesLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [swapData, setSwapData] = useLocalStorage<SwapData>("swapData", { ...initialSwapData, fromAddress: address });

  const signer = useEthersSigner({ chainId: swapData.fromChainId });
  const routeRequest = useMemo(() => constructRouteRequest(swapData), [swapData]);

  const resetRoutes = () => {
    setSelectedRoute(undefined);
    setRoutes([]);
  };
  // update tokens for the chain
  useEffect(() => {
    resetRoutes();
    lifi.getTokens({ chains: [swapData.fromChainId] }).then((res) => {
      setTokens(res.tokens[swapData.fromChainId].slice(0, 100));
    });
  }, [swapData.fromChainId]);

  // get token balance for the chain. TODO: get all chains balance to determine end chain gas sufficiency
  useEffect(() => {
    if (!address || tokens.length === 0) return;
    const fromToken = swapData?.fromToken ?? tokens.find((token) => token.address === swapData.fromTokenAddress)!;

    lifi.getTokenBalance(address, fromToken).then((res) => setSwapData({ ...swapData, tokenBalance: res?.amount }));
  }, [swapData.fromToken, address, tokens, swapData.fromTokenAddress]);

  useDebounce(
    () => {
      setRoutesLoading(true);
      lifi
        .getRoutes(routeRequest)
        .then((res) => {
          setRoutes(res.routes);
        })
        .catch((err) => {
          console.log("Error fetching routes :", { err });
          resetRoutes();
        })
        .finally(() => setRoutesLoading(false));
    },
    1000,
    [routeRequest]
  );

  const execute = useCallback(() => {
    if (!signer) return;
    setIsExecuting(true);
    lifi
      .executeRoute(signer, routes?.[0], {
        updateRouteHook,
        switchChainHook,
        updateTransactionRequestHook: async (req) => {
          // TODO: update gas price here
          //   const updatedTxRequest = {
          //     ...req,
          //     gasPrice: "10000000000000000000",
          //     gasLimit: "1",
          //   };

          return req;
        },
      })
      .then((res) => {
        console.log({ result: res }), resetRoutes();
      })
      .catch((err) => {
        console.log("Swap execution failed :", { err });
      })
      .finally(() => setIsExecuting(false));
  }, [routes, signer]);

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
        }),
        [tokens, routes, swapData, setSwapData, routesLoading, selectedRoute, setSelectedRoute, execute, isExecuting]
      )}
    >
      {children}
    </LifiContext.Provider>
  );
};

const constructRouteRequest = (data: SwapData) => {
  const request = { ...(data as RoutesRequest) };
  request.fromAmount = parseUnits(data.fromAmount, data?.fromToken?.decimals ?? 18).toString();

  return request;
};
