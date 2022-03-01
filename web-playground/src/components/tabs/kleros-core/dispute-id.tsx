import React, { useState } from "react";
import styled from "styled-components";
import DisputeField from "components/dispute-id";
import { IKlerosCoreDisputeInfo } from "queries/useKlerosCoreDisputesQuery";
import PassPeriodButton from "./pass-period";
import DrawJurorsButton from "./draw-jurors";
import ExecuteButton from "./execute-button";

const Wrapper = styled.div`
  height: auto;
  width: 100%;
  display: flex;
  align-items: center;
`;

const StyledButtonContainer = styled.div`
  z-index: 100;
  margin-left: 32px;
  display: flex;
  gap: 32px;
`;

const DisputeID: React.FC<{ data?: IKlerosCoreDisputeInfo[] }> = ({ data }) => {
  const [selectedDispute, setSelectedDispute] =
    useState<IKlerosCoreDisputeInfo>();
  const items = data
    ? data
        .filter((disputeInfo) => !disputeInfo.ruled)
        .map((disputeInfo, i) => ({
          text: disputeInfo.disputeID.toString(),
          value: i,
        }))
    : [];
  return (
    <Wrapper>
      <DisputeField
        {...{ items }}
        callback={(value) => data && setSelectedDispute(data[value])}
      />
      <StyledButtonContainer>
        <PassPeriodButton dispute={selectedDispute} />
        <DrawJurorsButton dispute={selectedDispute} />
        <ExecuteButton dispute={selectedDispute} />
      </StyledButtonContainer>
    </Wrapper>
  );
};

export default DisputeID;
