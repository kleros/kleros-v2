import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

interface IField {
  icon: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  name: string;
  value: string;
  link?: string;
  width?: string;
}

type FieldContainerProps = {
  width?: string;
};

const Field: React.FC<IField> = ({ icon: Icon, name, value, link, width }) => (
  <FieldContainer width={width}>
    {<Icon />}
    <label>{name}:</label>
    {link ? (
      <Link className="link value" to={link}>
        {value}
      </Link>
    ) : (
      <label className="value">{value}</label>
    )}
  </FieldContainer>
);

export default Field;

const FieldContainer = styled.div<FieldContainerProps>`
  width: ${({ width = "100%" }) => width};
  display: flex;
  align-items: center;
  justify-content: flex-start;
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
`;
