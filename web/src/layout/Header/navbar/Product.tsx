import React, { useState } from "react";

import Skeleton from "react-loading-skeleton";

import { cn } from "utils/cn";

import { responsiveSize } from "styles/responsiveSize";

interface IProduct {
  text: string;
  url: string;
  Icon: React.FC<React.SVGAttributes<SVGElement>> | string;
}

const Product: React.FC<IProduct> = ({ text, url, Icon }) => {
  const [isImgLoaded, setIsImgLoaded] = useState(false);

  return (
    <a
      href={url}
      target="_blank"
      className={cn(
        "flex max-w-[100px] cursor-pointer flex-col items-center gap-2 rounded-[3px]",
        "bg-klerosUIComponentsLightBackground px-2 pt-4 pb-7 hover:scale-[1.02]",
        "hover:bg-klerosUIComponentsLightGrey hover:[transition:transform_0.15s,background-color_0.3s]"
      )}
      style={{ width: responsiveSize(100, 130) }}
      rel="noreferrer"
    >
      {typeof Icon === "string" ? (
        <>
          {!isImgLoaded ? <Skeleton width={48} height={46} circle /> : null}
          <img
            className={`size-12 ${isImgLoaded ? "block" : "hidden"}`}
            alt={Icon}
            src={Icon}
            onLoad={() => setIsImgLoaded(true)}
          />
        </>
      ) : (
        <Icon className="size-12 text-klerosUIComponentsPrimaryText" />
      )}
      <small className="flex text-center leading-[19px] font-normal">{text}</small>
    </a>
  );
};

export default Product;
