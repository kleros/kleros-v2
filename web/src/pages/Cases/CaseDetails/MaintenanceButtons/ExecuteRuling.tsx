import React, { useMemo, useState } from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
import { usePublicClient } from "wagmi";

import { Button } from "@kleros/ui-components-library";

import { useSimulateKlerosCoreExecuteRuling, useWriteKlerosCoreExecuteRuling } from "hooks/contracts/generated";
import { wrapWithToast } from "utils/wrapWithToast";

import { Period } from "src/graphql/graphql";
import { isUndefined } from "src/utils";

import { IBaseMaintenanceButton } from ".";

const StyledButton = styled(Button)`
  width: 100%;
`;

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
    if (!ruleConfig) return;

    setIsSending(true);

    wrapWithToast(async () => await rule(ruleConfig.request), publicClient).finally(() => {
      setIsSending(false);
      setIsOpen(false);
    });
  };
  return (
    <StyledButton text={t("buttons.rule")} small isLoading={isLoading} disabled={isDisabled} onClick={handleClick} />
  );
};

export default ExecuteRulingButton;
