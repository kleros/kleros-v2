import React from "react";
import styled from "styled-components";

import { responsiveSize } from "styles/responsiveSize";
import Stats, { IStats } from "./Stats";

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: ${responsiveSize(12, 13)};
  margin-bottom: ${responsiveSize(16, 32)};
  justify-content: space-between;
`;

const StatsAndFilters: React.FC<IStats> = ({ totalJurors }) => (
  <Container>
    <Stats {...{ totalJurors }} />
  </Container>
);

export default StatsAndFilters;
