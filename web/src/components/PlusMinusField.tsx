import React from "react";

import Ellipse from "svgs/icons/ellipse.svg";
import Minus from "svgs/icons/minus.svg";
import Plus from "svgs/icons/plus.svg";

import { cn } from "utils/cn";

interface IPlusMinusField {
  currentValue: number;
  updateValue: (currentValue: number) => void;
  minValue?: number;
  className?: string;
}
const PlusMinusField: React.FC<IPlusMinusField> = ({ currentValue, updateValue, minValue = 0, className }) => {
  const incrementValue = () => updateValue(++currentValue);
  const decrementValue = () => currentValue > minValue && updateValue(--currentValue);
  return (
    <div className={cn("mt-8 mb-12 flex gap-2", className)}>
      <button className="relative cursor-pointer rounded-full border-0 bg-transparent p-0" onClick={incrementValue}>
        <Ellipse className="[&_circle]:fill-klerosUIComponentsPrimaryBlue" />
        <Plus className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 fill-white" />
      </button>
      <button className="relative cursor-pointer rounded-full border-0 bg-transparent p-0" onClick={decrementValue}>
        <Ellipse
          className={cn(
            "[&_circle]:fill-klerosUIComponentsPrimaryBlue",
            currentValue === minValue && "[&_circle]:[fill-opacity:0.12]"
          )}
        />
        <Minus className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 fill-white" />
      </button>
    </div>
  );
};

export default PlusMinusField;
