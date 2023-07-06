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
  ruled: boolean;
}

const Verdict: React.FC<IVerdict> = ({ id, disputeTemplate, disputeDetails, ruled }) => {
  return (
    <Container>
      <FinalDecision id={id} disputeTemplate={disputeTemplate} ruled={ruled} />
      <VerticalDivider />
      <DisputeTimeline id={id} disputeTemplate={disputeTemplate} disputeDetails={disputeDetails} />
    </Container>
  );
};
export default Verdict;
