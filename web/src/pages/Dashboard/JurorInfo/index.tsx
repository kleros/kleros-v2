import React from "react";
import styled, { css } from "styled-components";
import { smallScreenStyle } from "styles/smallScreenStyle";
import { Card as _Card } from "@kleros/ui-components-library";
import Coherency from "./Coherency";
import JurorRewards from "./JurorRewards";
// import StakingRewards from "./StakingRewards";

const Container = styled.div``;

const Card = styled(_Card)`
  width: 100%;
  height: auto;
`;

const Layout = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  width: auto;
  margin: 16px 32px;

  ${smallScreenStyle(
    () => css`
      flex-direction: column;
    `
  )}
`;

const JurorInfo: React.FC = () => {
  return (
    <Container>
      <h1>Juror Dashboard</h1>
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
