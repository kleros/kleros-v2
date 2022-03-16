import React from "react";
import { ArbitrumRinkeby } from "@usedapp/core";
import {
  IKlerosCoreDisputeInfo,
  useKlerosCoreTimesPerPeriodQuery,
} from "queries/useKlerosCoreDisputesQuery";
import { useContractFunction } from "hooks/useContractFunction";
import { PERIODS } from "./disputes-table";

const PassPeriodButton: React.FC<{
  dispute?: IKlerosCoreDisputeInfo;
  isLoading?: boolean;
}> = ({ dispute, isLoading }) => {
  const { data: timesPerPeriod } = useKlerosCoreTimesPerPeriodQuery(
    dispute?.subcourtID
  );
  let disabled = true;
  if (dispute && timesPerPeriod && dispute.period !== PERIODS.execution) {
    const timeSinceLastPeriodChange =
      Math.floor(Date.now() / 1000) - dispute.lastPeriodChange.toNumber();
    const currentPeriodDuration = timesPerPeriod[dispute.period];
    if (timeSinceLastPeriodChange >= currentPeriodDuration)
      if (dispute.period !== PERIODS.evidence) disabled = false;
      else {
        const allJurorsDrawn =
          dispute.drawnJurors.length >= dispute.nbVotes.toNumber();
        disabled = !allJurorsDrawn;
      }
  }

  const { sendWithSwitch, send, state } = useContractFunction(
    "KlerosCore",
    "passPeriod",
    {
      chainId: ArbitrumRinkeby.chainId,
    }
  );
  return sendWithSwitch({
    text: "Pass period",
    disabled:
      isLoading ||
      disabled ||
      !["None", "Exception", "Fail"].includes(state.status),
    onClick: async () => dispute && send(dispute.disputeID),
  });
};

export default PassPeriodButton;
