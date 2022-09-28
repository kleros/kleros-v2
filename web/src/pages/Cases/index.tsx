import React from "react";
import styled from "styled-components";
import CasesDisplay from "components/CasesDisplay";

const Container = styled.div`
  width: 100%;
  height: auto;
  background-color: ${({ theme }) => theme.lightBackground};
  padding: 32px;
`;

const Cases: React.FC = () => {
  return (
    <Container>
      <CasesDisplay casesPerPage={3} />
    </Container>
  );
};

export default Cases;
