import React from "react";
import styled, { useTheme } from "styled-components";

import EthIcon from "assets/svgs/icons/eth.svg";
import PnkIcon from "assets/svgs/icons/kleros.svg";

import NumberDisplay from "components/NumberDisplay";

const Container = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  flex-wrap: wrap;
`;

const StyledIcon = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;

  path {
    fill: ${({ color }) => color};
  }
`;

const StyledLabel = styled.label<{ color: string }>`
  color: ${({ color }) => color};
`;
interface IRewardsAndFundLabel {
  value: string;
  unit: "ETH" | "PNK";
  isFund?: boolean;
}

const RewardsAndFundLabel: React.FC<IRewardsAndFundLabel> = ({ value, unit = "ETH", isFund = false }) => {
  const theme = useTheme();
  const isWon = Number(value) > 0;
  const color = isWon ? theme.success : theme.error;
  return Number(value) !== 0 ? (
    <Container>
      <StyledLabel color={isFund ? theme.tint : color}>
        <NumberDisplay {...{ value, unit }} showUnitInDisplay={false} />
      </StyledLabel>
      <StyledIcon as={unit === "ETH" ? EthIcon : PnkIcon} color={isFund ? theme.tint : color} />
    </Container>
  ) : null;
};

export default RewardsAndFundLabel;
