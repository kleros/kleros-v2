import React from "react";
import styled from "styled-components";
import FinalDecision from "./FinalDecision";
import DisputeTimeline from "./Timeline";

const Container = styled.div`
  display: flex;
  gap: 48px;
`;

interface IVerdict {
  id: string;
  disputeTemplate: any;
}

const Verdict: React.FC<IVerdict> = ({ id, disputeTemplate }) => {
  return (
    <Container>
      <FinalDecision id={id} disputeTemplate={disputeTemplate} />
      {/* <DisputeTimeline id={id} disputeTemplate={disputeTemplate} /> */}
    </Container>
  );
};
export default Verdict;
