import React from "react";
import styled, { css } from "styled-components";

import type { JurorAction } from "utils/jurorActions";

import { landscapeStyle } from "styles/landscapeStyle";

import ActionRow from "./ActionRow";

// Wide rows share these columns, so deadlines and buttons line up from one row to the next.
const List = styled.ul<{ $isCompact: boolean }>`
  margin: 0;
  padding: 0;
  list-style: none;

  ${({ $isCompact }) =>
    !$isCompact &&
    landscapeStyle(
      () => css`
        display: grid;
        grid-template-columns: minmax(0, 1fr) fit-content(280px) auto;
      `
    )}
`;

interface IActionList {
  actions: readonly JurorAction[];
  /** Always stack each row, for narrow containers. Rows stack below the landscape breakpoint anyway. */
  isCompact?: boolean;
  id?: string;
  onLinkClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

/** Rows linking to each case's voting tab. The first action still due gets the filled button. */
const ActionList: React.FC<IActionList> = ({ actions, isCompact = false, id, onLinkClick }) => {
  const nextKey = actions.find(({ isSubmitted }) => !isSubmitted)?.key;
  return (
    // role="list": Safari drops list semantics from lists without bullets.
    <List {...{ id }} role="list" $isCompact={isCompact}>
      {actions.map((action) => (
        <ActionRow key={action.key} isPrimary={action.key === nextKey} {...{ action, isCompact, onLinkClick }} />
      ))}
    </List>
  );
};

export default ActionList;
