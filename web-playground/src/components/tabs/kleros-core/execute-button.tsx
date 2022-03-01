import React from "react";
import { ArbitrumRinkeby } from "@usedapp/core";
import { Button } from "@kleros/ui-components-library";
import { useContractFunction } from "hooks/useContractFunction";
import { IKlerosCoreDisputeInfo } from "queries/useKlerosCoreDisputesQuery";
import { PERIODS } from "./disputes-table";
import ArbitrumLogo from "svgs/arbitrum_opacity.svg";

const ExecuteButton: React.FC<{ dispute?: IKlerosCoreDisputeInfo }> = ({
  dispute,
}) => {
  const { sendWithSwitch: sendExecute, state: executeState } =
    useContractFunction("KlerosCore", "execute", {
      chainId: ArbitrumRinkeby.chainId,
    });
  const { sendWithSwitch: sendExecuteRuling, state: executeRulingState } =
    useContractFunction("KlerosCore", "executeRuling", {
      chainId: ArbitrumRinkeby.chainId,
    });
  return (
    <Button
      text="Execute Ruling"
      icon={(className: string) => <ArbitrumLogo {...{ className }} />}
      disabled={
        !["None", "Exception", "Fail"].includes(executeState.status) ||
        !["None", "Exception", "Fail"].includes(executeRulingState.status) ||
        dispute?.ruled ||
        dispute?.period !== PERIODS.execution
      }
      onClick={async () => {
        if (dispute) {
          sendExecute(dispute.disputeID, 0, 1000);
          sendExecuteRuling(dispute.disputeID);
        }
      }}
    />
  );
};

export default ExecuteButton;
