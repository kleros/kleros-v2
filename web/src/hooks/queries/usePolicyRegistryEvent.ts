import useSWRImmutable from "swr/immutable";
import { getPolicyRegistry } from "hooks/contracts/generated";
import { usePublicClient } from "wagmi";

export const usePolicyRegistryEvent = (courtID?: string | number) => {
  const policyRegistry = getPolicyRegistry({});
  const publicClient = usePublicClient();

  return useSWRImmutable(
    () => (policyRegistry && courtID ? `PolicyRegistry${courtID}` : false),
    async () => {
      if (policyRegistry && courtID) {
        const policyFilter = await policyRegistry.createEventFilter.PolicyUpdate({
          _courtID: BigInt(courtID),
        });
        const policyUpdateEvents = await publicClient.getFilterLogs({
          filter: policyFilter,
        });
        return policyUpdateEvents[0];
      } else throw Error;
    }
  );
};
