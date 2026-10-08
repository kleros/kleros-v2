import React from "react";

import EthIcon from "svgs/icons/eth.svg";
import PnkIcon from "svgs/icons/kleros.svg";

import useTheme from "hooks/useTheme";

import NumberDisplay from "components/NumberDisplay";

export interface IRewardsAndFundLabel {
  value: string;
  unit: "ETH" | "PNK";
  isFund?: boolean;
}

const RewardsAndFundLabel: React.FC<IRewardsAndFundLabel> = ({ value, unit = "ETH", isFund = false }) => {
  const theme = useTheme();
  const isWon = Number(value) > 0;
  const color = isFund ? theme.tint : isWon ? theme.success : theme.error;
  const Icon = unit === "ETH" ? EthIcon : PnkIcon;
  return Number(value) !== 0 ? (
    <div className="flex flex-wrap items-center gap-1">
      <label style={{ color }}>
        <NumberDisplay {...{ value, unit }} showUnitInDisplay={false} />
      </label>
      <Icon className="size-3 [&_path]:fill-current" style={{ color }} />
    </div>
  ) : null;
};

export default RewardsAndFundLabel;
