import { useQuery } from "@tanstack/react-query";
import { getContract } from "viem";
import { usePublicClient } from "wagmi";

import { klerosCoreConfig } from "hooks/contracts/generated";
import { isUndefined } from "utils/index";

export const useAppealCost = (disputeID?: string) => {
  const publicClient = usePublicClient();
  const klerosCore = getContract({
    abi: klerosCoreConfig.abi,
    address: klerosCoreConfig.address[421614],
    client: {
      public: publicClient,
    },
  });
  const isEnabled = !isUndefined(klerosCore) && !isUndefined(disputeID);
  return useQuery({
    queryKey: [`AppealCost${disputeID}`],
    enabled: isEnabled,
    staleTime: Infinity,
    queryFn: async () => {
      if (!klerosCore || typeof disputeID === "undefined") return;
      return await klerosCore.read.appealCost([BigInt(disputeID)]);
    },
  });
};
