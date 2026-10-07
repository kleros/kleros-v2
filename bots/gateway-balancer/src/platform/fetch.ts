/**
 * `ports.fetch`: the global `fetch` with a request timeout, so a hung HTTP call never holds the tick slot.
 * A caller's own signal still applies.
 */
export function createTimedFetch(
  timeoutMs: number,
  base: typeof globalThis.fetch = globalThis.fetch
): typeof globalThis.fetch {
  return (input, init) => {
    const timeout = AbortSignal.timeout(timeoutMs);
    const signal = init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
    return base(input, { ...init, signal });
  };
}
