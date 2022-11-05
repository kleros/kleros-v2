export const getTimeLeft = (origin: number, progress: number): number => {
  const currentTime = Math.floor(new Date().getTime() / 1000);
  return Math.max(origin + progress - currentTime, 0);
};

export const secondsToDayHourMinute = (seconds: number): string => {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.ceil((seconds % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
};
