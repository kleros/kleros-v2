import { commify } from "./commify";

export function beautifyStatNumber(value: number, invertValue: boolean = false): string {
  const absValue = Math.abs(value);

  if (absValue >= 1e9) {
    return `${commify((value / 1e9).toFixed(2))}B`;
  } else if (absValue >= 1e6) {
    return `${commify((value / 1e6).toFixed(2))}M`;
  } else if (absValue >= 1e3) {
    return `${commify((value / 1e3).toFixed(0))}K`;
  } else if (absValue > 0 && absValue < 1) {
    if (invertValue) {
      const inverseValue = 1 / absValue;
      return commify(inverseValue.toFixed(0));
    } else {
      return value.toFixed(2);
    }
  }

  return commify(value.toFixed(0));
}
