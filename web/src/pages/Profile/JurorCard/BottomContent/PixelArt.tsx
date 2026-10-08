import React, { useState } from "react";

import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";

import aristotelesImage from "assets/pngs/dashboard/aristoteles.png";
import diogenesImage from "assets/pngs/dashboard/diogenes.png";
import platoImage from "assets/pngs/dashboard/plato.png";
import pythagorasImage from "assets/pngs/dashboard/pythagoras.png";
import socratesImage from "assets/pngs/dashboard/socrates.png";

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
    <div className="flex justify-center">
      {!imageLoaded && <Skeleton width={width} height={height} />}
      <img
        src={images[level]}
        alt={t("profile.pixel_art_alt")}
        onLoad={() => setImageLoaded(true)}
        className={imageLoaded ? "block" : "hidden"}
        style={{ width, height }}
        width={width}
        height={height}
      />
    </div>
  );
};

export default PixelArt;
