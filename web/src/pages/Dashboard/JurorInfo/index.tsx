import React from "react";
import styled from "styled-components";
import { Card as _Card } from "@kleros/ui-components-library";
import Coherency from "./Coherency";
import JurorRewards from "./JurorRewards";
import StakingRewards from "./StakingRewards";

const Container = styled.div``;

const Card = styled(_Card)`
  width: 100%;
  height: auto;
`;

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: fit-content;
  margin: 16px auto;
`;

const JurorInfo: React.FC = () => {
  return (
    <Container>
      <h1>Juror Dashboard</h1>
      <Card>
        <Layout>
          <Coherency />
          <JurorRewards />
          <StakingRewards />
        </Layout>
      </Card>
    </Container>
  );
};

export default JurorInfo;
