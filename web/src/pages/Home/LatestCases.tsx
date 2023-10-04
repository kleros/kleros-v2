import React, { useEffect } from "react";
import styled from "styled-components";
import { useCasesQuery } from "queries/useCasesQuery";
import { useFiltersContext } from "context/FilterProvider";
import DisputeCard from "components/DisputeCard";
import { StyledSkeleton } from "components/StyledSkeleton";

const Container = styled.div`
  margin-top: calc(64px + (80 - 64) * (min(max(100vw, 375px), 1250px) - 375px) / 875);

  h1 {
    margin-bottom: calc(16px + (48 - 16) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  }
`;

const DisputesContainer = styled.div`
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  justify-content: center;
`;

const LatestCases: React.FC = () => {
  const { data } = useCasesQuery(0);
  const { setIsList } = useFiltersContext();

  useEffect(() => {
    setIsList(false);
  }, []);

  return (
    <Container>
      <h1>Latest Cases</h1>
      <DisputesContainer>
        {data
          ? data.disputes.map((dispute) => <DisputeCard key={dispute.id} {...dispute} />)
          : Array.from({ length: 3 }).map((_, index) => <StyledSkeleton key={index} width={312} height={260} />)}
      </DisputesContainer>
    </Container>
  );
};

export default LatestCases;
