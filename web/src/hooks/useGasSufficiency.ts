import { type EVMChain, getChainById, type Route, type Token } from "@lifi/sdk";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { parseUnits } from "viem";
import { lifi } from "context/LiFiProvider";

export interface GasSufficiency {
  gasAmount: bigint;
  tokenAmount?: bigint;
  insufficientAmount?: bigint;
  insufficient?: boolean;
  token: Token;
  chain?: EVMChain;
}

const refetchInterval = 30_000;

export const useGasSufficiency = (route?: Route) => {
  const { address } = useAccount();

  const { data: insufficientGas, isLoading } = useQuery({
    queryKey: ["gas-sufficiency-check", address, route?.id],
    queryFn: async ({ queryKey: [, accountAddress] }) => {
      // calculates gas costs for each step, excluding execution
      const gasCosts = route!.steps
        .filter((step) => !step.execution || step.execution.status !== "DONE")
        .reduce((groupedGasCosts, step) => {
          if (step.estimate.gasCosts) {
            const { token } = step.estimate.gasCosts[0];
            const gasCostAmount = step.estimate.gasCosts.reduce(
              (amount, gasCost) => amount + BigInt(gasCost.amount),
              0n
            );
            groupedGasCosts[token.chainId] = {
              gasAmount: groupedGasCosts[token.chainId]
                ? groupedGasCosts[token.chainId].gasAmount + gasCostAmount
                : gasCostAmount,
              token,
            };
          }
          // Add fees paid in native tokens to gas sufficiency check
          const nonIncludedFeeCosts = step.estimate.feeCosts?.filter((feeCost) => !feeCost.included);
          if (nonIncludedFeeCosts?.length) {
            const { token } = nonIncludedFeeCosts[0];
            const feeCostAmount = nonIncludedFeeCosts.reduce((amount, feeCost) => amount + BigInt(feeCost.amount), 0n);
            groupedGasCosts[token.chainId] = {
              gasAmount: groupedGasCosts[token.chainId]
                ? groupedGasCosts[token.chainId].gasAmount + feeCostAmount
                : feeCostAmount,
              token,
            } as any;
          }
          return groupedGasCosts;
        }, {} as Record<number, GasSufficiency>);

      // Check whether we are sending a native token
      // For native tokens we want to check for the total amount, including the network fee
      if (route!.fromToken.address === gasCosts[route!.fromChainId]?.token.address) {
        gasCosts[route!.fromChainId].tokenAmount = gasCosts[route!.fromChainId]?.gasAmount + BigInt(route!.fromAmount);
      }

      const tokenBalances = await lifi.getTokenBalances(
        accountAddress!,
        Object.values(gasCosts).map((item) => item.token)
      );

      if (!tokenBalances?.length) {
        return [];
      }

      [route!.fromChainId, route!.toChainId].forEach((chainId) => {
        if (gasCosts[chainId]) {
          const gasToken = tokenBalances?.find(
            (t) => t.chainId === gasCosts[chainId].token.chainId && t.address === gasCosts[chainId].token.address
          );
          const gasTokenBalance = parseUnits(gasToken?.amount ?? "0", gasToken?.decimals ?? 18);
          const insufficient =
            gasTokenBalance <= 0n ||
            gasTokenBalance < gasCosts[chainId].gasAmount ||
            gasTokenBalance < (gasCosts[chainId].tokenAmount ?? 0n);

          const insufficientAmount = insufficient
            ? gasCosts[chainId].tokenAmount
              ? gasCosts[chainId].tokenAmount! - gasTokenBalance
              : gasCosts[chainId].gasAmount - gasTokenBalance
            : undefined;

          gasCosts[chainId] = {
            ...gasCosts[chainId],
            insufficient,
            insufficientAmount,
            chain: insufficient ? getChainById(chainId) : undefined,
          };
        }
      });

      const gasCostResult = Object.values(gasCosts).filter((gasCost) => gasCost.insufficient);

      return gasCostResult;
    },

    enabled: Boolean(address && route),
    refetchInterval,
    staleTime: refetchInterval,
  });

  return {
    insufficientGas,
    isLoading,
  };
};
