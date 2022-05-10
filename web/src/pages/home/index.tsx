import React from "react";
import styled from "styled-components";
import CourtOverview from "./CourtOverview";
import LatestCases from "./LatestCases";

const Container = styled.div`
  width: 100%;
  height: auto;
  background-color: ${({ theme }) => theme.lightBackground};
  padding: 32px;
`;

const Home: React.FC = () => (
  <Container>
    <CourtOverview />
    <LatestCases />
  </Container>
);

export default Home;
