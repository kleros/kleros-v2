import React from "react";
import styled from "styled-components";
import Skeleton from "react-loading-skeleton";

import { commify } from "utils/commify";
import { isUndefined } from "utils/index";

import WithHelpTooltip from "components/WithHelpTooltip";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 0 8px;
`;

const TextWithTooltipContainer = styled.div`
  color: ${({ theme }) => theme.secondaryPurple};
  font-size: 14px;

  > div {
    svg {
      fill: ${({ theme }) => theme.secondaryPurple};
      margin-left: 4px;
    }
  }
`;

const Quantity = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.primaryText};
  margin: 0;
`;

const FinalQuantity = styled(Quantity)`
  font-weight: 600;
`;

const StyledMathematicalOperation = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.secondaryText};
  margin: 0;
`;

interface IQuantityToSimulate {
  jurorCurrentEffectiveStake: number | undefined;
  jurorCurrentSpecificStake: number | undefined;
  isStaking: boolean;
  amountToStake: number;
}

const QuantityToSimulate: React.FC<IQuantityToSimulate> = ({
  isStaking,
  jurorCurrentEffectiveStake,
  jurorCurrentSpecificStake,
  amountToStake,
}) => {
  const effectiveStakeDisplay = !isUndefined(jurorCurrentEffectiveStake) ? (
    `${commify(jurorCurrentEffectiveStake)} PNK`
  ) : (
    <Skeleton width={50} />
  );

  const amountStakedInThisCourt = !isUndefined(jurorCurrentSpecificStake)
    ? `${commify(jurorCurrentSpecificStake)} PNK`
    : "...";

  const amountStakedInSubCourts =
    !isUndefined(jurorCurrentEffectiveStake) && !isUndefined(jurorCurrentSpecificStake)
      ? `${commify(jurorCurrentEffectiveStake - jurorCurrentSpecificStake)} PNK`
      : "...";

  const finalQuantityValue =
    !isUndefined(jurorCurrentEffectiveStake) && !isUndefined(amountToStake)
      ? isStaking
        ? jurorCurrentEffectiveStake + amountToStake
        : jurorCurrentEffectiveStake - amountToStake
      : undefined;

  const finalQuantityDisplay = !isUndefined(finalQuantityValue) ? (
    `${commify(finalQuantityValue)} PNK`
  ) : (
    <Skeleton width={50} />
  );

  return (
    <Container>
      <Quantity>{effectiveStakeDisplay}</Quantity>
      <TextWithTooltipContainer>
        <WithHelpTooltip
          tooltipMsg={`Current Stake (Sum of): Amount of PNK staked in this court (${amountStakedInThisCourt}); Amount of PNK staked on its sub-courts (${amountStakedInSubCourts})`}
        >
          Current Stake
        </WithHelpTooltip>
      </TextWithTooltipContainer>
      <StyledMathematicalOperation>{isStaking ? "+" : "-"}</StyledMathematicalOperation>
      <Quantity>{commify(amountToStake)} PNK</Quantity>
      <StyledMathematicalOperation>=</StyledMathematicalOperation>
      <FinalQuantity>{finalQuantityDisplay}</FinalQuantity>
    </Container>
  );
};

export default QuantityToSimulate;
