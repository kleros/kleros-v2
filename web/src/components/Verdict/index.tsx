import React from "react";
import styled from "styled-components";

import { responsiveSize } from "styles/responsiveSize";

import { VotingHistoryQuery } from "src/graphql/graphql";

import DisputeTimeline from "./DisputeTimeline";
import FinalDecision from "./FinalDecision";

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${responsiveSize(16, 24)};
`;

interface IVerdict {
  arbitrable?: `0x${string}`;
  votingHistory: VotingHistoryQuery | undefined;
}

const Verdict: React.FC<IVerdict> = ({ arbitrable, votingHistory }) => {
  return (
    <Container>
      <FinalDecision {...{ votingHistory, arbitrable }} />
      <DisputeTimeline {...{ arbitrable }} />
    </Container>
  );
};

export default Verdict;
