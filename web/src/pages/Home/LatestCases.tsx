import React from "react";
import styled from "styled-components";
import DisputeCard from "components/DisputeCard";

const Container = styled.div`
  margin-top: 64px;
  .disputes-container {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const LatestCases: React.FC = () => {
  return (
    <Container>
      <h1>Latest Cases</h1>
      <div className="disputes-container">
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
      </div>
    </Container>
  );
};

export default LatestCases;
