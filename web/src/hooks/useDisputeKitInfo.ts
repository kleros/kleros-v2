import { useMemo } from "react";

import { Address } from "viem";

import { getDisputeKitConfigByAddress, getDisputeKitConfigByKitId } from "src/dispute-kits";
import { isUndefined } from "src/utils";

type UseDisputeKitInfoProps =
  | { disputeKitAddress?: Address; disputeKitId?: never }
  | { disputeKitAddress?: never; disputeKitId?: number | string | bigint };

/** Provides the info for DisputeKit given either the on-chain address or dispute kit id
 * @remarks this will serve as a bridge, between config and UI, translating the keys on features too in future
 */
export const useDisputeKitInfo = (props: UseDisputeKitInfoProps) => {
  const { disputeKitAddress, disputeKitId } = props;

  const disputeKit = useMemo(() => {
    if ("disputeKitAddress" in props && !isUndefined(disputeKitAddress)) {
      return getDisputeKitConfigByAddress(disputeKitAddress);
    }

    if ("disputeKitId" in props && !isUndefined(disputeKitId)) {
      return getDisputeKitConfigByKitId(disputeKitId);
    }

    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disputeKitAddress, disputeKitId]);

  return disputeKit;
};
