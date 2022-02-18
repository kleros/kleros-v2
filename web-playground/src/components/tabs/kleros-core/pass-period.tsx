import React from "react";
import { Button } from "@kleros/ui-components-library";
import { useCall } from "@usedapp/core";
import { getContract } from "src/utils/getContract";
import { IKlerosCoreDisputeInfo } from "queries/useKlerosCoreDisputesQuery";
import { PERIODS } from "./disputes-table";

const PassPeriodButton: React.FC<{ dispute?: IKlerosCoreDisputeInfo }> = ({
  dispute,
}) => {
  const klerosCore = getContract("KlerosCore");
  const timesPerPeriod = useCall(
    klerosCore &&
      dispute && {
        contract: klerosCore,
        method: "getTimesPerPeriod",
        args: [dispute.subcourtID],
      }
  )?.value;
  let disabled = true;

  if (dispute && timesPerPeriod) {
    const timeSinceLastPeriodChange =
      Math.floor(Date.now() / 1000) - dispute.lastPeriodChange.toNumber();
    const currentPeriodDuration = timesPerPeriod[dispute.period];
    if (timeSinceLastPeriodChange >= currentPeriodDuration)
      if (dispute.period !== PERIODS.evidence) disabled = false;
      else {
        const allJurorsDrawn =
          dispute.drawnJurors.length === dispute.nbVotes.toNumber();
        disabled = !allJurorsDrawn;
      }
  }
  return <Button text="Pass period" {...{ disabled }} />;
};

export default PassPeriodButton;
