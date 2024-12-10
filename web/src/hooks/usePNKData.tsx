import { useAccount } from "wagmi";

import { DEFAULT_CHAIN } from "consts/chains";

import { REFETCH_INTERVAL } from "src/consts";
import { isUndefined } from "src/utils";

import {
  klerosCoreAddress,
  useReadPnkAllowance,
  useReadPnkBalanceOf,
  useReadSortitionModuleGetJurorBalance,
} from "./contracts/generated";

interface UsePnkDataParams {
  courtId?: string;
}

/**
 * @description hook to provide user's pnk data. (pnk balance, pnk allowance, jurorBalance for provided courtId)
 * @param param0 optional court Id to fetch juror balance for. Defaults to 0
 */
export const usePnkData = ({ courtId = "0" }: UsePnkDataParams) => {
  const { address } = useAccount();
  const queryConfig = {
    enabled: !isUndefined(address),
    refetchInterval: REFETCH_INTERVAL,
  };

  const { data: balance } = useReadPnkBalanceOf({
    query: queryConfig,
    args: [address!],
  });

  const { data: jurorBalance } = useReadSortitionModuleGetJurorBalance({
    query: queryConfig,
    args: [address ?? "0x", BigInt(courtId)],
  });

  const { data: allowance, refetch: refetchAllowance } = useReadPnkAllowance({
    query: queryConfig,
    args: [address ?? "0x", klerosCoreAddress[DEFAULT_CHAIN]],
  });

  return { balance, jurorBalance, allowance, refetchAllowance };
};
