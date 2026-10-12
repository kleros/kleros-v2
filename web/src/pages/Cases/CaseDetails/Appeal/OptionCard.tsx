import React, { useMemo } from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";
import { useMeasure } from "react-use";
import { formatEther } from "viem";

import { Card, LinearProgress, CustomRadioItem, RadioIndicator } from "@kleros/ui-components-library";

import Gavel from "svgs/icons/gavel.svg";

import { isUndefined } from "utils/index";

import { hoverShortTransitionTiming } from "styles/commonStyles";
import { landscapeStyle } from "styles/landscapeStyle";

const StyledItem = styled(CustomRadioItem)`
  width: 100%;
`;

const StyledCard = styled(Card)`
  ${hoverShortTransitionTiming}
  width: 100%;
  padding: 16px;

  ${landscapeStyle(
    () => css`
      padding: 24px;
    `
  )}
`;

const WinnerLabel = styled.label<{ winner: boolean }>`
  color: ${({ theme, winner }) => (winner ? theme.success : theme.warning)};
  svg {
    width: 12px;
    margin-right: 8px;
    fill: ${({ theme, winner }) => (winner ? theme.success : theme.warning)};
  }
`;

const TopContainer = styled.div`
  display: flex;
  justify-content: space-between;
  height: 50%;
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-width: 0;
`;

const BlockLabel = styled.label`
  display: block;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
`;

const LabelContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const ProgressContainer = styled.div`
  width: 100%;
`;

interface IOptionCard {
  /** The option id; used as the radio group value when `selectable` is true. */
  value: string;
  text: string;
  funding: bigint;
  required?: bigint;
  winner?: boolean;
  /** When true, the card is wrapped in a `CustomRadioItem` (must live inside a `CustomRadio`)
   *  and renders a radio indicator. When false, the card is plain and can be rendered anywhere. */
  selectable?: boolean;
  /** Only meaningful when `selectable` is true; gates the radio item. */
  canBeSelected?: boolean;
}

const CardBody: React.FC<{
  text: string;
  fundingLabel: string;
  progress: number;
  width: number;
  winner: boolean;
  innerRef: (el: HTMLDivElement) => void;
  rightSlot?: React.ReactNode;
  role?: string;
  t: (key: string) => string;
}> = ({ text, fundingLabel, progress, width, winner, innerRef, rightSlot, role, t }) => (
  <StyledCard hover role={role}>
    <TopContainer>
      <TextContainer>
        <BlockLabel>{text}</BlockLabel>
        <WinnerLabel winner={winner}>
          <Gavel />
          {t("appeal.jury_decision")} - {winner ? t("appeal.winner") : t("appeal.loser")}
        </WinnerLabel>
      </TextContainer>
      {rightSlot}
    </TopContainer>
    <LabelContainer>
      <label>{fundingLabel}</label>
    </LabelContainer>
    <ProgressContainer ref={innerRef}>
      <LinearProgress value={progress} width={width} />
    </ProgressContainer>
  </StyledCard>
);

const OptionCard: React.FC<IOptionCard> = ({
  value,
  text,
  funding,
  required,
  winner,
  selectable = true,
  canBeSelected = true,
}) => {
  const { t } = useTranslation();
  const [ref, { width }] = useMeasure<HTMLDivElement>();
  const [fundingLabel, progress] = useMemo(() => {
    if (!isUndefined(required))
      if (funding >= required) return [t("appeal.fully_funded"), 100];
      else
        return [
          t("appeal.funding_progress", { funded: formatEther(funding), required: formatEther(required) }),
          Number((funding * 100n) / required),
        ];
    else if (funding > 0n) return [t("appeal.funded_with_amount", { amount: formatEther(funding) }), 30];
    else return [t("appeal.no_contributions"), 0];
  }, [funding, required, t]);

  if (!selectable) {
    return (
      <CardBody
        text={text}
        fundingLabel={fundingLabel}
        progress={progress}
        width={width}
        winner={!!winner}
        innerRef={ref}
        role="listitem"
        t={t}
      />
    );
  }

  return (
    <StyledItem value={value} isDisabled={!canBeSelected}>
      {(rp) => (
        <CardBody
          text={text}
          fundingLabel={fundingLabel}
          progress={progress}
          width={width}
          winner={!!winner}
          innerRef={ref}
          rightSlot={canBeSelected ? <RadioIndicator {...rp} /> : null}
          t={t}
        />
      )}
    </StyledItem>
  );
};

export default OptionCard;
