import React from "react";
import styled from "styled-components";
import { ScrollbarContainer } from "@kleros/ui-components-library";
import StyledTitle from "./title";

const Wrapper = styled.div`
  height: auto;
  width: auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const StyledScrollbarContainer = styled(ScrollbarContainer)`
  width: 100%;
  height: 45px;
  flex: 1;
`;

interface IStyledTable {
  columns: number;
  rows: number;
}

const StyledTable = styled.div<IStyledTable>`
  width: 100%;
  height: auto;
  display: grid;
  grid-template-rows: repeat(${({ rows }) => rows}, 45px);
  grid-template-columns: repeat(${({ columns }) => columns}, auto);
  background: ${({ theme }) => theme.stroke};
`;

const Cell = styled.div`
  background: ${({ theme }) => theme.whiteBackground};
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.stroke};

  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => theme.primaryText};
`;

const TopCell = styled(Cell)`
  position: sticky;
  top: 0;
`;

interface ITable {
  title: string;
  columnNames: string[];
  rows: (string | React.ReactNode)[][];
}

const Table: React.FC<ITable> = ({ title, columnNames, rows, ...props }) => (
  <Wrapper {...props}>
    <StyledTitle>{title}</StyledTitle>
    <StyledScrollbarContainer>
      <StyledTable columns={columnNames.length} rows={rows.length + 1}>
        {columnNames.map((name: string, i: number) => (
          <TopCell key={i}>
            <h2>{name}</h2>
          </TopCell>
        ))}
        {rows.map((row) =>
          row.map((item, i: number) => <Cell key={i}>{item}</Cell>)
        )}
      </StyledTable>
    </StyledScrollbarContainer>
  </Wrapper>
);

export default Table;
