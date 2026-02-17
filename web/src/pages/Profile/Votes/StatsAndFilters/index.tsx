import React from "react";
import styled from "styled-components";

import { responsiveSize } from "styles/responsiveSize";

import Filters from "./Filters";
import Stats, { IStats } from "./Stats";

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: ${responsiveSize(4, 12)};
  justify-content: space-between;
`;

const StatsAndFilters: React.FC<IStats> = ({ totalVotes, votesPending, resolvedVotes }) => (
  <Container>
    <Stats {...{ totalVotes, votesPending, resolvedVotes }} />
    <Filters />
  </Container>
);

export default StatsAndFilters;
