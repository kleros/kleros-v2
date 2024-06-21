export const replacePlaceholdersWithValues = (mapping: any, context: any) => {
  let mappingAsString = JSON.stringify(mapping);

  const replacedMapping = mappingAsString.replace(/\{\{(\w+)\}\}/g, (_, variableName) => {
    if (context.hasOwnProperty(variableName)) {
      return context[variableName];
    } else {
      throw new Error(`Variable '${variableName}' not found in context.`);
    }
  });

  const parsedReplacedMapping = JSON.parse(replacedMapping.replace(/"(\{.*?\})"/g, "$1"));
  return parsedReplacedMapping;
};
