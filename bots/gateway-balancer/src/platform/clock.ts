import type { Clock } from "../ports";

export function abortError(): Error {
  const error = new Error("aborted");
  error.name = "AbortError";
  return error;
}

/** Wall-clock time; `sleep` rejects with an `AbortError` as soon as the signal aborts. */
export const systemClock: Clock = {
  now: () => new Date(),
  sleep: (ms, signal) =>
    new Promise<void>((resolve, reject) => {
      if (signal?.aborted) return reject(abortError());
      const onAbort = () => {
        clearTimeout(timer);
        reject(abortError());
      };
      const timer = setTimeout(() => {
        signal?.removeEventListener("abort", onAbort);
        resolve();
      }, ms);
      signal?.addEventListener("abort", onAbort, { once: true });
    }),
};
