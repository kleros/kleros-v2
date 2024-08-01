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

export function getOneWeekAgoTimestamp(): number {
  const currentTime = new Date().getTime();
  return currentTime - 604800000; // One week in milliseconds
}

export function formatDate(unixTimestamp: number, withTime = false): string {
  const date = new Date(unixTimestamp * 1000);
  const options: Intl.DateTimeFormatOptions = withTime
    ? {
        month: "long",
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
