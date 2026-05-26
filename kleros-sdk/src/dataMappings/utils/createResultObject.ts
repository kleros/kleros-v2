export const createResultObject = (
  sourceData: unknown,
  seek: string[],
  populate: string[],
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  const getNestedValue = (obj: unknown, path: string) => {
    return path.split(".").reduce((acc, part) => {
      if (!acc) return undefined;
      const accRecord = acc as Record<string, unknown>;

      if (part.includes("[")) {
        const [key, index] = part.replace(/\]/g, "").split("[");
        const innerData = accRecord[key];
        return innerData
          ? (innerData as Record<string, unknown>)[index]
          : undefined;
      }

      return accRecord[part];
    }, obj);
  };

  seek.forEach((key, idx) => {
    const foundValue = getNestedValue(sourceData, key);
    if (foundValue !== undefined) {
      result[populate[idx]] = foundValue;
    }
  });

  return result;
};
