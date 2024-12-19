import React from "react";
import styled from "styled-components";

import { responsiveSize } from "styles/responsiveSize";

import DisputeTimeline from "./DisputeTimeline";
import FinalDecision from "./FinalDecision";

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${responsiveSize(16, 24)};
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
