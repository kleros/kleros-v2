import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";

const Container = styled.h1`
  margin-bottom: 32px;
  width: 84vw;
  text-align: center;

  ${landscapeStyle(
    () => css`
      width: auto;
    `
  )}
`;

interface IHeader {
  text: string;
}

const Header: React.FC<IHeader> = ({ text }) => {
  return <Container>{text}</Container>;
};
export default Header;
