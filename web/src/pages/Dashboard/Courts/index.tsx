import React from "react";
import styled from "styled-components";
import CourtCard from "./CourtCard";

const Container = styled.div`
  margin-top: 64px;
`;

const CourtsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Courts: React.FC = () => {
  return (
    <Container>
      <h1> My Courts </h1>
      <hr />
      <CourtsContainer>
        <CourtCard />
        <CourtCard />
      </CourtsContainer>
    </Container>
  );
};

export default Courts;
