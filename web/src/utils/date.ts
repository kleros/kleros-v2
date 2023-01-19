export function getCurrentTime() {
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
