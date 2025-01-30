import React from "react";
import styled, { css } from "styled-components";

import { landscapeStyle } from "styles/landscapeStyle";

import ArrowIcon from "svgs/icons/arrow.svg";

import { StyledArrowLink } from "components/StyledArrowLink";

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
    () => css`
      justify-content: flex-start;
      width: auto;
    `
  )}
`;

const ReStyledArrowLink = styled(StyledArrowLink)`
  font-size: 14px;

  > svg {
    height: 15px;
    width: 15px;
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
      <ReStyledArrowLink to={`/courts/${id?.toString()}`}>
        Open Court <ArrowIcon />
      </ReStyledArrowLink>
    </Container>
  );
};
export default CourtName;
