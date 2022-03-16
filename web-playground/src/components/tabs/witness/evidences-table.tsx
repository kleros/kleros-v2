import React from "react";
import styled from "styled-components";
import { shortenString } from "utils/shortenString";
import { Skeleton } from "components/skeleton-provider";
import Table from "../../table";
import {
  useDisputeKitEvidenceQuery,
  IDisputeKitEvidence,
} from "queries/useDisputeKitQuery";

const columnNames = ["Sender", "Evidence"];

const formatData = (evidence: IDisputeKitEvidence): React.ReactNode[] => {
  return [shortenString(evidence.sender), evidence.evidence];
};

const StyledTable = styled(Table)`
  height: 40%;
  width: 100%;
`;

const EvidencesTable: React.FC<{ disputeID?: string }> = ({ disputeID }) => {
  const { data } = useDisputeKitEvidenceQuery();
  const rows = data
    ? data
        .filter((evidence) => evidence.evidenceGroupID.toString() === disputeID)
        .map((evidence) => formatData(evidence))
    : [Array(columnNames.length).fill(<Skeleton />)];
  return <StyledTable {...{ rows, columnNames }} title="Disputes" />;
};

export default EvidencesTable;
