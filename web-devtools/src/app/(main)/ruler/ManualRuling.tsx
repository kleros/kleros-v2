"use client";
import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";

import { RULING_MODE } from "consts";
import { usePublicClient } from "wagmi";

import { Button } from "@kleros/ui-components-library";

import { useRulerContext } from "context/RulerContext";
import {
  useSimulateKlerosCoreRulerChangeRulingModeToManual,
  useSimulateKlerosCoreRulerExecuteRuling,
  useWriteKlerosCoreRulerChangeRulingModeToManual,
  useWriteKlerosCoreRulerExecuteRuling,
} from "hooks/contracts/generated";
import { isUndefined } from "utils/isUndefined";
import { wrapWithToast } from "utils/wrapWithToast";

import { EnsureChain } from "components/EnsureChain";
import LabeledInput from "components/LabeledInput";

import Header from "./Header";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const SelectContainer = styled.div`
  display: flex;
  gap: 16px;
  justify-content: space-around;
  flex-wrap: wrap;
`;

const ManualRuling: React.FC = () => {
  const [isSending, setIsSending] = useState<boolean>(false);
  const { arbitrable, arbitrableSettings } = useRulerContext();
  const [tie, setTie] = useState(arbitrableSettings?.tied ?? false);
  const [overriden, setOverriden] = useState(arbitrableSettings?.overridden ?? false);
  const [ruling, setRuling] = useState(arbitrableSettings?.ruling);
  const [disputeId, setDisputeId] = useState<number>();

  const publicClient = usePublicClient();

  const { data: manualModeConfig } = useSimulateKlerosCoreRulerChangeRulingModeToManual({
    query: {
      enabled: arbitrableSettings?.rulingMode !== RULING_MODE.Manual && !isUndefined(arbitrable),
    },
    args: [arbitrable as `0x${string}`],
  });
  const { writeContractAsync: changeToManualMode } = useWriteKlerosCoreRulerChangeRulingModeToManual();

  const isDisabled = useMemo(() => {
    return isUndefined(disputeId) || isUndefined(ruling) || isUndefined(arbitrable);
  }, [disputeId, ruling, arbitrable]);

  const {
    data: executeConfig,
    isLoading: isLoadingExecuteConfig,
    isError,
  } = useSimulateKlerosCoreRulerExecuteRuling({
    query: {
      enabled: arbitrableSettings?.rulingMode === RULING_MODE.Manual && !isUndefined(arbitrable) && !isDisabled,
    },
    args: [BigInt(disputeId ?? 0), BigInt(ruling ?? 0), tie, overriden],
  });

  const { writeContractAsync: executeRuling } = useWriteKlerosCoreRulerExecuteRuling();

  const handleRuling = useCallback(async () => {
    if (!publicClient) return;
    if (arbitrableSettings?.rulingMode !== RULING_MODE.Manual) {
      if (!manualModeConfig) return;
      setIsSending(true);

      wrapWithToast(async () => await changeToManualMode(manualModeConfig.request), publicClient)
        .then(async (res) => {
          if (res.status && executeConfig) {
            wrapWithToast(async () => await executeRuling(executeConfig.request), publicClient);
          }
        })
        .finally(() => setIsSending(false));
    } else if (executeConfig) {
      setIsSending(true);

      wrapWithToast(async () => await executeRuling(executeConfig.request), publicClient).finally(() =>
        setIsSending(false)
      );
    }
  }, [publicClient, executeConfig, manualModeConfig, arbitrableSettings, changeToManualMode, executeRuling]);

  return (
    <Container>
      <Header text="Manual Ruling" />
      <SelectContainer>
        <LabeledInput
          label="Dispute ID"
          type="number"
          value={disputeId}
          onChange={(e) => setDisputeId(Number(e.target.value))}
        />

        <LabeledInput label="Ruling" type="number" value={ruling} onChange={(e) => setRuling(Number(e.target.value))} />
        <LabeledInput label="Tie" inputType="checkbox" checked={tie} onChange={() => setTie((prev) => !prev)} />
        <LabeledInput
          label="Overidden"
          inputType="checkbox"
          checked={overriden}
          onChange={() => setOverriden((prev) => !prev)}
        />
      </SelectContainer>
      <EnsureChain>
        <Button
          text="Rule"
          onClick={handleRuling}
          isLoading={isLoadingExecuteConfig || isSending}
          disabled={isDisabled || isError || isSending || isLoadingExecuteConfig}
        />
      </EnsureChain>
    </Container>
  );
};

export default ManualRuling;
