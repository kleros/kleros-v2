import React from "react";
import styled, { css } from "styled-components";

import { landscapeStyle } from "styles/landscapeStyle";

import { InternalLink } from "components/InternalLink";

const Container = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  gap: 8px 16px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;

  ${landscapeStyle(
    () => css`
      width: 100%;
      overflow: hidden;
    `
  )}
`;

const CourtLink = styled(InternalLink)`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.primaryBlue};
  text-decoration: none;
  cursor: pointer;

  ${landscapeStyle(
    () => css`
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: block;
    `
  )}

  :hover {
    color: ${({ theme }) => theme.secondaryBlue};
  }
`;

interface ICourtName {
  name: string;
  id: string;
}

const CourtName: React.FC<ICourtName> = ({ name, id }) => {
  return (
    <Container>
      <CourtLink to={`/courts/${id}`}>{name}</CourtLink>
    </Container>
  );
};
export default CourtName;
