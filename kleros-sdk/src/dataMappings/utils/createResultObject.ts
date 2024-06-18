// Can this be replaced by Mustache?
export const createResultObject = (sourceData, seek: string[], populate: string[]) => {
  const result = {};

  const getNestedValue = (obj: any, path: string) => {
    return path.split(".").reduce((acc, part) => {
      if (acc && part.includes("[")) {
        const [key, index] = part.replace("]", "").split("[");
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
