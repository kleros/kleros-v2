import { useQuery } from "@tanstack/react-query";
import { getContract } from "viem";
import { usePublicClient } from "wagmi";

import { DEFAULT_CHAIN } from "consts/chains";
import { policyRegistryConfig } from "hooks/contracts/generated";
import { isUndefined } from "utils/index";

export const usePolicyRegistryEvent = (courtID?: string | number) => {
  const publicClient = usePublicClient();
  const policyRegistry = getContract({
    abi: policyRegistryConfig.abi,
    address: policyRegistryConfig.address[DEFAULT_CHAIN],
    client: {
      public: publicClient,
    },
  });
  const isEnabled = !isUndefined(policyRegistry) && !isUndefined(courtID);

  return useQuery({
    queryKey: [`PolicyRegistry${courtID}`],
    enabled: isEnabled,
    staleTime: Infinity,
    queryFn: async () => {
      if (policyRegistry && courtID) {
        const policyFilter = await policyRegistry.createEventFilter.PolicyUpdate({
          _courtID: BigInt(courtID),
        });
        const policyUpdateEvents = await publicClient.getFilterLogs({
          filter: policyFilter,
        });
        return policyUpdateEvents[0];
      } else throw Error;
    },
  });
};
