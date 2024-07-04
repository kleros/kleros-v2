import React, { useMemo, useState } from "react";
import styled from "styled-components";

import { usePublicClient } from "wagmi";

import { Button } from "@kleros/ui-components-library";

import { useSimulateKlerosCorePassPeriod, useWriteKlerosCorePassPeriod } from "hooks/contracts/generated";
import { wrapWithToast } from "utils/wrapWithToast";

import { isUndefined } from "src/utils";

import { IBaseMaintenaceButton } from ".";

const StyledButton = styled(Button)`
  width: 100%;
`;

type IPassPeriodButton = IBaseMaintenaceButton;

const PassPeriodButton: React.FC<IPassPeriodButton> = ({ id, setIsOpen }) => {
  const [isSending, setIsSending] = useState(false);
  const publicClient = usePublicClient();

  const {
    data: passPeriodConfig,
    isLoading: isLoadingConfig,
    isError,
  } = useSimulateKlerosCorePassPeriod({
    query: {
      enabled: !isUndefined(id),
    },
    args: [BigInt(id ?? 0)],
  });

  const { writeContractAsync: passPeriod } = useWriteKlerosCorePassPeriod();

  const isLoading = useMemo(() => isLoadingConfig || isSending, [isLoadingConfig, isSending]);
  const isDisabled = useMemo(() => isUndefined(id) || isError || isLoading, [id, isError, isLoading]);
  const handleClick = () => {
    if (!passPeriodConfig) return;

    setIsSending(true);

    wrapWithToast(async () => await passPeriod(passPeriodConfig.request), publicClient).finally(() => {
      setIsSending(false);
      setIsOpen(false);
    });
  };
  return <StyledButton text="Pass Period" small isLoading={isLoading} disabled={isDisabled} onClick={handleClick} />;
};

export default PassPeriodButton;
