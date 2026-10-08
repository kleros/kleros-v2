import React, { useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import { Address, isAddress } from "viem";
import { usePublicClient } from "wagmi";

import { Button, TextField } from "@kleros/ui-components-library";

import {
  useReadDisputeKitClassicUniversityGetJurors,
  useReadDisputeKitClassicUniversityInstructor,
  useSimulateDisputeKitClassicUniversitySetJurors,
  useWriteDisputeKitClassicUniversitySetJurors,
} from "hooks/contracts/generated";
import { wrapWithToast } from "utils/wrapWithToast";

import AddressExplorerLink from "src/components/AddressExplorerLink";
import { isUndefined } from "src/utils";

import { IBaseMaintenanceButton } from ".";

interface ISetJurorsButton extends Pick<IBaseMaintenanceButton, "id"> {
  disputeKitAddress?: Address;
}

const parseJurorAddresses = (input: string): { jurors: Address[]; hasInvalidTokens: boolean } => {
  const tokens = input
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const jurors = tokens.filter((addr): addr is Address => isAddress(addr));
  return { jurors, hasInvalidTokens: jurors.length !== tokens.length };
};

const SetJurorsButton: React.FC<ISetJurorsButton> = ({ id, disputeKitAddress }) => {
  const { t } = useTranslation();
  const publicClient = usePublicClient();
  const [isSending, setIsSending] = useState(false);
  const [jurorsInput, setJurorsInput] = useState("");

  const { jurors, hasInvalidTokens } = useMemo(() => parseJurorAddresses(jurorsInput), [jurorsInput]);
  const hasValidJurors = jurors.length > 0 && !hasInvalidTokens;

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

    wrapWithToast(async () => await setJurors(setJurorsConfig.request), publicClient)
      .then((res) => {
        if (res.status) {
          setJurorsInput("");
          refetchJurorsInQueue();
        }
      })
      .finally(() => {
        setIsSending(false);
      });
  };

  return (
    <>
      {instructorAddress ? (
        <div className="flex items-center gap-2 text-[14px] text-klerosUIComponentsSecondaryText">
          <span className="text-klerosUIComponentsPrimaryText">{t("features.university_instructor")}:</span>
          <AddressExplorerLink address={instructorAddress} />
        </div>
      ) : null}

      {jurorsInQueue && jurorsInQueue.length > 0 ? (
        <div className="flex flex-col gap-1 text-[14px] text-klerosUIComponentsSecondaryText">
          <span className="text-klerosUIComponentsPrimaryText">
            {t("maintenance.jurors_in_queue", { count: jurorsInQueue.length })}
          </span>
          <div className="flex flex-wrap gap-[4px_8px]">
            {jurorsInQueue.map((address) => (
              <AddressExplorerLink key={address} {...{ address }} />
            ))}
          </div>
        </div>
      ) : null}

      <TextField
        aria-label={t("aria_labels.juror_addresses")}
        placeholder={t("forms.placeholders.juror_addresses_comma_separated")}
        onChange={setJurorsInput}
        value={jurorsInput}
      />
      <Button
        text={t("buttons.set_jurors")}
        small
        isLoading={isLoading}
        isDisabled={isDisabled}
        onPress={handleClick}
        className="w-full"
      />
    </>
  );
};

export default SetJurorsButton;
