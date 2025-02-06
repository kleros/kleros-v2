import React, { useMemo, useState } from "react";
import styled from "styled-components";

import { Link } from "react-router-dom";
import { isAddress } from "viem";
import { usePublicClient } from "wagmi";

import { Button, Field } from "@kleros/ui-components-library";

import { useSimulateKlerosCoreDraw, useWriteKlerosCoreDraw } from "hooks/contracts/generated";
import { useSortitionModulePhase } from "hooks/useSortitionModule";
import { wrapWithToast } from "utils/wrapWithToast";

import useDisputeMaintenanceQuery from "queries/useDisputeMaintenanceQuery";

import { isKlerosUniversity } from "src/consts";
import { Period } from "src/graphql/graphql";
import { isUndefined } from "src/utils";

import { Phases } from "components/Phase";

import { IBaseMaintenanceButton } from ".";

const StyledButton = styled(Button)`
  width: 100%;
`;

const StyledLabel = styled.label``;
interface IDrawButton extends IBaseMaintenanceButton {
  numberOfVotes?: string;
  period?: string;
}

const isUniversity = isKlerosUniversity();

const DrawButton: React.FC<IDrawButton> = ({ id, numberOfVotes, setIsOpen, period }) => {
  const publicClient = usePublicClient();
  const { data: maintenanceData } = useDisputeMaintenanceQuery(id);
  const { data: phase } = useSortitionModulePhase();
  const [isSending, setIsSending] = useState(false);
  const [drawJuror, setDrawJuror] = useState("");

  const isDrawn = useMemo(() => maintenanceData?.dispute?.currentRound.jurorsDrawn, [maintenanceData]);

  const canDraw = useMemo(
    () =>
      !isUndefined(maintenanceData) &&
      !isDrawn &&
      period === Period.Evidence &&
      (isUniversity ? true : phase === Phases.drawing),
    [maintenanceData, isDrawn, phase, period, isUniversity]
  );

  const needToPassPhase = useMemo(
    () => !isUndefined(maintenanceData) && !isDrawn && period === Period.Evidence && phase !== Phases.drawing,
    [maintenanceData, isDrawn, phase, period]
  );

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
        canDraw &&
        (isUniversity ? isAddress(drawJuror) : true),
    },
    // eslint-disable-next-line
    // @ts-ignore
    args: [BigInt(id ?? 0), isUniversity ? drawJuror : BigInt(numberOfVotes ?? 0)],
  });

  const { writeContractAsync: draw } = useWriteKlerosCoreDraw();

  const isLoading = useMemo(() => isLoadingConfig || isSending, [isLoadingConfig, isSending]);
  const isDisabled = useMemo(
    () =>
      isUndefined(id) ||
      isUndefined(numberOfVotes) ||
      isError ||
      isLoading ||
      !canDraw ||
      (isUniversity && !isAddress(drawJuror)),
    [id, numberOfVotes, isError, isLoading, canDraw, isUniversity, drawJuror]
  );
  const handleClick = () => {
    if (!drawConfig || !publicClient) return;

    setIsSending(true);

    wrapWithToast(async () => await draw(drawConfig.request), publicClient).finally(() => {
      setIsSending(false);
      setIsOpen(false);
    });
  };
  return (
    <>
      {needToPassPhase && !isUniversity ? (
        <StyledLabel>
          Jurors can be drawn in <small>drawing</small> phase.
          <br /> Pass phase <Link to="/courts/1/purpose/#maintenance">here</Link>.
        </StyledLabel>
      ) : null}
      {isUniversity && canDraw ? (
        <Field placeholder="Juror Address" onChange={(e) => setDrawJuror(e.target.value)} value={drawJuror} />
      ) : null}
      <StyledButton text="Draw" small isLoading={isLoading} disabled={isDisabled} onClick={handleClick} />
    </>
  );
};

export default DrawButton;
