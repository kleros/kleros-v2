import React from "react";
import styled, { type CSSProperties, keyframes } from "styled-components";

import KlerosIcon from "svgs/icons/kleros.svg";

type Width = CSSProperties["width"];
type Height = CSSProperties["height"];

const breathing = keyframes`
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.3);
  }

  100% {
    transform: scale(1);
  }
`;

const StyledKlerosIcon = styled(KlerosIcon)`
  path {
    fill: ${({ theme }) => theme.klerosUIComponentsStroke};
  }
  animation: ${breathing} 2s ease-out infinite normal;
`;

const Container = styled.div<{ width?: Width; height?: Height; center?: boolean }>`
  width: ${({ width }) => width ?? "100%"};
  height: ${({ height }) => height ?? "100%"};
  margin: ${({ center }) => center ? "auto" : "initial"};
`;

interface ILoader {
  width?: Width;
  height?: Height;
  center?: boolean;
  className?: string;
}

const Loader: React.FC<ILoader> = ({ width, height, center, className }) => {
  return (
    <Container {...{ width, height, center, className }}>
      <StyledKlerosIcon />
    </Container>
  );
};

export default Loader;
