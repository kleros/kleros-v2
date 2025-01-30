export const getCoherencePercent = (num: number, den: number): string => {
  if (den === 0) return "0%";
  return `${Math.floor((num * 100) / den)}%`;
};
