import React from "react";
import { ArbitrumRinkeby } from "@usedapp/core";
import { useContractFunction } from "hooks/useContractFunction";

const SubmitEvidenceButton: React.FC<{
  text: string;
  disputeID?: string;
  className?: string;
}> = ({ text, disputeID, className }) => {
  const { sendWithSwitch, send, state } = useContractFunction(
    "DisputeKitClassic",
    "submitEvidence",
    {
      chainId: ArbitrumRinkeby.chainId,
    }
  );
  return sendWithSwitch({
    className,
    text: "Submit Evidence",
    disabled:
      !disputeID || !["None", "Exception", "Fail"].includes(state.status),
    onClick: async () => disputeID && send(disputeID, text),
  });
};

export default SubmitEvidenceButton;
