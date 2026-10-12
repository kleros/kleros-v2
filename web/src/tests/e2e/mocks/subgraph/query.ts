/** The subset of The Graph's collection arguments the app uses, applied to in-memory entities. */
export type CollectionArgs = {
  first?: number;
  skip?: number;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
  where?: Record<string, unknown> | null;
};

type Entity = Record<string, any>;

const OPERATORS = [
  "_not_in",
  "_in",
  "_not",
  "_gte",
  "_gt",
  "_lte",
  "_lt",
  "_contains_nocase",
  "_contains",
  "_starts_with",
  "_ends_with",
] as const;

const read = (entity: Entity, field: string) => {
  const raw = entity?.[field];
  return raw !== null && typeof raw === "object" && !Array.isArray(raw) ? raw.id : raw;
};

const isNumeric = (value: unknown) => typeof value === "string" && /^-?\d+$/.test(value);

const compare = (a: unknown, b: unknown): number => {
  if (isNumeric(a) && isNumeric(b)) {
    const diff = BigInt(a as string) - BigInt(b as string);
    return diff === 0n ? 0 : diff > 0n ? 1 : -1;
  }
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a ?? "").localeCompare(String(b ?? ""));
};

// Hex ids are lowercase in the subgraph; the app sometimes passes checksummed addresses.
const same = (a: unknown, b: unknown) =>
  typeof a === "string" && typeof b === "string" && a.startsWith("0x")
    ? a.toLowerCase() === b.toLowerCase()
    : String(a) === String(b);

export const matchesWhere = (entity: Entity, where: Record<string, unknown> | null | undefined): boolean => {
  if (!where) return true;
  return Object.entries(where).every(([key, expected]) => {
    if (expected === undefined || key === "_change_block") return true;
    if (key === "and") return (expected as Entity[]).every((w) => matchesWhere(entity, w));
    if (key === "or") return (expected as Entity[]).some((w) => matchesWhere(entity, w));
    if (key.endsWith("_") && !key.endsWith("__")) {
      const related = entity?.[key.slice(0, -1)];
      if (Array.isArray(related)) return related.some((r) => matchesWhere(r, expected as Entity));
      return related != null && matchesWhere(related, expected as Entity);
    }
    const operator = OPERATORS.find((op) => key.endsWith(op));
    const field = operator ? key.slice(0, -operator.length) : key;
    const actual = read(entity, field);
    switch (operator) {
      case undefined:
        return same(actual, expected);
      case "_not":
        return !same(actual, expected);
      case "_in":
        return (expected as unknown[]).some((e) => same(actual, e));
      case "_not_in":
        return !(expected as unknown[]).some((e) => same(actual, e));
      case "_gt":
        return compare(actual, expected) > 0;
      case "_gte":
        return compare(actual, expected) >= 0;
      case "_lt":
        return compare(actual, expected) < 0;
      case "_lte":
        return compare(actual, expected) <= 0;
      case "_contains":
        return String(actual ?? "").includes(String(expected));
      case "_contains_nocase":
        return String(actual ?? "")
          .toLowerCase()
          .includes(String(expected).toLowerCase());
      case "_starts_with":
        return String(actual ?? "").startsWith(String(expected));
      case "_ends_with":
        return String(actual ?? "").endsWith(String(expected));
    }
  });
};

export const select = <T extends Entity>(items: readonly T[], args: CollectionArgs = {}): T[] => {
  const { first = 100, skip = 0, orderBy, orderDirection = "asc", where } = args;
  const filtered = items.filter((item) => matchesWhere(item, where));
  if (orderBy) {
    const direction = orderDirection === "desc" ? -1 : 1;
    filtered.sort((a, b) => direction * compare(read(a, orderBy), read(b, orderBy)));
  }
  return filtered.slice(skip, skip + first);
};
