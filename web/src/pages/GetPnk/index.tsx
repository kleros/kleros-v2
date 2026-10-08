import React from "react";

import { isProductionDeployment } from "consts/index";

import ClaimPnkButton from "components/ClaimPnkButton";
import HeroImage from "components/HeroImage";
import ScrollTop from "components/ScrollTop";

import { Widget } from "./Widget";

const GetPnk: React.FC = () => (
  <div className="w-full">
    <HeroImage />
    <div className="w-full bg-klerosUIComponentsLightBackground p-[16px_16px_40px] max-w-[1400px] m-[0_auto] flex flex-col items-center justify-center gap-6 lg:p-[16px_calc(0px_+_(132_-_0)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))_60px]">
      {!isProductionDeployment() && <ClaimPnkButton />}
      <Widget />
    </div>
    <ScrollTop />
  </div>
);
export default GetPnk;
