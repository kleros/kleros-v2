import { useEffect } from "react";
import { ArbitrumRinkeby } from "@usedapp/core";
import { useQuery, useQueryClient } from "react-query";
import { BigNumber } from "ethers";
import { Result } from "@ethersproject/abi";
import { useConnectedContract } from "hooks/useConnectedContract";

export interface IKlerosCoreDraw {
  address: string;
  appeal: BigNumber;
  disputeID: BigNumber;
  voteID: BigNumber;
}

export const useKlerosCoreDrawsQuery = () => {
  const connectedContract = useConnectedContract(
    "KlerosCore",
    ArbitrumRinkeby.chainId
  );
  const queryClient = useQueryClient();
  const filter = connectedContract?.filters.Draw();
  const { isLoading, data } = useQuery(["KlerosCoreDraws"], async () => {
    const draws: IKlerosCoreDraw[] = [];
    if (connectedContract && filter) {
      await connectedContract
        .queryFilter(filter)
        .then(async (response: Result) => {
          for (const drawEvent of response) {
            const draw = drawEvent.args;
            draws.push({
              address: draw[0],
              disputeID: draw[1],
              appeal: draw[2],
              voteID: draw[3],
            });
          }
        });
    }
    return draws.reverse();
  });
  useEffect(() => {
    if (connectedContract && filter) {
      connectedContract.on(filter, async (...draw: Result) => {
        queryClient.setQueryData(
          "KlerosCoreDraws",
          (oldData: IKlerosCoreDraw[]): IKlerosCoreDraw[] => {
            return [
              {
                address: draw[0],
                disputeID: draw[1],
                appeal: draw[2],
                voteID: draw[3],
              },
              ...oldData,
            ];
          }
        );
      });
      return () => {
        connectedContract.removeAllListeners();
      };
    }
    return;
  }, [connectedContract, filter, queryClient]);

  return { isLoading, data, connectedContract };
};
