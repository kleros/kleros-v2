export function getCurrentTime(): number {
  return Math.floor(Date.now() / 1000);
}

export function getTimeLeft(deadline: number): number {
  const currentTime = getCurrentTime();
  return Math.max(deadline - currentTime, 0);
}

export function secondsToDayHourMinute(seconds: number): string {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${s}s`;
}

export function getOneYearAgoTimestamp(): number {
  const currentTime = new Date().getTime() / 1000;
  return currentTime - 31536000; // One year in seconds
}

export function formatDate(unixTimestamp: number, withTime = false): string {
  const date = new Date(unixTimestamp * 1000);
  const options: Intl.DateTimeFormatOptions = withTime
    ? {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        timeZone: "GMT",
        timeZoneName: "short",
      }
    : { month: "long", day: "2-digit", year: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

/**
 * Calculates the time left until a specified date and formats it.
 *
 * @param {string} isoString - An ISO 8601 formatted date string (e.g., "2024-10-29T09:52:08.580Z").
 * @returns {string} A human-readable string indicating the time left until the specified date.
 * @example
 * console.log(timeLeftUntil("2024-10-29T09:52:08.580Z"));
 * // Outputs: "in x secs", "in x mins", "in x hrs", or "after October 29, 2024"
 */
export function timeLeftUntil(isoString: string): string {
  const targetDate = new Date(isoString);
  const now = new Date();
  const timeDifference = targetDate.getTime() - now.getTime();

  if (timeDifference <= 0) {
    return "The date has already passed.";
  }

  const secondsLeft = Math.floor(timeDifference / 1000);
  const minutesLeft = Math.floor(secondsLeft / 60);
  const hoursLeft = Math.floor(minutesLeft / 60);
  const daysLeft = Math.floor(hoursLeft / 24);

  if (secondsLeft < 60) {
    return `in ${secondsLeft} sec${secondsLeft > 1 ? "s" : ""}`;
  } else if (minutesLeft < 60) {
    return `in ${minutesLeft} min${minutesLeft > 1 ? "s" : ""}`;
  } else if (hoursLeft < 24) {
    return `in ${hoursLeft} hr${hoursLeft > 1 ? "s" : ""}`;
  } else if (daysLeft < 2) {
    return `in ${daysLeft} day${daysLeft > 1 ? "s" : ""}`;
  } else {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
    return `after ${targetDate.toLocaleDateString("en-US", options)}`;
  }
}
