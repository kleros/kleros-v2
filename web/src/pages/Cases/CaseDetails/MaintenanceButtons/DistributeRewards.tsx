import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";

import { useAccount, usePublicClient } from "wagmi";

import { Button } from "@kleros/ui-components-library";

import { DEFAULT_CHAIN } from "consts/chains";
import { klerosCoreAbi, klerosCoreAddress } from "hooks/contracts/generated";
import useTransactionBatcher, { type TransactionBatcherConfig } from "hooks/useTransactionBatcher";
import { wrapWithToast } from "utils/wrapWithToast";

import useDisputeMaintenanceQuery from "queries/useDisputeMaintenanceQuery";

import { Period } from "src/graphql/graphql";
import { isUndefined } from "src/utils";

import { IBaseMaintenanceButton } from ".";

const StyledButton = styled(Button)`
  width: 100%;
`;

interface IDistributeRewards extends IBaseMaintenanceButton {
  roundIndex?: string;
  period?: string;
}

const DistributeRewards: React.FC<IDistributeRewards> = ({ id, roundIndex, setIsOpen, period }) => {
  const [isSending, setIsSending] = useState(false);
  const [contractConfigs, setContractConfigs] = useState<TransactionBatcherConfig>();
  const publicClient = usePublicClient();
  const { chainId } = useAccount();

  const { data: maintenanceData } = useDisputeMaintenanceQuery(id);

  const rewardsDispersed = useMemo(
    () => maintenanceData?.dispute?.rounds.every((round) => round.jurorRewardsDispersed),
    [maintenanceData]
  );

  useEffect(() => {
    const rounds = maintenanceData?.dispute?.rounds;
    if (isUndefined(id) || isUndefined(roundIndex) || isUndefined(rounds)) return;

    const baseArgs = {
      abi: klerosCoreAbi,
      address: klerosCoreAddress[chainId ?? DEFAULT_CHAIN],
      functionName: "execute",
    };

    const argsArr: TransactionBatcherConfig = [];

    for (const round of rounds) {
      argsArr.push({
        ...baseArgs,
        args: [BigInt(id), BigInt(round.id.split("-")[1]), BigInt(round.nbVotes) * BigInt(2)],
      });
    }

    setContractConfigs(argsArr);
  }, [id, roundIndex, chainId, maintenanceData]);

  const {
    executeBatch,
    batchConfig,
    isLoading: isLoadingConfig,
    isError,
  } = useTransactionBatcher(contractConfigs, {
    enabled: !isUndefined(period) && period === Period.Execution && !rewardsDispersed,
  });

  const isLoading = useMemo(() => isLoadingConfig || isSending, [isLoadingConfig, isSending]);
  const isDisabled = useMemo(
    () => isUndefined(id) || isError || isLoading || period !== Period.Execution || rewardsDispersed,
    [id, isError, isLoading, period, rewardsDispersed]
  );

  const handleClick = () => {
    if (!publicClient || !batchConfig) return;
    setIsSending(true);

    wrapWithToast(async () => await executeBatch(batchConfig), publicClient).finally(() => {
      setIsSending(false);
      setIsOpen(false);
    });
  };
  return <StyledButton text="Juror Rewards" small isLoading={isLoading} disabled={isDisabled} onClick={handleClick} />;
};

export default DistributeRewards;
