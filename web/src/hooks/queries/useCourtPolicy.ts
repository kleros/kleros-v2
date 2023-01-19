import { usePolicyRegistryEvent } from "queries/usePolicyRegistryEvent";
import { useIPFSQuery } from "hooks/useIPFSQuery";

export const useCourtPolicy = (courtID?: string | number) => {
  const { data: courtPolicyPath } = usePolicyRegistryEvent(courtID);
  return useIPFSQuery(courtPolicyPath?.args._policy);
};
