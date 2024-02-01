import { IPFS_GATEWAY } from "consts/index";

export const getIpfsUrl = (url: string) => {
  if (url.startsWith("ipfs://")) return url;

  const formatedIPFSPath = url.startsWith("/") ? url : "/" + url;
  return `${IPFS_GATEWAY}${formatedIPFSPath}`;
};

export const getFallbackUrl = (url: string) => {
  if (url.startsWith("/ipfs/")) return url;
  else if (url.startsWith("ipfs/")) return "/" + url;
  else if (url.startsWith("ipfs://")) return url.replace("ipfs://", "/ipfs/");
  return url;
};
