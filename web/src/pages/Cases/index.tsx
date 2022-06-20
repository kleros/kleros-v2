import React from "react";
import styled from "styled-components";
import Search from "./Search";
import StatsAndFilters from "./StatsAndFilters";
import CasesMatrix from "./CasesMatrix";

const Container = styled.div`
  width: 100%;
  height: auto;
  background-color: ${({ theme }) => theme.lightBackground};
  padding: 32px;
`;

const StyledHR = styled.hr`
  margin-top: 24px;
  margin-bottom: 24px;
`;

const Cases: React.FC = () => (
  <Container>
    <h1>Cases</h1>
    <Search />
    <StatsAndFilters />
    <StyledHR />
    <CasesMatrix />
  </Container>
);

export default Cases;
