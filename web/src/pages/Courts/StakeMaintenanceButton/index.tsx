import React, { useEffect, useState } from "react";

import { cn } from "utils/cn";

import DottedMenuButton from "components/DottedMenuButton";
import { EnsureChain } from "components/EnsureChain";
import { Overlay } from "components/Overlay";
import Phase from "components/Phase";

import ExecuteDelayedStakeButton from "./ExecuteDelayedStakeButton";
import PassPhaseButton from "./PassPhaseButton";

export interface IBaseStakeMaintenanceButton {
  setIsOpen: (open: boolean) => void;
}

interface IStakeMaintenanceButtons {
  className?: string;
}
const StakeMaintenanceButtons: React.FC<IStakeMaintenanceButtons> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const openDefault = location.hash.includes("#maintenance");
    if (openDefault) setIsOpen(true);
  }, []);

  const toggle = () => setIsOpen((prevValue) => !prevValue);
  return (
    <div {...{ className }} className={cn("w-[36px] h-[36px] flex justify-center items-center relative", className)}>
      {isOpen ? (
        <>
          <Overlay onClick={() => setIsOpen(false)} />
          <div className="flex flex-col absolute h-fit overflow-y-auto z-31 p-6.75 gap-4 border border-solid border-klerosUIComponentsStroke bg-klerosUIComponentsWhiteBackground rounded-[3px] [box-shadow:0px_2px_3px_rgba(0,_0,_0,_0.06)] bottom-0 left-0 [transform:translate(-100%,_100%)]">
            <EnsureChain>
              <>
                <Phase />
                <PassPhaseButton {...{ setIsOpen }} />
                <ExecuteDelayedStakeButton {...{ setIsOpen }} />
              </>
            </EnsureChain>
          </div>
        </>
      ) : null}
      <DottedMenuButton {...{ toggle }} displayRipple={false} />
    </div>
  );
};

export default StakeMaintenanceButtons;
