import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { useParams } from "react-router-dom";

import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import { Periods } from "src/consts/periods";
import { Period } from "src/graphql/graphql";

import { Overlay } from "components/Overlay";

import DistributeRewards from "./DistributeRewads";
import DrawButton from "./DrawButton";
import ExecuteRulingButton from "./ExecuteRuling";
import MenuButton from "./MenuButton";
import PassPeriodButton from "./PassPeriodButton";

const Container = styled.div`
  width: 36px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const PopupContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  height: fit-content;
  overflow-y: auto;
  z-index: 1;
  padding: 27px 10px;
  gap: 16px;
  border: 1px solid ${({ theme }) => theme.stroke};
  background-color: ${({ theme }) => theme.whiteBackground};
  border-radius: 3px;
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.06);

  bottom: 0;
  left: 0;
  transform: translate(-100%, 100%);
`;

export interface IBaseMaintenaceButton {
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
    const intervalId = setInterval(() => {
      if (!dispute) return;

      if (dispute.ruled) {
        clearInterval(intervalId);
        return;
      }

      const period = Periods[dispute?.period] ?? 0;
      const now = Date.now() / 1000;

      if (
        (dispute.period !== Period.Execution &&
          now > parseInt(dispute.lastPeriodChange) + parseInt(dispute.court.timesPerPeriod[period])) ||
        (dispute.period === Period.Execution && !dispute.ruled)
      ) {
        setDisplayRipple(true);
        return;
      }

      setDisplayRipple(false);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [dispute]);

  return (
    <Container>
      {isOpen ? (
        <>
          <Overlay onClick={() => setIsOpen(false)} />
          <PopupContainer>
            <DrawButton {...{ id, setIsOpen }} numberOfVotes={dispute?.currentRound.nbVotes} />
            <PassPeriodButton {...{ id, setIsOpen }} />
            <DistributeRewards
              {...{ id, setIsOpen }}
              roundIndex={dispute?.currentRoundIndex}
              numberOfVotes={dispute?.currentRound.nbVotes}
            />
            <ExecuteRulingButton {...{ id, setIsOpen }} />
          </PopupContainer>
        </>
      ) : null}
      <MenuButton {...{ setIsOpen, displayRipple }} />
    </Container>
  );
};

export default MaintenanceButtons;
