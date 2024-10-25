import React from "react";
import styled from "styled-components";

import { commify } from "utils/commify";

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
  isStaking: boolean;
  currentEffectiveStake: number;
  currentSpecificStake: number;
  amountToStake: number;
}

const QuantityToSimulate: React.FC<IQuantityToSimulate> = ({
  isStaking,
  currentEffectiveStake,
  currentSpecificStake,
  amountToStake,
}) => {
  return (
    <Container>
      <Quantity>{commify(currentEffectiveStake)} PNK</Quantity>
      <TextWithTooltipContainer>
        <WithHelpTooltip
          tooltipMsg={`Current Stake (Sum of): Amount of PNK staked in this court (${commify(
            currentSpecificStake
          )} PNK); Amount of PNK staked on its sub-courts (${commify(
            currentEffectiveStake - currentSpecificStake
          )} PNK)`}
        >
          Current Stake
        </WithHelpTooltip>
      </TextWithTooltipContainer>
      <StyledMathematicalOperation>{isStaking ? "+" : "-"}</StyledMathematicalOperation>
      <Quantity>{commify(amountToStake)} PNK</Quantity>
      <StyledMathematicalOperation>=</StyledMathematicalOperation>
      <FinalQuantity>
        {isStaking ? commify(currentEffectiveStake + amountToStake) : commify(currentEffectiveStake - amountToStake)}{" "}
        PNK
      </FinalQuantity>
    </Container>
  );
};
export default QuantityToSimulate;
