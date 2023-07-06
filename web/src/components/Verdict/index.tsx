import React from "react";
import styled from "styled-components";
import { DisputeDetailsQuery } from "queries/useDisputeDetailsQuery";
import FinalDecision from "./FinalDecision";
import DisputeTimeline from "./DisputeTimeline";

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
`;

const VerticalDivider = styled.div`
  width: 1px;
  background-color: ${({ theme }) => theme.stroke};
`;

interface IVerdict {
  id: string;
  disputeTemplate: any;
  disputeDetails: DisputeDetailsQuery;
}

const Verdict: React.FC<IVerdict> = ({ id, disputeTemplate, disputeDetails }) => {
  return (
    <Container>
      <FinalDecision id={id} disputeTemplate={disputeTemplate} />
      <VerticalDivider />
      <DisputeTimeline id={id} disputeTemplate={disputeTemplate} disputeDetails={disputeDetails} />
    </Container>
  );
};
export default Verdict;
