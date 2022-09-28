import React from "react";
import styled from "styled-components";
import { StandardPagination } from "@kleros/ui-components-library";
import DisputeCard from "components/DisputeCard";

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
`;

// 24px as margin-top since we already have 8px from the flex gap
const StyledPagination = styled(StandardPagination)`
  margin-top: 24px;
  margin-left: auto;
  margin-right: auto;
`;

export interface ICasesGrid {
  casesPerPage: number;
}

const CasesGrid: React.FC<ICasesGrid> = ({ casesPerPage }) => (
  <>
    <Container>
      <DisputeCard
        title="Register Profile in Proof of Humanity"
        id={600}
        period={1}
        court="Humanity"
        category="Identity"
        rewards="≥ 0.3 ETH"
        date={1651244935}
      />
      <DisputeCard
        title="Register Profile in Proof of Humanity"
        id={600}
        period={3}
        court="Humanity"
        category="Identity"
        rewards="≥ 0.3 ETH"
        date={1651244935}
      />
      <DisputeCard
        title="Register Profile in Proof of Humanity"
        id={600}
        period={4}
        court="Humanity"
        category="Identity"
        rewards="≥ 0.3 ETH"
        date={1651244935}
      />
    </Container>
    <StyledPagination currentPage={1} numPages={1} callback={() => {}} />
  </>
);

export default CasesGrid;
