import React, { useRef } from "react";

import { useTranslation } from "react-i18next";
import { useClickAway } from "react-use";

import Curate from "svgs/icons/curate-image.png";
import Resolver from "svgs/icons/dispute-resolver.svg";
import Escrow from "svgs/icons/escrow.svg";
import Governor from "svgs/icons/governor.svg";
import Court from "svgs/icons/kleros.svg";
import POH from "svgs/icons/poh-image.png";
import Scout from "svgs/icons/scout.svg";
import Vea from "svgs/icons/vea.svg";

import { KLEROS_SCOUT_URL } from "consts/index";
import { cn } from "utils/cn";

import Product from "./Product";

const ITEMS = [
  {
    text: "Court V2",
    Icon: Court,
    url: "https://v2.kleros.builders/",
  },
  {
    text: "Curate V2",
    Icon: Curate,
    url: "https://curate-v2.netlify.app/",
  },
  {
    text: "Resolver V2",
    Icon: Resolver,
    url: "https://v2.kleros.builders/#/resolver",
  },
  {
    text: "Escrow V2",
    Icon: Escrow,
    url: "https://escrow-v2.kleros.builders/",
  },
  {
    text: "Court V1",
    Icon: Court,
    url: "https://court.kleros.io/",
  },
  {
    text: "Curate V1",
    Icon: Curate,
    url: "https://curate.kleros.io",
  },
  {
    text: "Resolver V1",
    Icon: Resolver,
    url: "https://resolve.kleros.io",
  },
  {
    text: "Escrow V1",
    Icon: Escrow,
    url: "https://escrow.kleros.io",
  },
  {
    text: "Vea",
    Icon: Vea,
    url: "https://veascan.io",
  },
  {
    text: "Kleros Scout",
    Icon: Scout,
    url: KLEROS_SCOUT_URL,
  },
  {
    text: "POH V2",
    Icon: POH,
    url: "https://v2.proofofhumanity.id",
  },
  {
    text: "Governor",
    Icon: Governor,
    url: "https://governor.kleros.io",
  },
];

interface IDappList {
  toggleIsDappListOpen: () => void;
}

const DappList: React.FC<IDappList> = ({ toggleIsDappListOpen }) => {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  useClickAway(containerRef, () => toggleIsDappListOpen());

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex absolute max-h-[340px] top-[5%] left-[50%] [transform:translate(-50%)] z-1 flex-col items-center",
        "w-[86vw] max-w-[480px] rounded-[3px] border border-solid border-klerosUIComponentsStroke",
        "bg-klerosUIComponentsWhiteBackground [box-shadow:0px_2px_3px_rgba(0,_0,_0,_0.06)] [&_svg]:visible",
        "lg:mt-16 lg:top-0 lg:left-0 lg:right-auto lg:[transform:none]",
        "lg:w-[calc(300px_+_(480_-_300)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] lg:max-h-[80vh]"
      )}
    >
      <h1 className="pt-6 text-[24px] font-semibold leading-[32.68px]">{t("navigation.kleros_solutions")}</h1>
      <div
        className={cn(
          "grid overflow-y-auto",
          "p-[4px_calc(8px_+_(24_-_8)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))_16px_calc(8px_+_(24_-_8)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]",
          "gap-y-2 gap-x-0.5 [justify-items:center] max-w-[480px] min-w-[300px]",
          "w-[calc(300px_+_(480_-_300)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]",
          "[grid-template-columns:repeat(auto-fit,_minmax(100px,_1fr))]"
        )}
      >
        {ITEMS.map((item) => {
          return <Product {...item} key={item.text} />;
        })}
      </div>
    </div>
  );
};
export default DappList;
