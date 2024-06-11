import React from "react";
import styled from "styled-components";

import Chart from "./Chart";
import Header from "./Header";
import Stats from "./Stats";

const Container = styled.div`
  width: 100%;
  height: auto;
`;

const CourtOverview: React.FC = () => (
  <Container>
    <Header />
    <Chart />
    <Stats />
  </Container>
);

export default CourtOverview;
