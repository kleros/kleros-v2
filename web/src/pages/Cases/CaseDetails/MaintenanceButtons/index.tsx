import React, { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import { Periods } from "src/consts/periods";
import { Period } from "src/graphql/graphql";

import DottedMenuButton from "components/DottedMenuButton";
import { EnsureChain } from "components/EnsureChain";
import { Overlay } from "components/Overlay";

import DistributeRewards from "./DistributeRewards";
import DrawButton from "./DrawButton";
import ExecuteRulingButton from "./ExecuteRuling";
import PassPeriodButton from "./PassPeriodButton";
import WithdrawAppealFees from "./WithdrawAppealFees";

export interface IBaseMaintenanceButton {
  setIsOpen: (open: boolean) => void;
  id?: string;
}

const MaintenanceButtons: React.FC = () => {
  const { id } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [displayRipple, setDisplayRipple] = useState(false);

  const { data } = useDisputeDetailsQuery(id);
  const dispute = data?.dispute;

  // using interval here instead of useMemo with dispute, since we can't tell when period has timed out,
  // we can use useCountdown, but that would trigger the update every 1 sec. so this is ideal.
  useEffect(() => {
    const rippleCheck = () => {
      if (!dispute) return;

      const period = Periods[dispute?.period] ?? 0;
      const now = Date.now() / 1000;

      if (
        (dispute.period !== Period.Execution &&
          now > parseInt(dispute.lastPeriodChange) + parseInt(dispute.currentRound.timesPerPeriod[period])) ||
        (dispute.period === Period.Execution && !dispute.ruled)
      ) {
        setDisplayRipple(true);
        return;
      }

      setDisplayRipple(false);
    };

    // initial check
    rippleCheck();

    const intervalId = setInterval(() => {
      if (!dispute) return;

      if (dispute.ruled) {
        clearInterval(intervalId);
        return;
      }
      rippleCheck();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [dispute]);

  const toggle = () => setIsOpen((prevValue) => !prevValue);
  return (
    <div className="w-[36px] h-[36px] flex justify-center items-center relative">
      {isOpen ? (
        <>
          <Overlay onClick={() => setIsOpen(false)} />
          <div className="flex flex-col absolute h-fit overflow-y-auto z-31 p-6.75 gap-4 border border-solid border-klerosUIComponentsStroke bg-klerosUIComponentsWhiteBackground rounded-[3px] [box-shadow:0px_2px_3px_rgba(0,_0,_0,_0.06)] bottom-0 left-0 [transform:translate(-100%,_100%)]">
            <EnsureChain>
              <>
                <DrawButton
                  {...{ id, setIsOpen }}
                  numberOfVotes={dispute?.currentRound.nbVotes}
                  period={dispute?.period}
                  disputeKitAddress={dispute?.currentRound?.disputeKit?.address ?? undefined}
                />
                <PassPeriodButton {...{ id, setIsOpen }} period={dispute?.period} />
                <ExecuteRulingButton {...{ id, setIsOpen }} period={dispute?.period} ruled={dispute?.ruled} />
                <DistributeRewards
                  {...{ id, setIsOpen }}
                  roundIndex={dispute?.currentRoundIndex}
                  period={dispute?.period}
                />
                <WithdrawAppealFees
                  {...{ id, setIsOpen }}
                  roundIndex={parseInt(dispute?.currentRoundIndex ?? "0", 10)}
                  period={dispute?.period}
                  ruled={dispute?.ruled}
                />
              </>
            </EnsureChain>
          </div>
        </>
      ) : null}
      <DottedMenuButton {...{ toggle, displayRipple }} />
    </div>
  );
};

export default MaintenanceButtons;
