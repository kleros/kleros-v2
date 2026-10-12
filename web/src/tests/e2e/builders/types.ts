/** Recursive partial of a codegen entity type; the subgraph mock fills omitted fields with empty values. */
export type Fake<T> = T extends readonly (infer U)[]
  ? Fake<U>[]
  : T extends (...args: never[]) => unknown
    ? T
    : T extends object
      ? { [K in keyof T]?: Fake<T[K]> | ((args: Record<string, unknown>) => unknown) }
      : T;

/** Clock the `clock` fixture installs before every navigation: 2026-01-15T12:00:00Z. */
export const E2E_NOW = Date.UTC(2026, 0, 15, 12, 0, 0);
export const NOW_SECONDS = Math.floor(E2E_NOW / 1000);

export const HOUR = 3600;
export const DAY = 24 * HOUR;

/** Seconds since epoch, `offset` seconds from E2E_NOW, as the subgraph's BigInt string. */
export const secondsFromNow = (offset: number) => String(NOW_SECONDS + offset);

export const pnk = (amount: number | string) => (BigInt(amount) * 10n ** 18n).toString();
export const eth = (amount: number) => (BigInt(Math.round(amount * 1e6)) * 10n ** 12n).toString();
