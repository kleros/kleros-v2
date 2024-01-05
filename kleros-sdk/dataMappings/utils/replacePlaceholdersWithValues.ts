export const replacePlaceholdersWithValues = (mapping, context) => {
  let newMapping = { ...mapping };
  for (const key of Object.keys(newMapping)) {
    if (typeof newMapping[key] === "string" && context.hasOwnProperty(newMapping[key])) {
      newMapping[key] = context[newMapping[key]];
    }
  }
  return newMapping;
};
