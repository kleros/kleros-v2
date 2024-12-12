import { commify } from "./commify";

export function beautifyStatNumber(value: number, invertValue: boolean = false): string {
  const absValue = Math.abs(value);

  if (absValue >= 1e9) {
    return `${commify((value / 1e9).toFixed(2))}B`;
  } else if (absValue >= 1e6) {
    return `${commify((value / 1e6).toFixed(2))}M`;
  } else if (absValue >= 1e3) {
    return `${commify((value / 1e3).toFixed(2))}K`;
  } else if (absValue > 0 && absValue < 1) {
    if (invertValue) {
      const inverseValue = 1 / absValue;
      return beautifyStatNumber(Number(inverseValue));
    } else {
      return value.toFixed(2);
    }
  }

  return commify(value.toFixed(2));
}

export function unbeautifyStatNumber(value: string): number {
  const multiplierMap: Record<string, number> = {
    B: 1e9,
    M: 1e6,
    K: 1e3,
  };

  const regex = /^([\d,.]+)([BMK]?)$/;
  const match = regex.exec(value);

  if (!match) {
    throw new Error("Invalid formatted number string");
  }

  const [, numericPart, unit] = match;
  const numericValue = parseFloat(numericPart.replace(/,/g, ""));

  if (unit && multiplierMap[unit]) {
    return numericValue * multiplierMap[unit];
  }

  return numericValue;
}
