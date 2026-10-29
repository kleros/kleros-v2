// Latest time a JS Date can hold, in seconds.
const MAX_DATE = 8.64e12;

/**
 * Nominal end of the dispute's current period, in unix seconds.
 * Undefined when the data is missing, the period has no duration (execution) or the end is out of a Date's range.
 */
export const getPeriodDeadline = (
  periodIndex: number,
  lastPeriodChange?: string,
  timesPerPeriod?: readonly string[]
): number | undefined => {
  const duration = timesPerPeriod?.[periodIndex];
  if (lastPeriodChange === undefined || duration === undefined) return undefined;

  const deadline = parseInt(lastPeriodChange, 10) + parseInt(duration, 10);
  return Number.isSafeInteger(deadline) && deadline <= MAX_DATE ? deadline : undefined;
};
