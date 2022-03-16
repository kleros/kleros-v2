import React from "react";
import styled from "styled-components";
import { Tooltip } from "@kleros/ui-components-library";
import Table from "components/table";
import { Skeleton } from "components/skeleton-provider";
import { shortenString } from "src/utils/shortenString";
import {
  useFastBridgeClaimsQuery,
  IFastBridgeClaim,
} from "queries/useFastBridgeQuery";
import ActionButton from "./action-button";

const columnNames = ["MessageHash", "Action"];

const StyledTooltip = styled(Tooltip)`
  span {
    z-index: 10;
    small {
      word-break: break-all;
    }
  }
`;

const formatData = (claim: IFastBridgeClaim): React.ReactNode[] => [
  <StyledTooltip
    small
    place="right"
    text={claim.messageHash.toString()}
    key={0}
  >
    {shortenString(claim.messageHash.toString())}
  </StyledTooltip>,
  <ActionButton key={1} {...{ claim }} />,
];

const RulingsOnL2: React.FC = (props) => {
  const { data } = useFastBridgeClaimsQuery();
  const rows = data
    ? data.map((claim: IFastBridgeClaim) => formatData(claim))
    : [Array(columnNames.length).fill(<Skeleton />)];
  return <Table {...{ rows, columnNames, ...props }} title="Rulings on L2" />;
};

export default RulingsOnL2;
