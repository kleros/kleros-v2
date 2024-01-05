export const replacePlaceholdersWithValues = (mapping: any, results: any) => {
  let mappingAsString = JSON.stringify(mapping);

  const replacedMapping = mappingAsString.replace(/results\.([A-Za-z0-9_]+)/g, (_, variableName) => {
    if (results.hasOwnProperty(variableName)) {
      return results[variableName];
    } else {
      throw new Error(`Variable '${variableName}' not found in results.`);
    }
  });

  return JSON.parse(replacedMapping);
};
