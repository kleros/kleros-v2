import React from "react";
import styled from "styled-components";
import Stats from "./Stats";
import Chart from "./Chart";
import DisputeCard from "components/DisputeCard";

const Container = styled.div`
  width: 100%;
  height: auto;
  background-color: ${({ theme }) => theme.lightBackground};
  padding: 32px;
`;

const Home: React.FC = () => (
  <Container>
    <Chart />
    <Stats />
    <hr />
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
);

export default Home;
