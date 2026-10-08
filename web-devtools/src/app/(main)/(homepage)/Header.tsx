import React from "react";

import Typewriter from "typewriter-effect";

import { cn } from "utils/cn";

const Header: React.FC = () => {
  const Phrases = ["Manage Courts", "Get Insights", "Edit Dispute Templates", "Get PNK Faucets", "Boost productivity"];

  return (
    <div className="flex justify-between">
      <h1
        className={cn(
          "mb-12 flex gap-2 text-[length:calc(21px+(24-21)*(min(max(100vw,375px),1250px)-375px)/875)]",
          "font-medium tracking-[1px]"
        )}
      >
        Developer Toolkit:
        <div className="[&_.typewriter-text]:text-klerosUIComponentsSecondaryPurple">
          <Typewriter
            options={{
              strings: Phrases,
              autoStart: true,
              loop: true,
              wrapperClassName: "typewriter-text",
            }}
          />
        </div>
      </h1>
    </div>
  );
};

export default Header;
