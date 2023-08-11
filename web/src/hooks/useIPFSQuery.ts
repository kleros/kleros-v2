import { useQuery } from "@tanstack/react-query";
import { isUndefined } from "utils/index";
import { IPFS_GATEWAY } from "consts/index";

export const useIPFSQuery = (ipfsPath?: string) => {
  const isEnabled = !isUndefined(ipfsPath);
  return useQuery({
    queryKey: [`IPFS${ipfsPath}`],
    enabled: isEnabled,
    staleTime: Infinity,
    queryFn: async () => {
      if (isEnabled) {
        const formatedIPFSPath = ipfsPath.startsWith("/") ? ipfsPath : "/" + ipfsPath;
        return fetch(`${IPFS_GATEWAY}${formatedIPFSPath}`).then(async (res) => await res.json());
      }
      return undefined;
    },
  });
};
