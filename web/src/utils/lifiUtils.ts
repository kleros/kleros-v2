import { Route } from "@lifi/sdk";
import { toast } from "react-toastify";
import { OPTIONS as toastOptions } from "utils/wrapWithToast";
import { useSwitchNetwork } from "wagmi";
import { useEthersSigner } from "./getSigner";

const isExecutionStarted = (route: Route) => {
  return route.steps.every((step) => step.execution?.status === "ACTION_REQUIRED");
};

const isRouteDone = (route: Route) => {
  return route.steps.every((step) => step.execution?.status === "DONE");
};

const isRouteFailed = (route: Route) => {
  return route.steps.some((step) => step.execution?.status === "FAILED");
};

export const updateRouteHook = (route: Route) => {
  if (isExecutionStarted(route)) {
    toast.info("Confirmation pending", toastOptions);
  }
  if (isRouteFailed(route)) {
    toast.error(route.containsSwitchChain ? "Bridging failed" : "Swap failed", toastOptions);
  }

  if (isRouteDone(route)) {
    toast.success(route.containsSwitchChain ? "Bridging Success" : "Swap Success", toastOptions);
  }
};

/** Gives the estimated time for the route to execute */
export const getRouteEstimateTime = (route: Route) => {
  return route.steps.reduce((acc, current) => {
    acc += current.estimate.executionDuration;
    return acc;
  }, 0);
};

export const switchChainHook = async (chainId: number) => {
  const { switchNetworkAsync } = useSwitchNetwork();
  if (!switchNetworkAsync) return;

  await switchNetworkAsync(chainId);

  return useEthersSigner({ chainId });
};
