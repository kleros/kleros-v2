import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
import { usePublicClient } from "wagmi";

import { Button } from "@kleros/ui-components-library";

import useTransactionBatcher, { type TransactionBatcherConfig } from "hooks/useTransactionBatcher";
import { getLocalRounds } from "utils/getLocalRounds";
import { wrapWithToast } from "utils/wrapWithToast";

import { useClassicAppealQuery } from "queries/useClassicAppealQuery";
import useDisputeMaintenanceQuery from "queries/useDisputeMaintenanceQuery";

import { getDisputeKitConfigByKitId } from "src/dispute-kits";
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
  const { t } = useTranslation();
  const [isSending, setIsSending] = useState(false);
  const [contractConfigs, setContractConfigs] = useState<TransactionBatcherConfig>();
  const publicClient = usePublicClient();

  const { data: maintenanceData, isLoading: isLoadingMaintenance } = useDisputeMaintenanceQuery(id);
  const { data: appealData, isLoading: isLoadingAppeal } = useClassicAppealQuery(id);

  const localRounds = useMemo(() => getLocalRounds(appealData?.dispute?.disputeKitDispute), [appealData]);

  const withdrawableContributions = useMemo(
    () => maintenanceData?.contributions.filter((contribution) => !contribution.rewardWithdrawn) ?? [],
    [maintenanceData]
  );

  const nothingToWithdraw = useMemo(
    () =>
      withdrawableContributions.length === 0 ||
      (localRounds.length > 0 && localRounds.every((round) => round.appealFeesDispersed)),
    [withdrawableContributions, localRounds]
  );

  useEffect(() => {
    if (isUndefined(id) || isUndefined(roundIndex)) return;

    const argsArr: TransactionBatcherConfig = [];

    for (const contribution of withdrawableContributions) {
      // localDispute.id format: "disputeKitID-coreDisputeID"
      const disputeKitID = contribution.localRound?.localDispute?.id?.split("-")[0];
      if (isUndefined(disputeKitID)) continue;

      const config = getDisputeKitConfigByKitId(disputeKitID);
      if (isUndefined(config)) continue;

      argsArr.push({
        abi: config.disputeKitAbi,
        address: config.address,
        functionName: "withdrawFeesAndRewards",
        args: [BigInt(id), contribution.contributor.id, BigInt(contribution.choice)],
      });
    }

    setContractConfigs(argsArr);
  }, [id, roundIndex, withdrawableContributions]);

  const {
    executeBatch,
    batchConfig,
    isLoading: isLoadingConfig,
    isError,
  } = useTransactionBatcher(contractConfigs, {
    enabled: !isUndefined(period) && period === Period.Execution && Boolean(ruled) && !nothingToWithdraw,
  });

  const isLoading = useMemo(
    () => isLoadingConfig || isLoadingMaintenance || isLoadingAppeal || isSending,
    [isLoadingConfig, isLoadingMaintenance, isLoadingAppeal, isSending]
  );
  const isDisabled = useMemo(
    () => isUndefined(id) || isError || isLoading || period !== Period.Execution || nothingToWithdraw || !ruled,
    [id, isError, isLoading, period, nothingToWithdraw, ruled]
  );

  const handleClick = () => {
    if (!publicClient || !batchConfig) return;
    setIsSending(true);

    wrapWithToast(async () => await executeBatch(batchConfig), publicClient).finally(() => {
      setIsSending(false);
      setIsOpen(false);
    });
  };
  return (
    <StyledButton
      text={t("buttons.appeal_rewards")}
      small
      isLoading={isLoading}
      isDisabled={isDisabled}
      onPress={handleClick}
    />
  );
};

export default WithdrawAppealFees;
