import React from "react";
import styled from "styled-components";
import { useCasesQuery } from "queries/useCasesQuery";
import JurorInfo from "./JurorInfo";
import Courts from "./Courts";
import CasesDisplay from "components/CasesDisplay";

const Container = styled.div`
  width: 100%;
  height: auto;
  background-color: ${({ theme }) => theme.lightBackground};
  padding: 32px;
`;

const StyledCasesDisplay = styled(CasesDisplay)`
  margin-top: 64px;
`;

const Dashboard: React.FC = () => {
  const { data } = useCasesQuery(0);
  return (
    <Container>
      <JurorInfo />
      <Courts />
      {data && (
        <StyledCasesDisplay
          title="My Cases"
          disputes={data.disputes}
          casesPerPage={3}
        />
      )}
    </Container>
  );
};

export default Dashboard;
