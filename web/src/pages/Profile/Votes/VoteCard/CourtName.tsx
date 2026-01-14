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
      justify-content: flex-start;
      width: 100%;
      overflow: hidden;
    `
  )}
`;

const CourtLink = styled(InternalLink)`
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => theme.primaryBlue};
  text-decoration: none;
  cursor: pointer;
  height: 100%;

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
  courtId: string;
}

const CourtName: React.FC<ICourtName> = ({ name, courtId }) => {
  return (
    <Container>
      <CourtLink to={`/courts/${courtId}`}>{name}</CourtLink>
    </Container>
  );
};
export default CourtName;
