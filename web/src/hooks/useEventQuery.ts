import useSWR from "swr";
import { useConnectedContract } from "hooks/useConnectedContract";

export const useEventQuery = (contractName, eventName, ...filterArgs) => {
  const contract = useConnectedContract(contractName);
  return useSWR(`${contractName + eventName + filterArgs.toString()}`, () => {
    if (contract) {
      const filter = contract.filters[eventName](...filterArgs);
      return contract.queryFilter(filter);
    } else throw Error;
  });
};
