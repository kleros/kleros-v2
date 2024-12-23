import React from "react";
import styled, { css } from "styled-components";

import { Card as _Card } from "@kleros/ui-components-library";

import { landscapeStyle } from "styles/landscapeStyle";

import CourtName from "./CourtName";
import Stake from "./Stake";

const Container = styled(_Card)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: auto;
  width: 100%;
  padding: 20px 16px 24px;
  border-left: 5px solid ${({ theme }) => theme.secondaryPurple};
  flex-wrap: wrap;
  gap: 16px;

  :hover {
    cursor: auto;
  }

  ${({ theme }) => (theme.name === "light" ? `box-shadow: 0px 2px 3px 0px ${theme.stroke};` : "")}

  ${landscapeStyle(
    () => css`
      padding: 21.5px 32px;
    `
  )}
`;

interface ICourtCard {
  name: string;
  stake: string;
  id: string;
}

const CourtCard: React.FC<ICourtCard> = ({ name, stake, id }) => {
  return (
    <Container hover>
      <CourtName {...{ name, id }} />
      <Stake {...{ stake }} />
    </Container>
  );
};

export default CourtCard;
