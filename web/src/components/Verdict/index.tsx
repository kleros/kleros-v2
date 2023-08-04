import React from "react";
import styled from "styled-components";
import FinalDecision from "./FinalDecision";
import DisputeTimeline from "./DisputeTimeline";

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
`;

interface IVerdict {
  arbitrable?: `0x${string}`;
}

const Verdict: React.FC<IVerdict> = ({ arbitrable }) => {
  return (
    <Container>
      <FinalDecision arbitrable={arbitrable} />
      <DisputeTimeline arbitrable={arbitrable} />
    </Container>
  );
};

export default Verdict;
