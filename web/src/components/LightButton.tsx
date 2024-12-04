import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";

import { Button } from "@kleros/ui-components-library";

const StyledButton = styled(Button)`
  background-color: transparent;
  padding: 8px !important;
  border-radius: 7px;
  .button-text {
    color: ${({ theme }) => theme.primaryText};
    font-weight: 400;
  }
  .button-svg {
    fill: ${({ theme }) => theme.white}BF !important;
  }

  &:hover {
    .button-svg {
      fill: ${({ theme }) => theme.white} !important;
    }
    transition: background-color 0.1s;
    background-color: ${({ theme }) => theme.whiteLowOpacityStrong};
  }

  ${landscapeStyle(
    () => css`
      padding: 8px !important;
      .button-svg {
        margin-right: 0;
      }
    `
  )}
`;

interface ILightButton {
  text: string;
  Icon?: React.FC<React.SVGAttributes<SVGElement>>;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  className?: string;
}

const LightButton: React.FC<ILightButton> = ({ text, Icon, onClick, disabled, className }) => (
  <StyledButton variant="primary" small {...{ text, Icon, onClick, disabled, className }} />
);

export default LightButton;
