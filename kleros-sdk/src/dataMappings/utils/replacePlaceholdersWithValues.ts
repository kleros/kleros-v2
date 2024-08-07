import mustache from "mustache";

export const replacePlaceholdersWithValues = (mapping: any, context: Record<string, unknown>) => {
  const replace = (obj) => {
    if (typeof obj === "string") {
      return mustache.render(obj, context);
    } else if (Array.isArray(obj)) {
      return obj.map(replace);
    } else if (typeof obj === "object" && obj !== null) {
      return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, replace(value)]));
    } else {
      return obj;
    }
  };

  return replace(mapping);
};
