import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const FieldContainer = styled.div<FieldContainerProps>`
  width: ${({ isList }) => (isList ? "auto" : "100%")};
  display: flex;
  align-items: center;
  justify-content: flex-start;
  white-space: nowrap;
  .value {
    flex-grow: ${({ isList }) => (isList ? "0" : "1")};
    text-align: ${({ isList }) => (isList ? "center" : "end")};
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
`;

type FieldContainerProps = {
  width?: string;
  isList?: boolean;
};

interface IField {
  icon: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  name: string;
  value: string;
  link?: string;
  width?: string;
  displayAsList?: boolean;
}

const Field: React.FC<IField> = ({ icon: Icon, name, value, link, width, displayAsList }) => {
  return (
    <FieldContainer isList={displayAsList} width={width}>
      {!displayAsList && (
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
