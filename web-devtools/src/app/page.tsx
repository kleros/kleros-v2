"use client";
import React from "react";
import styled from "styled-components";

const StyledText = styled.h1`
  color: ${({ theme }) => theme.klerosUIComponentsPrimaryPurple};
`;

export default function Home() {
  return (
    <main>
      <StyledText>Hello </StyledText>Devtools
    </main>
  );
}
