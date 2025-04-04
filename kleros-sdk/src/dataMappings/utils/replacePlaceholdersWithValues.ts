import mustache from "mustache";
import retrieveVariables from "./retrieveVariables";
import { ActionMapping } from "./actionTypes";
import { InvalidContextError } from "../../errors";
import { isUndefined } from ".";

export function replacePlaceholdersWithValues(
  mapping: ActionMapping,
  context: Record<string, unknown>
): ActionMapping | ActionMapping[] {
  function replace(obj: ActionMapping): ActionMapping | ActionMapping[] {
    if (typeof obj === "string") {
      validateContext(obj, context);
      return mustache.render(obj, context) as unknown as ActionMapping;
    } else if (Array.isArray(obj)) {
      return obj.map(replace) as unknown as ActionMapping[];
    } else if (typeof obj === "object" && obj !== null) {
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [key, replace(value)])
      ) as unknown as ActionMapping[];
    } else {
      return obj;
    }
  }

  return replace(mapping);
}

/**
 *
 * @param template
 * @param context
 * @description retrieves all variables from a template and validates if they are provided in the context
 */
const validateContext = (template: string, context: Record<string, unknown>) => {
  const variables = retrieveVariables(template);

  variables.forEach((variable) => {
    if (isUndefined(context[variable]))
      throw new InvalidContextError(`Expected key "${variable}" to be provided in context.`);
  });
  return true;
};
