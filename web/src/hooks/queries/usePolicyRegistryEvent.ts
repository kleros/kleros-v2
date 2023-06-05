import useSWRImmutable from "swr/immutable";
import { BigNumber } from "ethers";
import { usePolicyRegistry } from "hooks/contracts/generated";

export const usePolicyRegistryEvent = (courtID?: string | number) => {
  const policyRegistry = usePolicyRegistry();
  return useSWRImmutable(
    () => (policyRegistry && courtID ? `PolicyRegistry${courtID}` : false),
    async () => {
      if (policyRegistry) {
        const policyFilter = policyRegistry.filters.PolicyUpdate(
          BigNumber.from(courtID),
          null,
          null
        );
        return policyRegistry
          .queryFilter(policyFilter)
          .then((events) => events[0]);
      } else throw Error;
    }
  );
};
