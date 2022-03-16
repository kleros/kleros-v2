import { useEffect } from "react";
import { ArbitrumRinkeby } from "@usedapp/core";
import { useQuery, useQueryClient } from "react-query";
import { BigNumber } from "ethers";
import { Result } from "@ethersproject/abi";
import { useConnectedContract } from "hooks/useConnectedContract";

export interface IKlerosCoreStakeSet {
  address: string;
  subcourtID: BigNumber;
  amount: BigNumber;
  newTotalStake: BigNumber;
}

export const useKlerosCoreStakeSetQuery = () => {
  const klerosCore = useConnectedContract(
    "KlerosCore",
    ArbitrumRinkeby.chainId
  );
  const filter = klerosCore?.filters.StakeSet();
  const { isLoading, data } = useQuery(["KlerosCoreStakeSet"], async () => {
    const stakeSets: IKlerosCoreStakeSet[] = [];
    if (klerosCore && filter) {
      await klerosCore.queryFilter(filter).then(async (response: Result) => {
        for (const stakeEvent of response) {
          const stake = stakeEvent.args;
          stakeSets.push({
            address: stake[0],
            subcourtID: stake[1],
            amount: stake[2],
            newTotalStake: stake[3],
          });
        }
      });
    }
    return stakeSets.reverse();
  });
  const queryClient = useQueryClient();
  useEffect(() => {
    if (klerosCore && filter) {
      klerosCore.on(filter, async (...stake: Result) => {
        queryClient.setQueryData(
          "KlerosCoreStakeSet",
          (oldData: IKlerosCoreStakeSet[]): IKlerosCoreStakeSet[] => {
            return [
              {
                address: stake[0],
                subcourtID: stake[1],
                amount: stake[2],
                newTotalStake: stake[3],
              },
              ...oldData,
            ];
          }
        );
      });
      return () => {
        klerosCore.removeAllListeners();
      };
    }
    return;
  }, [klerosCore, filter, queryClient]);

  return { isLoading, data, klerosCore };
};

export const useKlerosCoreUniqueJurorsQuery = (): string[] => {
  const { data: rawData } = useKlerosCoreStakeSetQuery();
  const addresses = rawData?.map((stakeSet) => stakeSet.address);
  return Array.from(new Set(addresses));
};

export interface IKlerosCoreTokenAndETHShift {
  address: string;
  disputeID: BigNumber;
  tokenAmount: BigNumber;
  ethAmount: BigNumber;
}

export const useKlerosCoreTokenAndETHShiftQuery = () => {
  const klerosCore = useConnectedContract(
    "KlerosCore",
    ArbitrumRinkeby.chainId
  );
  const filter = klerosCore?.filters.TokenAndETHShift();
  const { isLoading, data } = useQuery(
    ["KlerosCoreTokenAndETHShift"],
    async () => {
      const shifts: IKlerosCoreTokenAndETHShift[] = [];
      if (klerosCore && filter) {
        await klerosCore.queryFilter(filter).then(async (response: Result) => {
          for (const shiftEvent of response) {
            const shift = shiftEvent.args;
            shifts.push({
              address: shift[0],
              disputeID: shift[1],
              tokenAmount: shift[2],
              ethAmount: shift[3],
            });
          }
        });
      }
      return shifts.reverse();
    }
  );
  const queryClient = useQueryClient();
  useEffect(() => {
    if (klerosCore && filter) {
      klerosCore.on(filter, async (...shift: Result) => {
        queryClient.setQueryData(
          "KlerosCoreTokenAndETHShift",
          (
            oldData: IKlerosCoreTokenAndETHShift[]
          ): IKlerosCoreTokenAndETHShift[] => {
            return [
              {
                address: shift[0],
                disputeID: shift[1],
                tokenAmount: shift[2],
                ethAmount: shift[3],
              },
              ...oldData,
            ];
          }
        );
      });
      return () => {
        klerosCore.removeAllListeners();
      };
    }
    return;
  }, [klerosCore, filter, queryClient]);

  return { isLoading, data, klerosCore };
};
