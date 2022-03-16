import { useEffect } from "react";
import { ArbitrumRinkeby } from "@usedapp/core";
import { useQuery, useQueryClient } from "react-query";
import { BigNumber } from "ethers";
import { Result } from "@ethersproject/abi";
import { useConnectedContract } from "hooks/useConnectedContract";

export interface IKlerosCoreDisputeCreated {
  disputeID: BigNumber;
  arbitrable: string;
}

export const useKlerosCoreCreatedDisputesQuery = () => {
  const connectedContract = useConnectedContract(
    "KlerosCore",
    ArbitrumRinkeby.chainId
  );
  const queryClient = useQueryClient();
  const filter = connectedContract?.filters.DisputeCreation();
  const { isLoading, data } = useQuery(["KlerosCoreDisputes"], async () => {
    const disputes: IKlerosCoreDisputeCreated[] = [];
    if (connectedContract && filter) {
      await connectedContract
        .queryFilter(filter)
        .then(async (response: Result) => {
          for (const disputeEvent of response) {
            const dispute = disputeEvent.args;
            disputes.push({
              disputeID: dispute[0],
              arbitrable: dispute[1],
            });
          }
        });
    }
    return disputes.reverse();
  });
  useEffect(() => {
    if (connectedContract && filter) {
      connectedContract.on(filter, async (...dispute: Result) => {
        queryClient.setQueryData(
          "KlerosCoreDisputes",
          (oldData: IKlerosCoreDisputeCreated[]) => {
            return [
              {
                disputeID: dispute[0],
                arbitrable: dispute[1],
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

export interface IKlerosCoreDisputeInfo extends IKlerosCoreDisputeCreated {
  arbitrated: string;
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
      const disputes: IKlerosCoreDisputeInfo[] = [];
      if (rawData && klerosCoreContract)
        for (const dispute of rawData) {
          const disputeInfo = await klerosCoreContract.disputes(
            dispute.disputeID
          );
          const roundInfo = await klerosCoreContract.getRoundInfo(
            dispute.disputeID,
            0
          );
          disputes.push({
            ruling: await klerosCoreContract.currentRuling(dispute.disputeID),
            nbRounds: await klerosCoreContract.getNumberOfRounds(
              dispute.disputeID
            ),
            subcourtInfo: await klerosCoreContract.courts(
              disputeInfo.subcourtID
            ),
            ...dispute,
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

type DisputeMapping = {
  [key: string]: IKlerosCoreDisputeInfo;
};

export const useKlerosCoreDisputesMappingQuery = ():
  | DisputeMapping
  | undefined => {
  const { data } = useKlerosCoreDisputesInfoQuery();
  const disputes = {};
  if (data)
    for (const dispute of data)
      disputes[dispute.disputeID.toString()] = dispute;
  return data ? disputes : undefined;
};

export const useKlerosCoreTimesPerPeriodQuery = (subcourtID?: BigNumber) => {
  const klerosCore = useConnectedContract(
    "KlerosCore",
    ArbitrumRinkeby.chainId
  );
  const { isLoading, data } = useQuery(
    [`KlerosCoreTimesPerPeriodQuery${subcourtID?.toString()}`],
    async () => {
      if (klerosCore && subcourtID)
        return await klerosCore.getTimesPerPeriod(subcourtID);
    }
  );
  return { isLoading, data };
};
