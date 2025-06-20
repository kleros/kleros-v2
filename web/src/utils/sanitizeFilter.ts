export const sanitizeFilter = <T extends Record<string, any>>(f?: T) => {
  if (!f) return undefined as unknown as T;
  const cleaned = Object.fromEntries(Object.entries(f).filter(([_, v]) => !(Array.isArray(v) && v.length === 0)));
  return Object.keys(cleaned).length ? (cleaned as T) : undefined;
};
