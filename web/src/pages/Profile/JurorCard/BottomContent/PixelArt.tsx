import React, { useState } from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";

import aristotelesImage from "assets/pngs/dashboard/aristoteles.png";
import diogenesImage from "assets/pngs/dashboard/diogenes.png";
import platoImage from "assets/pngs/dashboard/plato.png";
import pythagorasImage from "assets/pngs/dashboard/pythagoras.png";
import socratesImage from "assets/pngs/dashboard/socrates.png";

const Container = styled.div`
  display: flex;
  justify-content: center;
`;

interface IStyledImage {
  show: boolean;
  width: number | string;
  height: number | string;
}

const StyledImage = styled.img<IStyledImage>`
  width: ${({ width }) => width};
  height: ${({ height }) => height};
  display: ${({ show }) => (show ? "block" : "none")};
`;

interface IStyledSkeleton {
  width: number | string;
  height: number | string;
}

const StyledSkeleton = styled(Skeleton)<IStyledSkeleton>`
  width: ${({ width }) => width};
  height: ${({ height }) => height};
`;

const images = [diogenesImage, pythagorasImage, socratesImage, platoImage, aristotelesImage];

interface IPixelArt {
  level: number;
  width: number | string;
  height: number | string;
}

const PixelArt: React.FC<IPixelArt> = ({ level, width, height }) => {
  const { t } = useTranslation();
  const [imageLoaded, setImageLoaded] = useState(false);
  return (
    <Container>
      {!imageLoaded && <StyledSkeleton width={width} height={height} />}
      <StyledImage
        src={images[level]}
        alt={t("profile.pixel_art_alt")}
        onLoad={() => setImageLoaded(true)}
        show={imageLoaded}
        width={width}
        height={height}
      />
    </Container>
  );
};

export default PixelArt;
