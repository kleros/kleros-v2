import React from "react";
import styled from "styled-components";

import RoundIcon from "svgs/icons/round.svg";

const Container = styled.div`
  display: flex;
  gap: 8px;

  small {
    font-weight: 400;
  }
`;

interface IRound {
  number: string;
}

const Round: React.FC<IRound> = ({ number }) => {
  return (
    <Container>
      <RoundIcon />
      <small>Round {number}</small>
    </Container>
  );
};
export default Round;
