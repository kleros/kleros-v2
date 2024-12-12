import React from "react";
import styled, { css } from "styled-components";

import { FallbackProps } from "react-error-boundary";

import { Button } from "@kleros/ui-components-library";

import ErrorIcon from "svgs/icons/warning-outline.svg";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import HeroImage from "./HeroImage";

const Container = styled.div`
  width: 100%;
  height: 100vh;
  background-color: ${({ theme }) => theme.lightBackground};
  padding: ${responsiveSize(32, 80)} ${responsiveSize(24, 136)} ${responsiveSize(76, 96)};
  max-width: 1400px;
  margin: 0 auto;
`;

const ErrorContainer = styled.div`
  display: flex;
  width: 100%;
  gap: 48px 16px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  ${landscapeStyle(
    () => css`
      flex-direction: row;
      justify-content: space-between;
    `
  )}
`;

const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  align-items: center;
  flex: 1;
  ${landscapeStyle(
    () => css`
      align-items: start;
    `
  )}
`;

const textCss = css`
  margin: 0;
  text-align: center;
  white-space: pre-line;

  ${landscapeStyle(
    () => css`
      text-align: left;
    `
  )}
`;

const Header = styled.h1`
  ${textCss}
`;

const Subtitle = styled.h3`
  ${textCss}
  max-width: 735px;
`;

const HeaderIconContainer = styled.div`
  svg {
    width: 64px;
    height: 64px;
    path {
      fill: ${({ theme }) => theme.error};
    }
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 16px;
`;

const IconContainer = styled.div`
  svg {
    width: 250px;
    height: 250px;
    path {
      fill: ${({ theme }) => theme.whiteBackground};
    }
  }
`;

const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  // eslint-disable-next-line no-console
  console.log("Error:", { error });

  return (
    <>
      <HeroImage />
      <Container>
        <ErrorContainer>
          <InfoWrapper>
            <HeaderIconContainer>
              <ErrorIcon />
            </HeaderIconContainer>
            <Header>Ooops, Something went wrong in Athens!</Header>
            <Subtitle>Please reload the page or contact us if the issue is not resolved.</Subtitle>
            <ButtonsContainer>
              <Button text={"Reload"} onClick={resetErrorBoundary} />
              <a href={"https://t.me/kleros"} target="_blank" rel="noreferrer">
                <Button text={"Contact us"} />
              </a>
            </ButtonsContainer>
          </InfoWrapper>
          <IconContainer>
            <ErrorIcon />
          </IconContainer>
        </ErrorContainer>
      </Container>
    </>
  );
};

export default ErrorFallback;
