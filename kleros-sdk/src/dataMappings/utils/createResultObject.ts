// Can this be replaced by Mustache?
export const createResultObject = (sourceData, seek, populate) => {
  const result = {};
  console.log("Creating result object from source data:", sourceData);

  seek.forEach((key, idx) => {
    let foundValue = sourceData;
    const keyParts = key.split(".");
    console.log(`Processing seek key: ${key}, split into parts:`, keyParts);

    for (const part of keyParts) {
      if (part.includes("[")) {
        const [arrayKey, index] = part.replace("]", "").split("[");
        if (foundValue[arrayKey] && foundValue[arrayKey][index] !== undefined) {
          foundValue = foundValue[arrayKey][index];
        } else {
          foundValue = undefined;
          break;
        }
      } else {
        if (foundValue[part] !== undefined) {
          foundValue = foundValue[part];
        } else {
          foundValue = undefined;
          break;
        }
      }
    }

    console.log(`Found value for key ${key}:`, foundValue);
    if (foundValue !== undefined) {
      result[populate[idx]] = foundValue;
      console.log(`Populating result with key ${populate[idx]}:`, foundValue);
    }
  });

  console.log("Final result object:", result);
  return result;
};
