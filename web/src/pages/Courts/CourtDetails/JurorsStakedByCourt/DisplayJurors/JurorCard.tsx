import React from "react";

import JurorLink from "components/JurorLink";

import Stake from "./Stake";

interface IJurorCard {
  address: string;
  effectiveStake: string;
}

const JurorCard: React.FC<IJurorCard> = ({ address, effectiveStake }) => {
  return (
    <div className="[transition:0.1s] flex justify-between w-full bg-klerosUIComponentsWhiteBackground border border-solid border-klerosUIComponentsStroke border-t-0 items-center p-[16px_20px] [&:hover]:[background-color:color-mix(in_srgb,_var(--klerosUIComponentsLightGrey)_73.33333333333333%,_transparent)]">
      <JurorLink {...{ address }} smallDisplay />
      <Stake {...{ effectiveStake }} />
    </div>
  );
};

export default JurorCard;
