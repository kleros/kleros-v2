/**
 * JSON with bigint support for journal payloads. A bigint is stored as `{"$bigint":"<decimal>"}`.
 * Dates must be stored as ISO strings by the caller.
 */
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | bigint | JsonValue[] | { [key: string]: JsonValue };

export function stringifyJson(value: JsonValue): string {
  return JSON.stringify(value, (_key, v: unknown) => (typeof v === "bigint" ? { $bigint: v.toString() } : v));
}

export function parseJson(text: string): JsonValue {
  return JSON.parse(text, (_key, v: unknown) => {
    if (v && typeof v === "object" && "$bigint" in v && typeof (v as { $bigint: unknown }).$bigint === "string") {
      return BigInt((v as { $bigint: string }).$bigint);
    }
    return v;
  }) as JsonValue;
}

/** Deep copy through the journal encoding, so callers never share mutable payloads with the store. */
export function cloneJson<T extends JsonValue>(value: T): T {
  return parseJson(stringifyJson(value)) as T;
}
