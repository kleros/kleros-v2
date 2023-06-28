import useSWRImmutable from "swr/immutable";

export const useIPFSQuery = (ipfsPath?: string) => {
  return useSWRImmutable(
    () => (ipfsPath !== undefined ? ipfsPath : false),
    async () => {
      if (ipfsPath) {
        return fetch(`https://cloudflare-ipfs.com${ipfsPath}`).then(async (res) => await res.json());
      } else throw Error;
    }
  );
};
