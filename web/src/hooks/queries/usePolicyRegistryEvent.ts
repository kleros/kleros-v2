import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { getPolicyRegistry } from "hooks/contracts/generated";
import { isUndefined } from "utils/index";

export const usePolicyRegistryEvent = (courtID?: string | number) => {
  const policyRegistry = getPolicyRegistry({});
  const isEnabled = !isUndefined(policyRegistry) && !isUndefined(courtID);

  const publicClient = usePublicClient();
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
