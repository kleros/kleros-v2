"use client";
import React, { useEffect, useState } from "react";

import { useAccount } from "wagmi";

import { DEFAULT_CHAIN } from "consts/chains";
import RulerContextProvider from "context/RulerContext";
import { cn } from "utils/cn";

import ConnectWallet from "components/ConnectWallet";

import ChangeDeveloper from "./ChangeDeveloper";
import ManualRuling from "./ManualRuling";
import RulingModes from "./RulingModes";
import SelectArbitrable from "./SelectArbitrable";

const Ruler: React.FC = () => {
  const { isConnected, chainId } = useAccount();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);
  return (
    <RulerContextProvider>
      <div
        className={cn(
          "mx-8 my-4 flex min-h-[calc(100vh-160px)] flex-col items-center gap-12",
          "px-[calc(16px+(132-16)*(min(max(100vw,375px),1250px)-375px)/875)]",
          "pt-[calc(32px+(72-32)*(min(max(100vw,375px),1250px)-375px)/875)]",
          "pb-[calc(76px+(96-76)*(min(max(100vw,375px),1250px)-375px)/875)]"
        )}
      >
        <h1>Ruler</h1>
        <SelectArbitrable />
        {isClient && (!isConnected || chainId !== DEFAULT_CHAIN) ? <ConnectWallet className="self-start" /> : null}
        <RulingModes />
        <ManualRuling />
        <ChangeDeveloper />
      </div>
    </RulerContextProvider>
  );
};
export default Ruler;
