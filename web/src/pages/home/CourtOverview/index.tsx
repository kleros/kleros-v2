import React from "react";
import styled from "styled-components";
import Stats from "./Stats";
import Chart from "./Chart";

const Container = styled.div`
  width: 100%;
  height: auto;
`;

const CourtOverview: React.FC = () => (
  <Container>
    <h1>Court Overview</h1>
    <Chart />
    <Stats />
  </Container>
);

export default CourtOverview;
