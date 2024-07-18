"use client";
import React from "react";
import styled from "styled-components";

import Link from "next/link";

import KlerosCourtLogo from "svgs/header/devtools-logo.svg";

const Container = styled.div`
  position: sticky;
  z-index: 1;
  top: 0;
  width: 100%;
  background-color: ${({ theme }) => theme.klerosUIComponentsPrimaryPurple};
  display: flex;
  flex-wrap: wrap;
`;

const HeaderContainer = styled.div`
  width: 100%;
  padding: 8px 24px 8px;
`;

const Header: React.FC = () => {
  return (
    <Container>
      <HeaderContainer>
        <Link href="/">
          <KlerosCourtLogo />
        </Link>
      </HeaderContainer>
    </Container>
  );
};

export default Header;
