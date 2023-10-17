import React, { useState } from "react";
import styled from "styled-components";
import Skeleton from "react-loading-skeleton";
import diogenesImage from "assets/pngs/dashboard/diogenes.png";
import pythagorasImage from "assets/pngs/dashboard/pythagoras.png";
import socratesImage from "assets/pngs/dashboard/socrates.png";
import platoImage from "assets/pngs/dashboard/plato.png";
import aristotelesImage from "assets/pngs/dashboard/aristoteles.png";

const StyledImage = styled.img<{ show: boolean }>`
  width: 189px;
  height: 189px;
  display: ${({ show }) => (show ? "block" : "none")};
`;

const StyledSkeleton = styled(Skeleton)`
  width: 189px;
  height: 189px;
`;

const images = [diogenesImage, pythagorasImage, socratesImage, platoImage, aristotelesImage];

interface IPixelArt {
  level: number;
}

const PixelArt: React.FC<IPixelArt> = ({ level }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  return (
    <div>
      {!imageLoaded && <StyledSkeleton />}
      <StyledImage
        src={images[level]}
        alt="Pixel Art per Level"
        onLoad={() => setImageLoaded(true)}
        show={imageLoaded}
      />
    </div>
  );
};

export default PixelArt;
