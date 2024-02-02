import { useQuery } from "@tanstack/react-query";
import { isUndefined } from "utils/index";
import { getIpfsUrl } from "utils/getIpfsUrl";

export const useIPFSQuery = (ipfsPath?: string) => {
  const isEnabled = !isUndefined(ipfsPath);
  return useQuery({
    queryKey: [`IPFS${ipfsPath}`],
    enabled: isEnabled,
    staleTime: Infinity,
    queryFn: async () => {
      if (isEnabled) {
        return fetch(getIpfsUrl(ipfsPath)).then(async (res) => await res.json());
      }
      return undefined;
    },
  });
};
