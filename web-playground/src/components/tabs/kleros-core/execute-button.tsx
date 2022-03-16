import React from "react";
import { ArbitrumRinkeby } from "@usedapp/core";
import { useContractFunction } from "hooks/useContractFunction";
import { IKlerosCoreDisputeInfo } from "queries/useKlerosCoreDisputesQuery";
import { PERIODS } from "./disputes-table";

const ExecuteButton: React.FC<{
  dispute?: IKlerosCoreDisputeInfo;
  isLoading?: boolean;
}> = ({ dispute, isLoading }) => {
  const { send: sendExecute, state: executeState } = useContractFunction(
    "KlerosCore",
    "execute",
    {
      chainId: ArbitrumRinkeby.chainId,
    }
  );
  const {
    sendWithSwitch,
    send: sendExecuteRuling,
    state: executeRulingState,
  } = useContractFunction("KlerosCore", "executeRuling", {
    chainId: ArbitrumRinkeby.chainId,
  });
  return sendWithSwitch({
    text: "Execute",
    disabled:
      isLoading ||
      !["None", "Exception", "Fail"].includes(executeState.status) ||
      !["None", "Exception", "Fail"].includes(executeRulingState.status) ||
      dispute?.ruled ||
      dispute?.period !== PERIODS.execution,
    onClick: async () => {
      if (dispute) {
        sendExecute(dispute.disputeID, 0, 1000);
        sendExecuteRuling(dispute.disputeID);
      }
    },
  });
};

export default ExecuteButton;
