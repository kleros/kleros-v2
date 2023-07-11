import useSWRImmutable from "swr/immutable";

export const useIPFSQuery = (ipfsPath?: string) => {
  return useSWRImmutable(
    () => (ipfsPath !== undefined ? ipfsPath : false),
    async () => {
      if (ipfsPath) {
        const formatedIPFSPath = ipfsPath.startsWith("/") ? ipfsPath : "/" + ipfsPath;
        return fetch(`https://cdn.kleros.link${formatedIPFSPath}`).then(async (res) => await res.json());
      } else throw Error;
    }
  );
};
