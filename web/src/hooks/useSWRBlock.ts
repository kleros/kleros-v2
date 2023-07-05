import { useEffect } from "react";
import useSWR, { Key } from "swr";
import { useWebSocketPublicClient } from "wagmi";

export const useSWRBlock = <T>(key: Key) => {
  const publicClient = useWebSocketPublicClient();
  const swrResult = useSWR<T>(key);
  useEffect(() => {
    const unwatch = publicClient?.watchBlocks({
      onBlock: () => swrResult.mutate(),
    });
    return () => unwatch?.();
  }, [publicClient, swrResult]);
  return swrResult;
};
