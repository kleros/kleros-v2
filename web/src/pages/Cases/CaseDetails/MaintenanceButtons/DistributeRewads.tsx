import React, { useMemo, useState } from "react";
import styled from "styled-components";

import { usePublicClient } from "wagmi";

import { Button } from "@kleros/ui-components-library";

import { useSimulateKlerosCoreExecute, useWriteKlerosCoreExecute } from "hooks/contracts/generated";
import { wrapWithToast } from "utils/wrapWithToast";

import { isUndefined } from "src/utils";

import { IBaseMaintenaceButton } from ".";

const StyledButton = styled(Button)`
  width: 100%;
`;

interface IDistributeRewards extends IBaseMaintenaceButton {
  numberOfVotes?: string;
  roundIndex?: string;
}

const DistributeRewards: React.FC<IDistributeRewards> = ({ id, numberOfVotes, roundIndex, setIsOpen }) => {
  const [isSending, setIsSending] = useState(false);
  const publicClient = usePublicClient();

  const {
    data: executeConfig,
    isLoading: isLoadingConfig,
    isError,
  } = useSimulateKlerosCoreExecute({
    query: {
      enabled: !isUndefined(id) && !isUndefined(numberOfVotes) && !isUndefined(roundIndex),
    },
    args: [BigInt(id ?? 0), BigInt(roundIndex ?? 0), BigInt(numberOfVotes ?? 0)],
  });

  const { writeContractAsync: execute } = useWriteKlerosCoreExecute();

  const isLoading = useMemo(() => isLoadingConfig || isSending, [isLoadingConfig, isSending]);
  const isDisabled = useMemo(
    () => isUndefined(id) || isUndefined(numberOfVotes) || isError || isLoading,
    [id, numberOfVotes, isError, isLoading]
  );
  const handleClick = () => {
    if (!executeConfig) return;

    setIsSending(true);

    wrapWithToast(async () => await execute(executeConfig.request), publicClient).finally(() => {
      setIsOpen(false);
    });
  };
  return <StyledButton text="Rewards" small isLoading={isLoading} disabled={isDisabled} onClick={handleClick} />;
};

export default DistributeRewards;
