import React from "react";
import styled from "styled-components";
import FinalDecision from "./FinalDecision";
import DisputeTimeline from "./DisputeTimeline";

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
`;

const Verdict: React.FC = () => {
  return (
    <Container>
      <FinalDecision />
      <DisputeTimeline />
    </Container>
  );
};

export default Verdict;
