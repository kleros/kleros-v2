import mustache from "mustache";
import retrieveVariables from "./retrieveVariables";

export const replacePlaceholdersWithValues = (mapping: any, context: Record<string, unknown>) => {
  const replace = (obj) => {
    if (typeof obj === "string") {
      validateContext(obj, context);
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

/**
 *
 * @param template
 * @param context
 * @description retrieves all variables from a template and validates if they are provided in the context
 */
const validateContext = (template: string, context: Record<string, unknown>) => {
  const variables = retrieveVariables(template);

  variables.forEach((variable) => {
    if (!context[variable]) throw new Error(`Expected key :  "${variable}" to be provided in context.`);
  });
  return true;
};
