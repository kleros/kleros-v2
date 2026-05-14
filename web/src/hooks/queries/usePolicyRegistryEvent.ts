import { useQuery } from "@tanstack/react-query";
import { getContract } from "viem";
import { usePublicClient } from "wagmi";

import { DEFAULT_CHAIN } from "consts/chains";
import { policyRegistryConfig } from "hooks/contracts/generated";
import { isUndefined } from "utils/index";

export const usePolicyRegistryEvent = (courtID?: string | number) => {
  const publicClient = usePublicClient();
  const isEnabled = !isUndefined(publicClient) && !isUndefined(courtID);

  return useQuery({
    queryKey: [`PolicyRegistry${courtID}`],
    enabled: isEnabled,
    staleTime: Infinity,
    queryFn: async () => {
      if (!publicClient || !courtID) throw Error;
      const chainKey = DEFAULT_CHAIN.id as keyof typeof policyRegistryConfig.address;
      const policyRegistry = getContract({
        abi: policyRegistryConfig.abi,
        address: policyRegistryConfig.address[chainKey],
        client: { public: publicClient },
      });
      const policyFilter = await policyRegistry.createEventFilter.PolicyUpdate({
        _courtID: BigInt(courtID),
      });
      const policyUpdateEvents = await publicClient.getFilterLogs({
        filter: policyFilter,
      });
      return policyUpdateEvents[0];
    },
  });
};
