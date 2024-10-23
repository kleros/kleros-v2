import React, { useMemo, useState } from "react";
import styled from "styled-components";

import { usePublicClient } from "wagmi";

import { Button } from "@kleros/ui-components-library";

import {
  useReadSortitionModuleDisputesWithoutJurors,
  useSimulateSortitionModule,
  useWriteSortitionModule,
} from "hooks/contracts/generated";
import {
  useReadSortitionModuleLastPhaseChange,
  useReadSortitionModuleMaxDrawingTime,
  useReadSortitionModuleMinStakingTime,
  useSortitionModulePhase,
} from "hooks/useSortitionModule";
import { wrapWithToast } from "utils/wrapWithToast";

import { isUndefined } from "src/utils";

import { Phases } from "components/Phase";

import { IBaseStakeMaintenanceButton } from ".";

const StyledButton = styled(Button)`
  width: 100%;
`;

type IPassPhaseButton = IBaseStakeMaintenanceButton;

const PassPhaseButton: React.FC<IPassPhaseButton> = ({ setIsOpen }) => {
  const [isSending, setIsSending] = useState(false);
  const publicClient = usePublicClient();
  const { data: phase } = useSortitionModulePhase();
  const { data: lastPhaseChange } = useReadSortitionModuleLastPhaseChange();
  const { data: minStakingTime } = useReadSortitionModuleMinStakingTime();
  const { data: maxDrawingTime } = useReadSortitionModuleMaxDrawingTime();
  const { data: disputeWithoutJurors } = useReadSortitionModuleDisputesWithoutJurors();

  const canChangePhase = useMemo(() => {
    if (
      isUndefined(phase) ||
      isUndefined(lastPhaseChange) ||
      isUndefined(minStakingTime) ||
      isUndefined(maxDrawingTime) ||
      isUndefined(disputeWithoutJurors)
    )
      return false;

    const now = Math.floor(Date.now() / 1000);
    switch (phase) {
      case Phases.staking:
        return BigInt(now) - lastPhaseChange >= minStakingTime;
      case Phases.drawing:
        return disputeWithoutJurors === 0n || BigInt(now) - lastPhaseChange >= maxDrawingTime;
      default:
        return true;
    }
  }, [phase, lastPhaseChange, minStakingTime, maxDrawingTime, disputeWithoutJurors]);

  const {
    data: passPhaseConfig,
    isLoading: isLoadingConfig,
    isError,
  } = useSimulateSortitionModule({
    query: {
      enabled: canChangePhase,
    },
    // eslint-disable-next-line
    // @ts-ignore
    functionName: "passPhase",
  });

  const { writeContractAsync: passPhase } = useWriteSortitionModule();

  const isLoading = useMemo(() => isLoadingConfig || isSending, [isLoadingConfig, isSending]);
  const isDisabled = useMemo(() => isError || isLoading || !canChangePhase, [isError, isLoading, canChangePhase]);
  const handleClick = () => {
    if (!passPhaseConfig || !publicClient || !passPhase) return;

    setIsSending(true);

    wrapWithToast(async () => await passPhase(passPhaseConfig.request), publicClient).finally(() => {
      setIsSending(false);
      setIsOpen(false);
    });
  };
  return <StyledButton text="Pass Phase" small isLoading={isLoading} disabled={isDisabled} onClick={handleClick} />;
};

export default PassPhaseButton;
