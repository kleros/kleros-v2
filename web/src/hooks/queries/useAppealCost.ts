import { useQuery } from "@tanstack/react-query";
import { getContract } from "viem";
import { usePublicClient } from "wagmi";

import { DEFAULT_CHAIN } from "consts/chains";
import { klerosCoreConfig } from "hooks/contracts/generated";
import { isUndefined } from "utils/index";

export const useAppealCost = (disputeID?: string) => {
  const publicClient = usePublicClient();
  const isEnabled = !isUndefined(publicClient) && !isUndefined(disputeID);
  return useQuery({
    queryKey: [`AppealCost${disputeID}`],
    enabled: isEnabled,
    staleTime: Infinity,
    queryFn: async () => {
      if (!publicClient || isUndefined(disputeID)) return;
      const chainKey = DEFAULT_CHAIN.id as keyof typeof klerosCoreConfig.address;
      const klerosCore = getContract({
        abi: klerosCoreConfig.abi,
        address: klerosCoreConfig.address[chainKey],
        client: { public: publicClient },
      });
      return await klerosCore.read.appealCost([BigInt(disputeID)]);
    },
  });
};
