export const replacePlaceholdersWithValues = (mapping: any, context: any) => {
  let mappingAsString = JSON.stringify(mapping);
  console.log("Replacing placeholders in mapping:", mappingAsString);

  const replacedMapping = mappingAsString.replace(/\{\{(\w+)\}\}/g, (_, variableName) => {
    if (context.hasOwnProperty(variableName)) {
      const value = context[variableName];
      console.log(`Replacing placeholder: ${variableName} with value:`, value);

      if (typeof value === "string" && value.startsWith("{") && value.endsWith("}")) {
        return JSON.stringify(value);
      } else {
        return typeof value === "bigint" ? value.toString() : value;
      }
    } else {
      throw new Error(`Variable '${variableName}' not found in context.`);
    }
  });

  const parsedMapping = JSON.parse(replacedMapping.replace(/"(\{.*\})"/, "$1"));
  console.log("Mapping after placeholder replacement:", parsedMapping);
  return parsedMapping;
};
