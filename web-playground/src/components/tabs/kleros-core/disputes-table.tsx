import React from "react";
import styled from "styled-components";
import { utils } from "ethers";
import { Skeleton } from "components/skeleton-provider";
import Table from "../../table";
import { IKlerosCoreDisputeInfo } from "queries/useKlerosCoreDisputesQuery";

const columnNames = [
  "Core Dispute ID",
  "Sub-Court",
  "Dispute Kit",
  "Period",
  "Ruling",
  "Round",
  "Stake/Juror",
  "Fees",
  "Votes",
  "Drawn",
];

const DISPUTE_KITS = {
  "0xed12799915180a257985631fbD2ead261eD838cf": "Plurality",
};

const SUBCOURTS = {
  "0": "General",
};

export const PERIODS = {
  0: "Evidence",
  evidence: 0,
  1: "Commit",
  commit: 1,
  2: "Vote",
  vote: 2,
  3: "Appeal",
  appeal: 3,
  4: "Execution",
  execution: 4,
};

const formatData = (dispute: IKlerosCoreDisputeInfo): React.ReactNode[] => {
  return [
    dispute.disputeID.toString(),
    SUBCOURTS[dispute.subcourtID.toString()],
    DISPUTE_KITS[dispute.disputeKit],
    PERIODS[dispute.period],
    dispute.ruling.toString(),
    dispute.nbRounds.toNumber() - 1,
    utils.formatEther(dispute.tokensAtStakePerJuror) + " PNK",
    utils.formatEther(dispute.totalFeesForJurors) + " ETH",
    dispute.nbVotes.toString(),
    dispute.drawnJurors.length,
  ];
};

const StyledTable = styled(Table)`
  height: 40%;
  width: 100%;
`;

const DisputesTable: React.FC<{ data?: IKlerosCoreDisputeInfo[] }> = ({
  data,
}) => {
  const rows = data
    ? data.map((dispute: IKlerosCoreDisputeInfo) => formatData(dispute))
    : [Array(columnNames.length).fill(<Skeleton />)];
  return (
    <StyledTable
      {...{ rows, columnNames }}
      title="Outgoing Dispute Creations"
    />
  );
};

export default DisputesTable;
