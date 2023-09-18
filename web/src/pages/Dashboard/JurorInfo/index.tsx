import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { Card as _Card } from "@kleros/ui-components-library";
import Coherency from "./Coherency";
import JurorRewards from "./JurorRewards";
// import StakingRewards from "./StakingRewards";

const Container = styled.div``;

const Header = styled.h1`
  margin-bottom: calc(16px + (48 - 16) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
`;

const Card = styled(_Card)`
  width: 100%;
  height: auto;
`;

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 24px;
  width: auto;
  margin: 16px 32px;

  ${landscapeStyle(
    () => css`
      flex-direction: row;
      gap: 48px;
    `
  )}
`;

const JurorInfo: React.FC = () => {
  return (
    <Container>
      <Header>Juror Dashboard</Header>
      <Card>
        <Layout>
          <Coherency />
          <JurorRewards />
        </Layout>
      </Card>
    </Container>
  );
};

export default JurorInfo;
