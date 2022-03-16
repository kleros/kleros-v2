import React from "react";
import { useKlerosCoreDisputesInfoQuery } from "queries/useKlerosCoreDisputesQuery";
import DisputeID from "components/dispute-id";
import { PERIODS } from "components/tabs/kleros-core/disputes-table";

const DisputeSelector: React.FC<{
  setSelectedDispute: (disputeID: string) => void;
}> = ({ setSelectedDispute }) => {
  const { data } = useKlerosCoreDisputesInfoQuery();
  const items = data
    ? data
        .filter((disputeInfo) => disputeInfo.period === PERIODS.evidence)
        .map((disputeInfo) => ({
          text: disputeInfo.disputeID.toString(),
          value: disputeInfo.disputeID.toString(),
        }))
    : [];
  return (
    <DisputeID
      {...{ items }}
      callback={(value) => data && setSelectedDispute(value)}
    />
  );
};

export default DisputeSelector;
