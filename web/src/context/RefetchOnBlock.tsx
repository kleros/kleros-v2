import React, { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";

const useRefetchOnBlock = () => {
  const queryClient = useQueryClient();
  const publicClient = usePublicClient();

  useEffect(() => {
    const unwatch = publicClient?.watchBlocks({
      onBlock: (block) => {
        if (block.number % BigInt(10) === BigInt(0)) queryClient.invalidateQueries(["refetchOnBlock"]);
      },
    });
    return () => unwatch?.();
  }, [publicClient, queryClient]);
};

const RefetchOnBlock = () => {
  useRefetchOnBlock();
  return <></>;
};

export default RefetchOnBlock;
