// Can this be replaced by Mustache ?
export const createResultObject = (sourceData, seek, populate) => {
  const result = {};

  seek.forEach((key, idx) => {
    let foundValue = sourceData;

    if (key.includes(".")) {
      const keyParts = key.split(".");
      for (const part of keyParts) {
        if (foundValue[part] !== undefined) {
          foundValue = foundValue[part];
        } else {
          foundValue = undefined;
          break;
        }
      }
    } else {
      if (typeof sourceData !== "object" || key === "0") {
        foundValue = sourceData;
      } else {
        foundValue = sourceData[key];
      }
    }

    console.log(`Seek key: ${key}, Found value:`, foundValue);
    if (foundValue !== undefined) {
      result[populate[idx]] = foundValue;
      console.log(`Populate key: ${populate[idx]}, Value to add:`, foundValue);
    }
  });
  console.log("Result object:", result);
  return result;
};
