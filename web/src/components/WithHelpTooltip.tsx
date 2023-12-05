import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { Tooltip } from "@kleros/ui-components-library";
import _HelpIcon from "svgs/menu-icons/help.svg";

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const HelpIcon = styled(_HelpIcon)`
  display: flex;
  align-items: center;
  height: 12px;
  width: 12px;
  fill: ${({ theme }) => theme.secondaryText};
  margin: 0 0 0 8px;

  ${landscapeStyle(
    () => css`
      height: 14px;
      width: 14px;
    `
  )}
`;

interface IWithHelpTooltip {
  tooltipMsg: string;
  place?: "bottom" | "left" | "right" | "top";
  children?: React.ReactNode;
}

const WithHelpTooltip: React.FC<IWithHelpTooltip> = ({ tooltipMsg, children, place }) => (
  <Container>
    {children}
    <Tooltip small text={tooltipMsg} {...{ place }}>
      <HelpIcon />
    </Tooltip>
  </Container>
);

export default WithHelpTooltip;
