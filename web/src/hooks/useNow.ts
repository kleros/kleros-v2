import { useCallback, useSyncExternalStore } from "react";

import { getCurrentTime } from "utils/date";

interface Ticker {
  now: number;
  listeners: Set<() => void>;
  stop?: () => void;
}

const tickers = new Map<number, Ticker>();

const getTicker = (intervalMs: number) => {
  let ticker = tickers.get(intervalMs);
  if (!ticker) {
    ticker = { now: getCurrentTime(), listeners: new Set() };
    tickers.set(intervalMs, ticker);
  }
  return ticker;
};

/**
 * Current unix time in seconds, refreshed every `intervalMs`.
 * Components using the same interval read the same value, so they never disagree mid-tick.
 */
export const useNow = (intervalMs: number) => {
  const subscribe = useCallback(
    (onTick: () => void) => {
      const ticker = getTicker(intervalMs);
      if (ticker.listeners.size === 0) {
        const tick = () => {
          ticker.now = getCurrentTime();
          ticker.listeners.forEach((listener) => listener());
        };
        // Hidden tabs throttle timers: catch up as soon as the page is visible again.
        const onVisibilityChange = () => {
          if (document.visibilityState === "visible") tick();
        };
        ticker.now = getCurrentTime();
        const timer = setInterval(tick, intervalMs);
        document.addEventListener("visibilitychange", onVisibilityChange);
        ticker.stop = () => {
          clearInterval(timer);
          document.removeEventListener("visibilitychange", onVisibilityChange);
        };
      }
      ticker.listeners.add(onTick);
      return () => {
        ticker.listeners.delete(onTick);
        if (ticker.listeners.size === 0) ticker.stop?.();
      };
    },
    [intervalMs]
  );
  const getSnapshot = useCallback(() => getTicker(intervalMs).now, [intervalMs]);

  return useSyncExternalStore(subscribe, getSnapshot);
};
