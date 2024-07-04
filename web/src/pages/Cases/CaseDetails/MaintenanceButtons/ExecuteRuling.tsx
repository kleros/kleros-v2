import React, { useMemo, useState } from "react";
import styled from "styled-components";

import { usePublicClient } from "wagmi";

import { Button } from "@kleros/ui-components-library";

import { useSimulateKlerosCoreExecuteRuling, useWriteKlerosCoreExecuteRuling } from "hooks/contracts/generated";
import { wrapWithToast } from "utils/wrapWithToast";

import { isUndefined } from "src/utils";

import { IBaseMaintenaceButton } from ".";

const StyledButton = styled(Button)`
  width: 100%;
`;

type IExecuteRulingButton = IBaseMaintenaceButton;

const ExecuteRulingButton: React.FC<IExecuteRulingButton> = ({ id, setIsOpen }) => {
  const [isSending, setIsSending] = useState(false);
  const publicClient = usePublicClient();

  const {
    data: ruleConfig,
    isLoading: isLoadingConfig,
    isError,
  } = useSimulateKlerosCoreExecuteRuling({
    query: {
      enabled: !isUndefined(id),
    },
    args: [BigInt(id ?? 0)],
  });

  const { writeContractAsync: rule } = useWriteKlerosCoreExecuteRuling();

  const isLoading = useMemo(() => isLoadingConfig || isSending, [isLoadingConfig, isSending]);
  const isDisabled = useMemo(() => isUndefined(id) || isError || isLoading, [id, isError, isLoading]);
  const handleClick = () => {
    if (!ruleConfig) return;

    setIsSending(true);

    wrapWithToast(async () => await rule(ruleConfig.request), publicClient).finally(() => {
      setIsSending(false);
      setIsOpen(false);
    });
  };
  return <StyledButton text="Rule" small isLoading={isLoading} disabled={isDisabled} onClick={handleClick} />;
};

export default ExecuteRulingButton;
