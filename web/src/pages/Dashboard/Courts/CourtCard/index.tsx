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
  padding: 21px 24px 25px 19px;
  border-left: 5px solid ${({ theme }) => theme.secondaryPurple};
  flex-wrap: wrap;
  gap: 24px;

  ${({ theme }) => (theme.name === "light" ? `box-shadow: 0px 2px 3px 0px ${theme.stroke};` : "")}

  ${landscapeStyle(
    () =>
      css`
        padding: 21.5px 32px 21.5px 27px;
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
    <Container>
      <CourtName {...{ name, id }} />
      <Stake {...{ stake }} />
    </Container>
  );
};

export default CourtCard;
