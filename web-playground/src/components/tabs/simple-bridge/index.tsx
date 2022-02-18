import React from "react";
import styled from "styled-components";
import DisputeCreationTable from "./dispute-creation";
import { useForeignGatewayOutgoingDisputeDataQuery } from "queries/useForeignGatewayDisputeQuery";
import { useHomeGatewayDisputesRelayedQuery } from "queries/useHomeGatewayDisputesQuery";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 64px;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
`;

const StyledTable = styled(DisputeCreationTable)`
  height: 90%;
  width: 100%;
`;

const SimpleBridge = () => {
  const { data } = useForeignGatewayOutgoingDisputeDataQuery();
  const { data: relayedDisputes } = useHomeGatewayDisputesRelayedQuery();
  const relayedHashes = relayedDisputes?.map(({ disputeHash }) => disputeHash);
  return (
    <Wrapper>
      <StyledTable {...{ data, relayedHashes }} />
    </Wrapper>
  );
};

export default SimpleBridge;
