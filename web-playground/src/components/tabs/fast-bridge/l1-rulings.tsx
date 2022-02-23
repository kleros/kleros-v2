import React from "react";
import styled from "styled-components";
import { Tooltip } from "@kleros/ui-components-library";
import Table from "components/table";
import { Skeleton } from "components/skeleton-provider";
import { shortenString } from "src/utils/shortenString";
import {
  useFastBridgeClaimsQuery,
  IFastBridgeClaim,
  useFastBridgeChallengeDurationQuery,
} from "queries/useFastBridgeQuery";
import ActionButton from "./action-button";

const columnNames = [
  "Message Hash",
  "Claim block time",
  "Remaining Challenge Time",
  "Action",
];

const StyledTooltip = styled(Tooltip)`
  span {
    z-index: 10;
    small {
      word-break: break-all;
    }
  }
`;

const RelayButton: React.FC = () => {
  return (<></>);
};

const formatData = (
  claim: IFastBridgeClaim,
  challengeDuration: number
): React.ReactNode[] => [
  <StyledTooltip
    small
    place="right"
    text={claim.messageHash.toString()}
    key={0}
  >
    {shortenString(claim.messageHash.toString())}
  </StyledTooltip>,
  claim.claimedAt.toString(),
  Math.max(
    0,
    challengeDuration -
      (Math.floor(Date.now() / 1000) - claim.claimedAt.toNumber())
  ),
  <ActionButton key={1} {...{ claim }} />,
];

const RulingsOnL1: React.FC = (props) => {
  const { data } = useFastBridgeClaimsQuery();
  const { data: challengeDuration } = useFastBridgeChallengeDurationQuery();
  const rows = data
    ? data.map((claim: IFastBridgeClaim) =>
        formatData(claim, challengeDuration)
      )
    : [Array(columnNames.length).fill(<Skeleton />)];
  return (
    <Table {...{ rows, columnNames, ...props }} title="Rulings claimed on L1" />
  );
};

export default RulingsOnL1;
