"use client";
import React from "react";
import styled from "styled-components";

import { responsiveSize } from "styles/responsiveSize";

import HeroImage from "components/HeroImage";

import Header from "./Header";
import Tools from "./Tools";

const Container = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.klerosUIComponentsLightBackground};
  padding: ${responsiveSize(32, 72)} ${responsiveSize(24, 132)} ${responsiveSize(76, 96)};
  max-width: 1780px;
  margin: 0 auto;
`;

const Home: React.FC = () => {
  return (
    <div>
      <HeroImage />
      <Container>
        <Header />
        <Tools />
      </Container>
    </div>
  );
};

export default Home;
