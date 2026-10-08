import React, { useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import { usePublicClient } from "wagmi";

import { Button } from "@kleros/ui-components-library";

import { useSimulateKlerosCoreExecuteRuling, useWriteKlerosCoreExecuteRuling } from "hooks/contracts/generated";
import { wrapWithToast } from "utils/wrapWithToast";

import { Period } from "src/graphql/graphql";
import { isUndefined } from "src/utils";

import { IBaseMaintenanceButton } from ".";

interface IExecuteRulingButton extends IBaseMaintenanceButton {
  period?: string;
  ruled?: boolean;
}

const ExecuteRulingButton: React.FC<IExecuteRulingButton> = ({ id, setIsOpen, period, ruled }) => {
  const { t } = useTranslation();
  const [isSending, setIsSending] = useState(false);
  const publicClient = usePublicClient();

  const {
    data: ruleConfig,
    isLoading: isLoadingConfig,
    isError,
  } = useSimulateKlerosCoreExecuteRuling({
    query: {
      enabled: !isUndefined(id) && !isUndefined(period) && period === Period.Execution && !ruled,
    },
    args: [BigInt(id ?? 0)],
  });

  const { writeContractAsync: rule } = useWriteKlerosCoreExecuteRuling();

  const isLoading = useMemo(() => isLoadingConfig || isSending, [isLoadingConfig, isSending]);
  const isDisabled = useMemo(
    () => isUndefined(id) || isError || isLoading || period !== Period.Execution || ruled,
    [id, isError, isLoading, period, ruled]
  );
  const handleClick = () => {
    if (!ruleConfig || !publicClient) return;

    setIsSending(true);

    wrapWithToast(async () => await rule(ruleConfig.request), publicClient).finally(() => {
      setIsSending(false);
      setIsOpen(false);
    });
  };
  return (
    <Button
      text={t("buttons.rule")}
      small
      isLoading={isLoading}
      isDisabled={isDisabled}
      onPress={handleClick}
      className="w-full"
    />
  );
};

export default ExecuteRulingButton;
