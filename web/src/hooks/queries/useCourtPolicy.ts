import { useCourtPolicyURI } from "queries/useCourtPolicyURI";
import { useIPFSQuery } from "../useIPFSQuery";

export const useCourtPolicy = (courtID?: string) => {
  const { data: policyURI } = useCourtPolicyURI(courtID);
  return useIPFSQuery(policyURI?.court?.policy ?? "");
};
