import React from "react";
import styled from "styled-components";
import { useHomeGatewayDisputesRelayedQuery } from "queries/useHomeGatewayDisputesQuery";
import DisputesTable from "./disputes";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 64px;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: flex-start;
`;

const StyledTable = styled(DisputesTable)`
  height: 90%;
  width: 100%;
`;

const L2Gateway = () => {
  const { data } = useHomeGatewayDisputesRelayedQuery();
  return (
    <Wrapper>
      <StyledTable {...{ data }} />
    </Wrapper>
  );
};

export default L2Gateway;
