import React, { FC, SVGAttributes } from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";

const StyledImage = styled.div`
  width: calc(260px + (460 - 260) * (min(max(100vw, 375px), 1250px) - 375px) / 875);

  ${landscapeStyle(
    () => css`
      width: 389px;
    `
  )}
`;

interface IImageRenderer {
  image: FC<SVGAttributes<SVGElement>>;
}

const ImageRenderer: FC<IImageRenderer> = ({ image }) => {
  return <StyledImage as={image} />;
};

export default ImageRenderer;
