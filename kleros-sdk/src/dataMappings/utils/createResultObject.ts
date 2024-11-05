export const createResultObject = (
  sourceData: Record<string, any>,
  seek: string[],
  populate: string[]
): Record<string, any> => {
  const result: Record<string, any> = {};

  const getNestedValue = (obj: any, path: string) => {
    return path.split(".").reduce((acc, part) => {
      if (acc && part.includes("[")) {
        const [key, index] = part.replace(/\]/g, "").split("[");
        return acc[key]?.[index];
      }
      return acc ? acc[part] : undefined;
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
