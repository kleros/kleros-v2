// import { useState } from "react";
// import {
//   useKlerosCore,
//   usePnkAllowance,
//   usePnkApprovalEvent,
// } from "hooks/contracts/generated";
// import { notUndefined } from "utils/index";

// export const usePNKAllowance = (user?: string | null) => {
//   const [isFetched, setIsFetched] = useState<boolean>(false);
//   const klerosCore = useKlerosCore();
//   const { data: allowance, refetch } = usePnkAllowance({
//     enabled: !isFetched && notUndefined([user, klerosCore]),
//     args: [user, klerosCore?.address],
//     onSuccess: () => setIsFetched(true),
//   });
//   usePnkApprovalEvent({
//     listener: () => refetch(),
//   });
//   return allowance;
// };

import useSWR from "swr";
import { useProvider } from "wagmi";
import { usePnk, useKlerosCore } from "hooks/contracts/generated";

export const usePNKAllowance = (user?: `0x${string}` | null) => {
  const provider = useProvider();
  const pnkContract = usePnk({ signerOrProvider: provider });
  const klerosCore = useKlerosCore();
  return useSWR(
    () => (pnkContract && user ? `PNKAllowance{user}` : false),
    async () => {
      if (pnkContract && user && klerosCore) {
        return await pnkContract.allowance(user, klerosCore.address);
      } else {
        return undefined;
      }
    }
  );
};
