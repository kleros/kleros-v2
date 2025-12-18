import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";

import { useAccount, usePublicClient } from "wagmi";

import { Button } from "@kleros/ui-components-library";

import { DEFAULT_CHAIN } from "consts/chains";
import { disputeKitClassicAbi, disputeKitClassicAddress } from "hooks/contracts/generated";
import useTransactionBatcher, { type TransactionBatcherConfig } from "hooks/useTransactionBatcher";
import { getLocalRounds } from "utils/getLocalRounds";
import { wrapWithToast } from "utils/wrapWithToast";

import { useClassicAppealQuery } from "queries/useClassicAppealQuery";
import useDisputeMaintenanceQuery from "queries/useDisputeMaintenanceQuery";

import { Period } from "src/graphql/graphql";
import { isUndefined } from "src/utils";

import { IBaseMaintenanceButton } from ".";

const StyledButton = styled(Button)`
  width: 100%;
`;

interface IWithdrawAppealFees extends IBaseMaintenanceButton {
  roundIndex?: number;
  period?: string;
  ruled?: boolean;
}

const WithdrawAppealFees: React.FC<IWithdrawAppealFees> = ({ id, roundIndex, setIsOpen, period, ruled }) => {
  const [isSending, setIsSending] = useState(false);
  const [contractConfigs, setContractConfigs] = useState<TransactionBatcherConfig>();
  const publicClient = usePublicClient();
  const { chainId } = useAccount();

  const { data: maintenanceData } = useDisputeMaintenanceQuery(id);
  const { data: appealData } = useClassicAppealQuery(id);

  const localRounds = useMemo(() => getLocalRounds(appealData?.dispute?.disputeKitDispute), [appealData]);

  const feeDispersed = useMemo(
    () =>
      localRounds ? localRounds.slice(0, localRounds.length - 1).every((round) => round.appealFeesDispersed) : false,
    [localRounds]
  );

  const filteredContributions = useMemo(() => {
    const deDuplicatedContributions = [
      ...new Set(maintenanceData?.contributions.filter((contribution) => !contribution.rewardWithdrawn)),
    ];

    return deDuplicatedContributions;
  }, [maintenanceData]);

  useEffect(() => {
    if (isUndefined(id) || isUndefined(roundIndex)) return;

    const baseArgs = {
      abi: disputeKitClassicAbi,
      address: disputeKitClassicAddress[chainId ?? DEFAULT_CHAIN],
      functionName: "withdrawFeesAndRewards",
    };

    const argsArr: TransactionBatcherConfig = [];

    for (const contribution of filteredContributions) {
      argsArr.push({
        ...baseArgs,
        args: [BigInt(id), contribution.contributor.id, contribution.choice],
      });
    }

    setContractConfigs(argsArr);
  }, [id, roundIndex, chainId, filteredContributions]);

  const {
    executeBatch,
    batchConfig,
    isLoading: isLoadingConfig,
    isError,
  } = useTransactionBatcher(contractConfigs, {
    enabled: !isUndefined(period) && period === Period.Execution && Boolean(ruled) && !feeDispersed,
  });

  const isLoading = useMemo(() => isLoadingConfig || isSending, [isLoadingConfig, isSending]);
  const isDisabled = useMemo(
    () => isUndefined(id) || isError || isLoading || period !== Period.Execution || feeDispersed || !ruled,
    [id, isError, isLoading, period, feeDispersed, ruled]
  );

  const handleClick = () => {
    if (!publicClient || !batchConfig) return;
    setIsSending(true);

    wrapWithToast(async () => await executeBatch(batchConfig), publicClient).finally(() => {
      setIsSending(false);
      setIsOpen(false);
    });
  };
  return <StyledButton text="Appeal Rewards" small isLoading={isLoading} disabled={isDisabled} onClick={handleClick} />;
};

export default WithdrawAppealFees;
