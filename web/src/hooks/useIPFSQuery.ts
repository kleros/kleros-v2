import { useQuery } from "@tanstack/react-query";
import { isUndefined } from "utils/index";
import { IPFS_GATEWAY } from "consts/index";
import { getFallbackUrl } from "utils/getIpfsUrl";

export const useIPFSQuery = (ipfsPath?: string) => {
  const isEnabled = !isUndefined(ipfsPath);
  return useQuery({
    queryKey: [`IPFS${ipfsPath}`],
    enabled: isEnabled,
    staleTime: Infinity,
    queryFn: async () => {
      if (isEnabled) {
        const formatedIPFSPath = getFallbackUrl(ipfsPath);
        return fetch(`${IPFS_GATEWAY}${formatedIPFSPath}`).then(async (res) => await res.json());
      }
      return undefined;
    },
  });
};
