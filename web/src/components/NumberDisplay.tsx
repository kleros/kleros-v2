import { Tooltip } from "@kleros/ui-components-library";
import React from "react";
interface INumberDisplay {
  value: string | number;
  decimals?: number;
  place?: "bottom" | "top" | "left" | "right";
}

const NumberDisplay: React.FC<INumberDisplay> = ({ value, place, decimals = 2 }) => {
  const parsedValue = Number(value);
  const formattedValue = parsedValue % 1 !== 0 ? parsedValue.toFixed(decimals) : parsedValue.toFixed(0);
  return (
    <Tooltip small text={value.toString()} place={place}>
      {formattedValue}
    </Tooltip>
  );
};

export default NumberDisplay;
