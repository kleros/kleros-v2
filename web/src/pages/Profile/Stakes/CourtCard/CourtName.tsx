import React from "react";
import styled, { css } from "styled-components";

import { landscapeStyle } from "styles/landscapeStyle";

const Container = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  gap: 8px 16px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;

  small {
    height: 100%;
    font-weight: 600;
  }

  ${landscapeStyle(
    () => css`
      justify-content: flex-start;
      width: auto;
    `
  )}
`;

interface ICourtName {
  name: string;
  id: string;
}

const CourtName: React.FC<ICourtName> = ({ name, id }) => {
  return (
    <Container>
      <small>{name}</small>
    </Container>
  );
};
export default CourtName;
