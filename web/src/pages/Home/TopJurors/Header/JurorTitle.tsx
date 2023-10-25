import React from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  align-items: center;
  width: calc(40px + (220 - 40) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  gap: 36px;

  label {
    font-weight: 400;
    font-size: 14px;
    line-height: 19px;
    color: ${({ theme }) => theme.secondaryText} !important;
  }
`;

const JurorTitle: React.FC = () => (
  <Container>
    <label>Juror</label>
  </Container>
);
export default JurorTitle;
