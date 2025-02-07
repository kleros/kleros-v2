import React from "react";

import { Tooltip } from "@kleros/ui-components-library";

import { commify } from "utils/commify";
interface INumberDisplay {
  value: string | number;
  unit?: string;
  showUnitInDisplay?: boolean;
  decimals?: number;
  place?: "bottom" | "top" | "left" | "right";
  isCurrency?: boolean; //currency units are shown in front
}

const getFormattedValue = (value: number, decimals: number) => {
  const withFixedDecimals = value % 1 !== 0 ? value.toFixed(decimals) : value.toFixed(0);
  if (value !== 0) {
    if (withFixedDecimals === `0.${"0".repeat(decimals)}`) {
      return `< 0.${"0".repeat(decimals - 1)}1`;
    } else if (withFixedDecimals === `-0.${"0".repeat(decimals)}`) {
      return `> -0.${"0".repeat(decimals - 1)}1`;
    }
  }
  return withFixedDecimals;
};

const NumberDisplay: React.FC<INumberDisplay> = ({
  value,
  unit,
  place,
  decimals = 2,
  showUnitInDisplay = true,
  isCurrency = false,
}) => {
  const parsedValue = Number(value);
  const formattedValue = commify(getFormattedValue(parsedValue, decimals));
  const tooltipValue = isCurrency ? `${unit} ${value}` : `${value} ${unit}`;
  const displayUnit = showUnitInDisplay ? unit : "";
  const displayValue = isCurrency ? `${displayUnit} ${formattedValue}` : `${formattedValue} ${displayUnit}`;
  return (
    <Tooltip small text={tooltipValue} place={place}>
      {displayValue}
    </Tooltip>
  );
};

export default NumberDisplay;
