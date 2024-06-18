export const replacePlaceholdersWithValues = (mapping: any, context: any) => {
  let mappingAsString = JSON.stringify(mapping);

  const replacedMapping = mappingAsString.replace(/\{\{(\w+)\}\}/g, (_, variableName) => {
    if (context.hasOwnProperty(variableName)) {
      const value = context[variableName];

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
  return parsedMapping;
};
