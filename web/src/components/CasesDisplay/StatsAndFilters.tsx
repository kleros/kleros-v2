import React from "react";
import styled from "styled-components";
import Filters from "./Filters";
import Stats, { IStats } from "./Stats";

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 11px;
  justify-content: space-between;
`;

const StatsAndFilters: React.FC<IStats> = ({ totalDisputes, closedDisputes }) => (
  <Container>
    <Stats {...{ totalDisputes, closedDisputes }} />
    <Filters />
  </Container>
);

export default StatsAndFilters;
