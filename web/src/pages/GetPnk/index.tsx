import React from "react";
import styled from "styled-components";

import { isProductionDeployment } from "consts/index";

import { responsiveSize } from "styles/responsiveSize";

import ClaimPnkButton from "components/ClaimPnkButton";
import HeroImage from "components/HeroImage";
import ScrollTop from "components/ScrollTop";

import { Widget } from "./Widget";

const Wrapper = styled.div`
  width: 100%;
`;

const Container = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.lightBackground};
  padding: ${responsiveSize(32, 72)} ${responsiveSize(24, 132)} ${responsiveSize(76, 96)};
  max-width: 1780px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
`;

const GetPnk: React.FC = () => (
  <Wrapper>
    <HeroImage />
    <Container>
      {!isProductionDeployment() && <ClaimPnkButton />}
      <Widget />
    </Container>
    <ScrollTop />
  </Wrapper>
);
export default GetPnk;
