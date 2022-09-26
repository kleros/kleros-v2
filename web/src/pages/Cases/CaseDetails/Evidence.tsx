import React from "react";
import styled from "styled-components";
import EvidenceCard from "components/EvidenceCard";

const Evidence = () => {
  return (
    <Container>
      <EvidenceCard />
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  padding: 16px;
`;

export default Evidence;
