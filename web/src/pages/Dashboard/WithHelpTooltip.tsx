import React from "react";
import styled from "styled-components";
import { Tooltip } from "@kleros/ui-components-library";
import _HelpIcon from "svgs/menu-icons/help.svg";

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const HelpIcon = styled(_HelpIcon)`
  fill: ${({ theme }) => theme.secondaryText};
  margin: 4px;
`;

interface IWithHelpTooltip {
  tooltipMsg: string;
  place?: "bottom" | "left" | "right" | "top";
  children?: React.ReactNode;
}

const WithHelpTooltip: React.FC<IWithHelpTooltip> = ({
  tooltipMsg,
  children,
  place,
}) => (
  <Container>
    {children}
    <Tooltip small text={tooltipMsg} {...{ place }}>
      <HelpIcon />
    </Tooltip>
  </Container>
);

export default WithHelpTooltip;
