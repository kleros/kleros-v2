import React from "react";
import styled from "styled-components";
import { useForeignGatewayOutgoingDisputeDataQuery } from "queries/useForeignGatewayDisputeQuery";
import OutgoingDisputeCreationsTable from "./outgoing-dispute-creations";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 64px;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: flex-start;
`;

const StyledTable = styled(OutgoingDisputeCreationsTable)`
  height: 90%;
  width: 100%;
`;

const L1Gateway = () => {
  const { data } = useForeignGatewayOutgoingDisputeDataQuery();
  return (
    <Wrapper>
      <StyledTable {...{ data }} />
    </Wrapper>
  );
};

export default L1Gateway;
