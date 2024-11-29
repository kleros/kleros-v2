import React from "react";
import styled, { css } from "styled-components";

import { landscapeStyle } from "styles/landscapeStyle";

import ArrowIcon from "svgs/icons/arrow.svg";
import { Link } from "react-router-dom";

const Container = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  gap: 16px;
  align-items: center;
  justify-content: space-between;

  small {
    height: 100%;
    font-weight: 600;
  }

  ${landscapeStyle(
    () =>
      css`
        justify-content: flex-start;
        width: auto;
      `
  )}
`;

const StyledLink = styled(Link)`
  display: flex;
  gap: 8px;
  align-items: center;
  > svg {
    height: 15px;
    width: 15px;
    path {
      fill: ${({ theme }) => theme.primaryBlue};
    }
  }
`;

interface ICourtName {
  name: string;
  id: string;
}

const CourtName: React.FC<ICourtName> = ({ name, id }) => {
  return (
    <Container>
      <small>{name}</small>
      <StyledLink to={`/courts/${id?.toString()}`}>
        Open Court <ArrowIcon />
      </StyledLink>
    </Container>
  );
};
export default CourtName;
