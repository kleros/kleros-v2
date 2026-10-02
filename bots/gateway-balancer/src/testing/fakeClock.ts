import type { Clock } from "../ports";

export function abortError(): Error {
  const error = new Error("aborted");
  error.name = "AbortError";
  return error;
}

/** Deterministic clock; `sleep` advances it instead of waiting. */
export class FakeClock implements Clock {
  constructor(public current: Date = new Date("2026-01-01T00:00:00Z")) {}

  now(): Date {
    return new Date(this.current.getTime());
  }

  advance(ms: number): void {
    this.current = new Date(this.current.getTime() + ms);
  }

  async sleep(ms: number, signal?: AbortSignal): Promise<void> {
    if (signal?.aborted) throw abortError();
    this.advance(ms);
  }
}
