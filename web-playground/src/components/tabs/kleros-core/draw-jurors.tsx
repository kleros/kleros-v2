import React from "react";
import { ArbitrumRinkeby } from "@usedapp/core";
import { IKlerosCoreDisputeInfo } from "queries/useKlerosCoreDisputesQuery";
import { useContractFunction } from "hooks/useContractFunction";
import { PERIODS } from "./disputes-table";

const DrawJurorsButton: React.FC<{
  dispute?: IKlerosCoreDisputeInfo;
  isLoading?: boolean;
}> = ({ dispute, isLoading }) => {
  const { sendWithSwitch, send, state } = useContractFunction(
    "KlerosCore",
    "draw",
    {
      chainId: ArbitrumRinkeby.chainId,
    }
  );
  return sendWithSwitch({
    text: "Draw Jurors",
    disabled:
      isLoading ||
      !["None", "Exception", "Fail"].includes(state.status) ||
      dispute?.period !== PERIODS.evidence ||
      dispute?.drawnJurors.length >= dispute?.nbVotes.toNumber(),
    onClick: () =>
      dispute &&
      send(
        dispute.disputeID,
        dispute.nbVotes.toNumber() - dispute.drawnJurors.length
      ),
  });
};

export default DrawJurorsButton;
