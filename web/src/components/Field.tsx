import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { Link } from "react-router-dom";

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
    width: 15px;
  }

  .link {
    color: ${({ theme }) => theme.primaryBlue};
    :hover {
      cursor: pointer;
    }
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
  ${({ isOverview }) =>
    isOverview &&
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

type FieldContainerProps = {
  width?: string;
  isList?: boolean;
  isOverview?: boolean;
};

interface IField {
  icon: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  name: string;
  value: string;
  link?: string;
  width?: string;
  displayAsList?: boolean;
  isOverview?: boolean;
}

const Field: React.FC<IField> = ({ icon: Icon, name, value, link, width, displayAsList, isOverview }) => {
  return (
    <FieldContainer isList={displayAsList} isOverview={isOverview} width={width}>
      {(!displayAsList || isOverview) && (
        <>
          <Icon />
          <label>{name}:</label>
        </>
      )}
      {link ? (
        <Link className="link value" to={link}>
          {value}
        </Link>
      ) : (
        <label className="value">{value}</label>
      )}
    </FieldContainer>
  );
};

export default Field;
