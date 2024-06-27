import React from "react";
import styled, { css } from "styled-components";

import { Link } from "react-router-dom";

import { landscapeStyle } from "styles/landscapeStyle";

const FieldContainer = styled.div<FieldContainerProps>`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  white-space: nowrap;
  width: 100%;
  .value {
    flex-grow: 1;
    text-align: end;
    color: ${({ theme }) => theme.primaryText};
  }

  svg {
    fill: ${({ theme }) => theme.secondaryPurple};
    margin-right: 8px;
    width: 14px;
  }

  ${({ isList }) =>
    isList &&
    css`
      ${landscapeStyle(
        () => css`
          width: auto;
          .value {
            flex-grow: 0;
            text-align: center;
          }
        `
      )}
    `};
  ${({ isOverview, isJurorBalance }) =>
    (isOverview || isJurorBalance) &&
    css`
      ${landscapeStyle(
        () => css`
          width: auto;
          gap: 8px;
          .value {
            flex-grow: 0;
            text-align: none;
            font-weight: 600;
          }
          svg {
            margin-right: 0;
          }
        `
      )}
    `};
`;

const LinkContainer = styled.div``;

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.primaryBlue};
`;

type FieldContainerProps = {
  width?: string;
  isList?: boolean;
  isOverview?: boolean;
  isJurorBalance?: boolean;
};

export interface IField {
  icon: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  name: string;
  value: string;
  link?: string;
  width?: string;
  displayAsList?: boolean;
  isOverview?: boolean;
  isJurorBalance?: boolean;
  className?: string;
}

const Field: React.FC<IField> = ({
  icon: Icon,
  name,
  value,
  link,
  width,
  displayAsList,
  isOverview,
  isJurorBalance,
  className,
}) => {
  return (
    <FieldContainer isList={displayAsList} {...{ isOverview, isJurorBalance, width, className }}>
      <Icon />
      {(!displayAsList || isOverview || isJurorBalance) && <label>{name}:</label>}
      {link ? (
        <LinkContainer className="value">
          <StyledLink
            to={link}
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            {value}
          </StyledLink>
        </LinkContainer>
      ) : (
        <label className="value">{value}</label>
      )}
    </FieldContainer>
  );
};
export default Field;
