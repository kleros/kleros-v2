import React, { useMemo, useState } from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
import { Address, isAddress } from "viem";
import { usePublicClient } from "wagmi";

import { Button, Field } from "@kleros/ui-components-library";

import AddressExplorerLink from "~src/components/AddressExplorerLink";

import {
  useReadDisputeKitClassicUniversityGetJurors,
  useReadDisputeKitClassicUniversityInstructor,
  useSimulateDisputeKitClassicUniversitySetJurors,
  useWriteDisputeKitClassicUniversitySetJurors,
} from "hooks/contracts/generated";
import { wrapWithToast } from "utils/wrapWithToast";

import { isUndefined } from "src/utils";

import { IBaseMaintenanceButton } from ".";

const InstructorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: ${({ theme }) => theme.secondaryText};
`;

const InstructorLabel = styled.span`
  color: ${({ theme }) => theme.primaryText};
`;

const JurorsQueueContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  color: ${({ theme }) => theme.secondaryText};
`;

const JurorsQueueLabel = styled.span`
  color: ${({ theme }) => theme.primaryText};
`;

const JurorsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px 8px;
`;

const StyledButton = styled(Button)`
  width: 100%;
`;

interface ISetJurorsButton extends Pick<IBaseMaintenanceButton, "id"> {
  disputeKitAddress?: string;
}

const parseJurorAddresses = (input: string): Address[] => {
  return input
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((addr) => isAddress(addr));
};

const SetJurorsButton: React.FC<ISetJurorsButton> = ({ id, disputeKitAddress }) => {
  const { t } = useTranslation();
  const publicClient = usePublicClient();
  const [isSending, setIsSending] = useState(false);
  const [jurorsInput, setJurorsInput] = useState("");

  const jurors = useMemo(() => parseJurorAddresses(jurorsInput), [jurorsInput]);
  const hasValidJurors = jurors.length > 0;

  const { data: instructorAddress } = useReadDisputeKitClassicUniversityInstructor();
  const { data: jurorsInQueue, refetch: refetchJurorsInQueue } = useReadDisputeKitClassicUniversityGetJurors({
    args: [BigInt(id ?? 0)],
    query: { enabled: !isUndefined(id) },
  });

  const {
    data: setJurorsConfig,
    isLoading: isLoadingConfig,
    isError,
  } = useSimulateDisputeKitClassicUniversitySetJurors({
    query: {
      enabled: !isUndefined(id) && hasValidJurors,
    },
    args: [BigInt(id ?? 0), jurors],
  });

  const { writeContractAsync: setJurors } = useWriteDisputeKitClassicUniversitySetJurors();

  const isLoading = useMemo(() => isLoadingConfig || isSending, [isLoadingConfig, isSending]);
  const isDisabled = useMemo(
    () => isUndefined(id) || isUndefined(disputeKitAddress) || isError || isLoading || !hasValidJurors,
    [id, disputeKitAddress, isError, isLoading, hasValidJurors]
  );

  const handleClick = () => {
    if (!setJurorsConfig || !publicClient) return;

    setIsSending(true);

    wrapWithToast(async () => await setJurors(setJurorsConfig.request), publicClient).finally(() => {
      setIsSending(false);
      setJurorsInput("");
      refetchJurorsInQueue();
    });
  };

  return (
    <>
      {instructorAddress ? (
        <InstructorContainer>
          <InstructorLabel>{t("features.university_instructor")}:</InstructorLabel>
          <AddressExplorerLink address={instructorAddress} />
        </InstructorContainer>
      ) : null}

      {jurorsInQueue && jurorsInQueue.length > 0 ? (
        <JurorsQueueContainer>
          <JurorsQueueLabel>{t("maintenance.jurors_in_queue", { count: jurorsInQueue.length })}</JurorsQueueLabel>
          <JurorsList>
            {jurorsInQueue.map((address) => (
              <AddressExplorerLink key={address} {...{ address }} />
            ))}
          </JurorsList>
        </JurorsQueueContainer>
      ) : null}

      <Field
        placeholder={t("forms.placeholders.juror_addresses_comma_separated")}
        onChange={(e) => setJurorsInput(e.target.value)}
        value={jurorsInput}
      />
      <StyledButton
        text={t("buttons.set_jurors")}
        small
        isLoading={isLoading}
        disabled={isDisabled}
        onClick={handleClick}
      />
    </>
  );
};

export default SetJurorsButton;
