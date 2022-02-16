import React from "react";
import styled from "styled-components";
import { utils } from "ethers";
import { Skeleton } from "components/skeleton-provider";
import Table from "../../table";
import { IDisputeInfo } from "queries/useKlerosCoreDisputesQuery";

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
  "0xD78DCddE2C5a2Bd4BB246Bc7dB6994b95f7c442C": "Plurality",
};

const SUBCOURTS = {
  "0": "General",
};

const PERIODS = {
  0: "Evidence",
  1: "Commit",
  2: "Vote",
  3: "Appeal",
  4: "Execution",
};

const formatData = (dispute: IDisputeInfo): React.ReactNode[] => {
  return [
    dispute.disputeID.toString(),
    SUBCOURTS[dispute.subcourtID.toString()],
    DISPUTE_KITS[dispute.disputeKit],
    PERIODS[dispute.period],
    dispute.ruling.toString(),
    dispute.nbRounds.toNumber() - 1,
    dispute.tokensAtStakePerJuror.toString() + " PNK",
    utils.formatEther(dispute.totalFeesForJurors) + " ETH",
    dispute.nbVotes.toString(),
    dispute.drawnJurors.length,
  ];
};

const StyledTable = styled(Table)`
  height: 40%;
  width: 100%;
`;

const DisputesTable: React.FC<{ data?: IDisputeInfo[] }> = ({ data }) => {
  const rows = data
    ? data.map((dispute: IDisputeInfo) => formatData(dispute))
    : [Array(columnNames.length).fill(<Skeleton />)];
  return (
    <StyledTable
      {...{ rows, columnNames }}
      title="Outgoing Dispute Creations"
    />
  );
};

export default DisputesTable;
