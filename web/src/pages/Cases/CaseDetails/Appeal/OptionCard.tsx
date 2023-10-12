import React, { useMemo } from "react";
import styled from "styled-components";
import { useMeasure } from "react-use";
import { Card, Radio, LinearProgress } from "@kleros/ui-components-library";
import Gavel from "svgs/icons/gavel.svg";
import { formatEther } from "viem";
import { isUndefined } from "utils/index";

const StyledCard = styled(Card)`
  width: 100%;
  padding: 24px;
  &:hover {
    cursor: pointer;
  }
`;

const WinnerLabel = styled.label<{ winner: boolean }>`
  color: ${({ theme, winner }) => (winner ? theme.success : theme.warning)};
  svg {
    width: 12px;
    margin-right: 8px;
    fill: ${({ theme, winner }) => (winner ? theme.success : theme.warning)};
  }
`;

const StyledRadio = styled(Radio)`
  padding-left: 24px;
  > input {
    display: none;
  }
`;

const TopContainer = styled.div`
  display: flex;
  justify-content: space-between;
  height: 50%;
  .block {
    display: block;
  }
`;

const LabelContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

interface IOptionCard extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
  funding: bigint;
  required?: bigint;
  winner?: boolean;
  selected?: boolean;
  canBeSelected?: boolean;
}

const OptionCard: React.FC<IOptionCard> = ({
  text,
  funding,
  required,
  winner,
  selected,
  canBeSelected = true,
  ...props
}) => {
  const [ref, { width }] = useMeasure();
  const [fundingLabel, progress] = useMemo(() => {
    if (!isUndefined(required))
      if (funding >= required) return ["Fully funded!", 100];
      else
        return [
          `${formatEther(funding)} out of ${formatEther(required)} ETH required.`,
          Number((funding * 100n) / required),
        ];
    else if (funding > 0n) return [`Funded with ${formatEther(funding)} ETH.`, 30];
    else return ["0 ETH contributed to this option", 0];
  }, [funding, required]);
  return (
    <StyledCard ref={ref} hover {...props}>
      <TopContainer>
        <div>
          <small className="block">{text}</small>
          <WinnerLabel winner={winner ? true : false}>
            <Gavel />
            Jury decision - {winner ? "Winner" : "Loser"}
          </WinnerLabel>
        </div>
        {canBeSelected && <StyledRadio label="" checked={selected} />}
      </TopContainer>
      <LabelContainer>
        <label>{fundingLabel}</label>
      </LabelContainer>
      <LinearProgress progress={progress} width={width} />
    </StyledCard>
  );
};

export default OptionCard;
