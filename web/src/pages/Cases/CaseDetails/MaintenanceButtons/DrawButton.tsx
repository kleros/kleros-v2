import React, { useMemo, useState } from "react";
import styled from "styled-components";

import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Address } from "viem";
import { usePublicClient } from "wagmi";

import { Button } from "@kleros/ui-components-library";

import { DisputeKits } from "consts/index";
import { useSimulateKlerosCoreDraw, useWriteKlerosCoreDraw } from "hooks/contracts/generated";
import { useDisputeKitAddresses } from "hooks/useDisputeKitAddresses";
import { useSortitionModulePhase } from "hooks/useSortitionModule";
import { wrapWithToast } from "utils/wrapWithToast";

import useDisputeMaintenanceQuery from "queries/useDisputeMaintenanceQuery";

import { Period } from "src/graphql/graphql";
import { isUndefined } from "src/utils";

import { Phases } from "components/Phase";

import SetJurorsButton from "./SetJurorsButton";

import { IBaseMaintenanceButton } from ".";

const StyledButton = styled(Button)`
  width: 100%;
`;

const StyledLabel = styled.label``;

interface IDrawButton extends IBaseMaintenanceButton {
  numberOfVotes?: string;
  period?: string;
  disputeKitAddress?: Address;
}

const DrawButton: React.FC<IDrawButton> = ({ id, numberOfVotes, setIsOpen, period, disputeKitAddress }) => {
  const { t } = useTranslation();
  const publicClient = usePublicClient();
  const { disputeKitName } = useDisputeKitAddresses({ disputeKitAddress });
  const { data: maintenanceData } = useDisputeMaintenanceQuery(id);
  const { data: phase } = useSortitionModulePhase();
  const [isSending, setIsSending] = useState(false);

  const isUniversity = disputeKitName === DisputeKits.ClassicUniversity;
  const isDrawn = useMemo(() => maintenanceData?.dispute?.currentRound.jurorsDrawn, [maintenanceData]);

  const canDraw = useMemo(
    () =>
      !isUndefined(maintenanceData) &&
      !isDrawn &&
      period === Period.Evidence &&
      // university DK doesn't rely on sortition module, so we skip this check
      (isUniversity ? true : phase === Phases.drawing),
    [maintenanceData, isDrawn, phase, period, isUniversity]
  );

  const needToPassPhase = useMemo(
    () =>
      !isUniversity &&
      !isUndefined(maintenanceData) &&
      !isDrawn &&
      period === Period.Evidence &&
      phase !== Phases.drawing,
    [maintenanceData, isDrawn, phase, period, isUniversity]
  );

  const drawIterations = useMemo(
    // for uni DK, the jurors are drawn from the jurorQueue, so calling the exact number of Votes is sufficient
    () => (isUniversity ? Number(numberOfVotes ?? 0) : Math.min(100, Number(numberOfVotes ?? 0) * 4)),
    [numberOfVotes, isUniversity]
  );

  const {
    data: drawConfig,
    isLoading: isLoadingConfig,
    isError,
  } = useSimulateKlerosCoreDraw({
    query: {
      enabled: !isUndefined(id) && !isUndefined(numberOfVotes) && !isUndefined(period) && canDraw,
    },
    args: [BigInt(id ?? 0), BigInt(drawIterations)],
  });

  const { writeContractAsync: draw } = useWriteKlerosCoreDraw();

  const isLoading = useMemo(() => isLoadingConfig || isSending, [isLoadingConfig, isSending]);
  const isDisabled = useMemo(
    () => isUndefined(id) || isUndefined(numberOfVotes) || isError || isLoading || !canDraw || drawIterations <= 0,
    [id, numberOfVotes, isError, isLoading, canDraw, drawIterations]
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
      {needToPassPhase ? (
        <StyledLabel>
          {t("maintenance.jurors_drawn_in_drawing_phase")}
          <br />
          <Trans
            i18nKey="maintenance.pass_phase_here"
            components={{ anchor: <Link to="/courts/1/purpose/#maintenance" /> }}
          />
        </StyledLabel>
      ) : null}
      {isUniversity && canDraw ? <SetJurorsButton {...{ id, disputeKitAddress }} /> : null}
      <StyledButton
        text={t("buttons.draw")}
        small
        isLoading={isLoading}
        isDisabled={isDisabled}
        onPress={handleClick}
      />
    </>
  );
};

export default DrawButton;
