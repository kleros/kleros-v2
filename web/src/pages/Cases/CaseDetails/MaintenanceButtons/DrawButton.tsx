import React, { useMemo, useState } from "react";
import styled from "styled-components";

import { usePublicClient } from "wagmi";

import { Button } from "@kleros/ui-components-library";

import { useSimulateKlerosCoreDraw, useWriteKlerosCoreDraw } from "hooks/contracts/generated";
import { wrapWithToast } from "utils/wrapWithToast";

import useDisputeMaintenanceQuery from "queries/useDisputeMaintenanceQuery";

import { Period } from "src/graphql/graphql";
import { isUndefined } from "src/utils";

import { IBaseMaintenanceButton } from ".";

const StyledButton = styled(Button)`
  width: 100%;
`;

interface IDrawButton extends IBaseMaintenanceButton {
  numberOfVotes?: string;
  period?: string;
}

const DrawButton: React.FC<IDrawButton> = ({ id, numberOfVotes, setIsOpen, period }) => {
  const [isSending, setIsSending] = useState(false);
  const publicClient = usePublicClient();
  const { data: maintenanceData } = useDisputeMaintenanceQuery(id);

  const isDrawn = useMemo(() => maintenanceData?.dispute?.currentRound.jurorsDrawn, [maintenanceData]);

  const {
    data: drawConfig,
    isLoading: isLoadingConfig,
    isError,
  } = useSimulateKlerosCoreDraw({
    query: {
      enabled:
        !isUndefined(id) &&
        !isUndefined(numberOfVotes) &&
        !isUndefined(period) &&
        period === Period.Evidence &&
        !isDrawn,
    },
    args: [BigInt(id ?? 0), BigInt(numberOfVotes ?? 0)],
  });

  const { writeContractAsync: draw } = useWriteKlerosCoreDraw();

  const isLoading = useMemo(() => isLoadingConfig || isSending, [isLoadingConfig, isSending]);
  const isDisabled = useMemo(
    () =>
      isUndefined(id) || isUndefined(numberOfVotes) || isError || isLoading || period !== Period.Evidence || isDrawn,
    [id, numberOfVotes, isError, isLoading, period, isDrawn]
  );
  const handleClick = () => {
    if (!drawConfig || !publicClient) return;

    setIsSending(true);

    wrapWithToast(async () => await draw(drawConfig.request), publicClient).finally(() => {
      setIsSending(false);
      setIsOpen(false);
    });
  };
  return <StyledButton text="Draw" small isLoading={isLoading} disabled={isDisabled} onClick={handleClick} />;
};

export default DrawButton;
