import React from "react";
import styled from "styled-components";
import { useCasesQuery } from "queries/useCasesQuery";
import DisputeCard from "components/DisputeCard";

const Container = styled.div`
  margin-top: 64px;
  .disputes-container {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const LatestCases: React.FC = () => {
  const { data } = useCasesQuery(0);
  return (
    <Container>
      <h1>Latest Cases</h1>
      <div className="disputes-container">
        {data?.disputes.map((dispute, i) => (
          <DisputeCard key={i} {...dispute} />
        ))}
      </div>
    </Container>
  );
};

export default LatestCases;
