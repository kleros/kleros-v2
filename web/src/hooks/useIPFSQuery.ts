import { useQuery } from "@tanstack/react-query";
import { isUndefined } from "utils/index";

export const useIPFSQuery = (ipfsPath?: string) => {
  const isEnabled = !isUndefined(ipfsPath);
  return useQuery({
    queryKey: [`IPFS${ipfsPath}`],
    enabled: isEnabled,
    staleTime: Infinity,
    queryFn: async () => {
      if (isEnabled) {
        return fetch(`https://cloudflare-ipfs.com${ipfsPath}`).then(async (res) => await res.json());
      }
      return undefined;
    },
  });
};
