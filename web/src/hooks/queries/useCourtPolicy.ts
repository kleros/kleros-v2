import useSWRImmutable from "swr/immutable";
import { PolicyRegistry } from "@kleros/kleros-v2-contracts/typechain-types/src/arbitration/PolicyRegistry";
import { useConnectedContract } from "hooks/useConnectedContract";

export const useCourtPolicy = (courtID?: number) => {
  const policyRegistry = useConnectedContract(
    "PolicyRegistry"
  ) as PolicyRegistry;
  return useSWRImmutable(
    () => (policyRegistry && courtID ? `PolicyRegistry${courtID}` : false),
    async () => {
      if (policyRegistry) {
        const policyFilter = policyRegistry.filters.PolicyUpdate(courtID);
        return policyRegistry
          .queryFilter(policyFilter)
          .then((events) => events[0]);
      } else throw Error;
    }
  );
};
