export interface Clock {
  now(): Date;
  /** Resolves after `ms`; rejects with an `AbortError` when `signal` aborts first. */
  sleep(ms: number, signal?: AbortSignal): Promise<void>;
}
