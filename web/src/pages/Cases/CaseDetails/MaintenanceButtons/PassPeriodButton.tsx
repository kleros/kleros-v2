import React, { useMemo, useState } from "react";
import styled from "styled-components";

import { usePublicClient } from "wagmi";

import { Button } from "@kleros/ui-components-library";

import { useSimulateKlerosCorePassPeriod, useWriteKlerosCorePassPeriod } from "hooks/contracts/generated";
import { wrapWithToast } from "utils/wrapWithToast";

import useDisputeMaintenanceQuery from "queries/useDisputeMaintenanceQuery";

import { Period } from "src/graphql/graphql";
import { isUndefined } from "src/utils";

import { IBaseMaintenanceButton } from ".";

const StyledButton = styled(Button)`
  width: 100%;
`;

interface IPassPeriodButton extends IBaseMaintenanceButton {
  period?: string;
}

const PassPeriodButton: React.FC<IPassPeriodButton> = ({ id, setIsOpen, period }) => {
  const [isSending, setIsSending] = useState(false);
  const publicClient = usePublicClient();
  const { data: maintenanceData } = useDisputeMaintenanceQuery(id);

  const isDrawn = useMemo(() => maintenanceData?.dispute?.currentRound.jurorsDrawn, [maintenanceData]);

  const {
    data: passPeriodConfig,
    isLoading: isLoadingConfig,
    isError,
  } = useSimulateKlerosCorePassPeriod({
    query: {
      enabled:
        !isUndefined(id) &&
        !isUndefined(period) &&
        period !== Period.Execution &&
        !(period === Period.Evidence && !isDrawn),
    },
    args: [BigInt(id ?? 0)],
  });

  const { writeContractAsync: passPeriod } = useWriteKlerosCorePassPeriod();

  const isLoading = useMemo(() => isLoadingConfig || isSending, [isLoadingConfig, isSending]);
  const isDisabled = useMemo(
    () =>
      isUndefined(id) ||
      isError ||
      isLoading ||
      period === Period.Execution ||
      (period === Period.Evidence && !isDrawn),
    [id, isError, isLoading, period, isDrawn]
  );
  const handleClick = () => {
    if (!passPeriodConfig || !publicClient) return;

    setIsSending(true);

    wrapWithToast(async () => await passPeriod(passPeriodConfig.request), publicClient).finally(() => {
      setIsSending(false);
      setIsOpen(false);
    });
  };
  return <StyledButton text="Pass Period" small isLoading={isLoading} disabled={isDisabled} onClick={handleClick} />;
};

export default PassPeriodButton;
