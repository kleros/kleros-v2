import { useEffect, useState } from "react";
import { utils } from "ethers";

import { KlerosCore } from "@kleros/kleros-v2-contracts/typechain-types/src/arbitration/KlerosCore";
import { useConnectedContract } from "./useConnectedContract";

interface IJurorBalance {
  staked: string;
  locked: string;
}

export function useJurorBalance(
  address: string | undefined | null,
  courtId: string | undefined
): IJurorBalance {
  const klerosCore = useConnectedContract("KlerosCore") as KlerosCore;
  const [balance, setBalance] = useState<IJurorBalance>({
    staked: "0",
    locked: "0",
  });

  useEffect(() => {
    if (address != null && courtId != undefined) {
      klerosCore.getJurorBalance(address, courtId).then((balance) => {
        setBalance({
          staked: utils.formatEther(balance.staked),
          locked: utils.formatEther(balance.locked),
        });
      });
    }
  }, [address, courtId]); // including klerosClore to deps causes infinite loop

  return balance;
}
