import { Tooltip } from "@kleros/ui-components-library";
import React from "react";
interface INumberDisplay {
  value: string | number;
  unit?: string;
  showUnitInDisplay?: boolean;
  decimals?: number;
  place?: "bottom" | "top" | "left" | "right";
  isCurrency?: boolean; //currency units are shown in front
}

const NumberDisplay: React.FC<INumberDisplay> = ({
  value,
  unit,
  place,
  decimals = 2,
  showUnitInDisplay = true,
  isCurrency = false,
}) => {
  const parsedValue = Number(value);
  const formattedValue = parsedValue % 1 !== 0 ? parsedValue.toFixed(decimals) : parsedValue.toFixed(0);
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
