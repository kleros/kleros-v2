import React from "react";
import styled from "styled-components";
import Filters from "./Filters";
import Stats from "./Stats";

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const StatsAndFilters: React.FC = () => (
  <Container>
    <Stats />
    <Filters />
  </Container>
);

export default StatsAndFilters;
