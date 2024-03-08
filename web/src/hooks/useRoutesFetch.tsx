import { type EVMChain, type RoutesRequest, type RoutesResponse, type Token } from "@lifi/sdk";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { parseUnits } from "viem";
import { SwapData, lifi } from "context/LiFiProvider";
import { isUndefined } from "utils/index";

export interface GasSufficiency {
  gasAmount: bigint;
  tokenAmount?: bigint;
  insufficientAmount?: bigint;
  insufficient?: boolean;
  token: Token;
  chain?: EVMChain;
}

const refetchInterval = 60_000;

export const useRoutesFetch = (swapData?: SwapData) => {
  const { isConnected } = useAccount();
  const isEnabled = !isUndefined(swapData) && Number(swapData.fromAmount) >= 0 && isConnected;
  console.log("here", swapData);

  const {
    data: routes,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<RoutesResponse["routes"]>({
    queryKey: ["lifi-routes-fetch", swapData],
    queryFn: async () => {
      try {
        console.log("fetching");
        if (isUndefined(swapData)) return [];

        const routeRequest = constructRouteRequest(swapData);
        const res = await lifi.getRoutes(routeRequest);

        return res.routes;
      } catch (err) {
        console.log("Err fetching routes :", { err });
        return [];
      }
    },

    enabled: isEnabled,
    refetchInterval,
    staleTime: refetchInterval,
  });

  return {
    routes: routes ?? [],
    isLoading: isLoading || isRefetching,
    refetch,
  };
};

const constructRouteRequest = (data: SwapData) => {
  const request = { ...(data as RoutesRequest) };
  request.fromAmount = parseUnits(data.fromAmount, data?.fromToken?.decimals ?? 18).toString();
  request.options = {
    slippage: data.slippage,
  };
  return request;
};
