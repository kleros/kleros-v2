import React from "react";
import styled from "styled-components";
import { Rinkeby } from "@usedapp/core";
import { Tooltip } from "@kleros/ui-components-library";
import Table from "components/table";
import { Skeleton } from "components/skeleton-provider";
import { shortenString } from "src/utils/shortenString";
import { useContractFunction } from "hooks/useContractFunction";
import {
  useFastBridgeClaimsQuery,
  IFastBridgeClaim,
} from "queries/useFastBridgeQuery";
import { useTimeLeft } from "hooks/useTimeLeft";

const columnNames = [
  "Message Hash",
  "Claim timestamp",
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

const RelayButton: React.FC<{
  claim: IFastBridgeClaim;
}> = ({ claim }) => {
  const timeLeft = useTimeLeft(claim);
  const { sendWithSwitch, send, state } = useContractFunction(
    "FastBridgeReceiver",
    "verifyAndRelay",
    { chainId: Rinkeby.chainId }
  );
  return sendWithSwitch({
    small: true,
    text: "Relay",
    disabled:
      (timeLeft !== undefined ? timeLeft > 0 : true) ||
      claim.relayed ||
      claim.claimedAt.toNumber() == 0 ||
      !["None", "Exception", "Fail"].includes(state.status),
    onClick: () => send(claim.messageHash, claim.message),
  });
};

const TimeLeft: React.FC<{ claim: IFastBridgeClaim }> = ({ claim }) => {
  const timeLeft = useTimeLeft(claim);
  return timeLeft !== undefined ? <p>{timeLeft}</p> : <Skeleton />;
};

const formatData = (claim: IFastBridgeClaim): React.ReactNode[] => [
  <StyledTooltip
    small
    place="right"
    text={claim.messageHash.toString()}
    key={0}
  >
    {shortenString(claim.messageHash.toString())}
  </StyledTooltip>,
  claim.claimedAt.toString(),
  <TimeLeft key={0} {...{ claim }} />,
  <RelayButton key={1} {...{ claim }} />,
];

const RulingsOnL1: React.FC = (props) => {
  const { data } = useFastBridgeClaimsQuery();
  const rows = data
    ? data.map((claim: IFastBridgeClaim) => formatData(claim))
    : [Array(columnNames.length).fill(<Skeleton />)];
  return (
    <Table {...{ rows, columnNames, ...props }} title="Rulings claimed on L1" />
  );
};

export default RulingsOnL1;
