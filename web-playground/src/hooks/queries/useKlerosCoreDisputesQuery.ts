import { useEffect } from "react";
import { ArbitrumRinkeby } from "@usedapp/core";
import { useQuery, useQueryClient } from "react-query";
import { BigNumber } from "ethers";
import { Result } from "@ethersproject/abi";
import { useConnectedContract } from "hooks/useConnectedContract";

export const useKlerosCoreCreatedDisputesQuery = () => {
  const connectedContract = useConnectedContract(
    "KlerosCore",
    ArbitrumRinkeby.chainId
  );
  const queryClient = useQueryClient();
  const filter = connectedContract?.filters.DisputeCreation();
  const { isLoading, data } = useQuery(["KlerosCoreDisputes"], async () => {
    const disputes: Result[] = [];
    if (connectedContract && filter) {
      await connectedContract
        .queryFilter(filter)
        .then(async (response: Result) => {
          for (const disputeEvent of response) {
            disputes.push(disputeEvent.args);
          }
        });
    }
    return disputes.reverse();
  });
  useEffect(() => {
    if (connectedContract && filter) {
      connectedContract.on(filter, async (...dispute: Result) => {
        queryClient.setQueryData("outgoingDisputes", (oldData: string[]) => {
          return [dispute, ...oldData];
        });
      });
      return () => {
        connectedContract.removeAllListeners();
      };
    }
    return;
  }, [connectedContract, filter, queryClient]);

  return { isLoading, data, connectedContract };
};

export interface IDisputeInfo {
  arbitrated: string;
  disputeID: BigNumber;
  disputeKit: string;
  drawnJurors: string[];
  lastPeriodChange: BigNumber;
  nbRounds: BigNumber;
  nbVotes: BigNumber;
  penalties: BigNumber;
  period: number;
  repartitions: BigNumber;
  ruled: boolean;
  ruling: BigNumber;
  subcourtID: BigNumber;
  subcourtInfo: {
    alpha: BigNumber;
    feeForJuror: BigNumber;
    hiddenVotes: boolean;
    jurorsForCourtJump: BigNumber;
    minStake: BigNumber;
    parent: BigNumber;
    supportedDisputeKits: BigNumber;
  };
  tokensAtStakePerJuror: BigNumber;
  totalFeesForJurors: BigNumber;
}

export const useKlerosCoreDisputesInfoQuery = () => {
  const { data: rawData, connectedContract: klerosCoreContract } =
    useKlerosCoreCreatedDisputesQuery();
  const { isLoading, data } = useQuery(
    ["KlerosCoreDisputesInfo"],
    async () => {
      const disputes: IDisputeInfo[] = [];
      if (rawData && klerosCoreContract)
        for (const [disputeID] of rawData) {
          const disputeInfo = await klerosCoreContract.disputes(disputeID);
          const roundInfo = await klerosCoreContract.getRoundInfo(disputeID, 0);
          disputes.push({
            disputeID,
            ruling: await klerosCoreContract.currentRuling(disputeID),
            nbRounds: await klerosCoreContract.getNumberOfRounds(disputeID),
            subcourtInfo: await klerosCoreContract.courts(
              disputeInfo.subcourtID
            ),
            ...roundInfo,
            ...disputeInfo,
          });
        }
      return disputes;
    },
    {
      enabled: Boolean(rawData),
    }
  );
  return { isLoading, data, rawData };
};
