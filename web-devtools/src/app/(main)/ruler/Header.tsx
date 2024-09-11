import React from "react";
import styled from "styled-components";

const Container = styled.h2`
  border-bottom: 1px solid ${({ theme }) => theme.klerosUIComponentsStroke};
  padding: 8px 0px;
`;

const Header: React.FC<{ text: string }> = ({ text }) => <Container>{text}</Container>;

export default Header;
