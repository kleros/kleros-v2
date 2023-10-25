import React from "react";
import styled from "styled-components";

const Container = styled.div`
  width: calc(16px + (24 - 16) * (min(max(100vw, 375px), 1250px) - 375px) / 875);

  label {
    &::before {
      content: "#";
    }
  }
`;

const Rank: React.FC = () => (
  <Container>
    <label></label>
  </Container>
);
export default Rank;
