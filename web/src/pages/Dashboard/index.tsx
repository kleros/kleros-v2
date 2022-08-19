import React from "react";
import styled from "styled-components";
import JurorInfo from "./JurorInfo";
import CasesDisplay from "components/CasesDisplay";

const Container = styled.div`
  width: 100%;
  height: auto;
  background-color: ${({ theme }) => theme.lightBackground};
  padding: 32px;
`;

const Dashboard: React.FC = () => (
  <Container>
    <JurorInfo />
    <CasesDisplay title="My Cases" casesPerPage={3} />
  </Container>
);

export default Dashboard;
