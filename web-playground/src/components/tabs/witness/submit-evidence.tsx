import React from "react";
import { ArbitrumRinkeby } from "@usedapp/core";
import { Button } from "@kleros/ui-components-library";
import { useContractFunction } from "hooks/useContractFunction";
import ArbitrumLogo from "svgs/arbitrum_opacity.svg";

const SubmitEvidenceButton: React.FC<{
  text: string;
  disputeID?: string;
  className?: string;
}> = ({ text, disputeID, className }) => {
  const { sendWithSwitch, state } = useContractFunction(
    "DisputeKitClassic",
    "submitEvidence",
    {
      chainId: ArbitrumRinkeby.chainId,
    }
  );
  return (
    <Button
      text="Submit Evidence"
      icon={(className: string) => <ArbitrumLogo {...{ className }} />}
      disabled={
        !disputeID || !["None", "Exception", "Fail"].includes(state.status)
      }
      onClick={() => disputeID && sendWithSwitch(disputeID, text)}
      {...{ className }}
    />
  );
};

export default SubmitEvidenceButton;
