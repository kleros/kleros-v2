export const roundDecimals = (value: string, decimals: number): string => {
  const numberValue = parseFloat(value);
  const roundedValue = Math.round(numberValue * Math.pow(10, decimals)) / Math.pow(10, decimals);
  return roundedValue.toString();
};
