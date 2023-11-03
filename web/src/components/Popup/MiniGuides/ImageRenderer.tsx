import React, { FC, SVGAttributes } from "react";
import styled, { useTheme, css } from "styled-components";
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
  darkModeImage: FC<SVGAttributes<SVGElement>>;
  lightModeImage: FC<SVGAttributes<SVGElement>>;
}

const ImageRenderer: FC<IImageRenderer> = ({ darkModeImage, lightModeImage }) => {
  const theme = useTheme();
  const image = theme.name === "dark" ? darkModeImage : lightModeImage;

  return <StyledImage as={image} />;
};

export default ImageRenderer;
