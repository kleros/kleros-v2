/** Integer arithmetic helpers for token amounts (bigint, smallest unit). */

export const BPS = 10_000n;

export function applyBps(amount: bigint, bps: bigint | number): bigint {
  return (amount * BigInt(bps)) / BPS;
}

/** `amount * numerator / denominator`, floored. Throws on a zero denominator. */
export function mulDiv(amount: bigint, numerator: bigint, denominator: bigint): bigint {
  if (denominator === 0n) throw new Error("mulDiv: zero denominator");
  return (amount * numerator) / denominator;
}

/**
 * Splits `total` in proportion to `weights`. Rounding dust goes to the largest weight, so the parts
 * always sum to `total`. All-zero weights give zero parts and the whole total to the first entry.
 */
export function splitProRata(total: bigint, weights: readonly bigint[]): bigint[] {
  if (weights.length === 0) throw new Error("splitProRata: no weights");
  if (total < 0n || weights.some((w) => w < 0n)) throw new Error("splitProRata: negative input");
  const sum = weights.reduce((acc, w) => acc + w, 0n);
  if (sum === 0n) {
    const parts = weights.map(() => 0n);
    parts[0] = total;
    return parts;
  }
  const parts = weights.map((w) => (total * w) / sum);
  const assigned = parts.reduce((acc, p) => acc + p, 0n);
  let largest = 0;
  weights.forEach((w, i) => {
    if (w > weights[largest]!) largest = i;
  });
  parts[largest] = parts[largest]! + (total - assigned);
  return parts;
}

/** Basis points of loss between an expected and a received amount; 0 when received >= expected. */
export function lossBps(expected: bigint, received: bigint): number {
  if (expected <= 0n) return 0;
  if (received >= expected) return 0;
  return Number(((expected - received) * BPS) / expected);
}

export function maxBigint(...values: bigint[]): bigint {
  return values.reduce((a, b) => (a > b ? a : b));
}

export function minBigint(...values: bigint[]): bigint {
  return values.reduce((a, b) => (a < b ? a : b));
}
