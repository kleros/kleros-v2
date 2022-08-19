import React from "react";
import styled from "styled-components";
import { Tooltip } from "@kleros/ui-components-library";
import HelpIcon from "components/HelpIcon";

const Container = styled.div`
  display: flex;
  align-items: center;
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
