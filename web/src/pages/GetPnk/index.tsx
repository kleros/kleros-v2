import React from "react";
import styled, { css } from "styled-components";

import { MAX_WIDTH_LANDSCAPE, landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import { isProductionDeployment } from "consts/index";

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
  padding: 16px 16px 40px;
  max-width: ${MAX_WIDTH_LANDSCAPE};
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;

  ${landscapeStyle(
    () => css`
      padding: 16px ${responsiveSize(0, 132)} 60px;
    `
  )}
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
