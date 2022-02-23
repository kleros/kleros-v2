import React from "react";
import { ArbitrumRinkeby } from "@usedapp/core";
import { Button } from "@kleros/ui-components-library";
import { IKlerosCoreDisputeInfo } from "queries/useKlerosCoreDisputesQuery";
import { useContractFunction } from "hooks/useContractFunction";
import { PERIODS } from "./disputes-table";

const DrawJurorsButton: React.FC<{ dispute?: IKlerosCoreDisputeInfo }> = ({
  dispute,
}) => {
  const { sendWithSwitch, state } = useContractFunction("KlerosCore", "draw", {
    chainId: ArbitrumRinkeby.chainId,
  });
  return (
    <Button
      text="Draw Jurors"
      disabled={
        !["None", "Exception", "Success", "Fail"].includes(state.status) ||
        dispute?.period !== PERIODS.evidence ||
        dispute?.drawnJurors.length >= dispute?.nbVotes.toNumber()
      }
      onClick={() =>
        dispute &&
        sendWithSwitch(
          dispute.disputeID,
          dispute.nbVotes.toNumber() - dispute.drawnJurors.length
        )
      }
    />
  );
};

export default DrawJurorsButton;
