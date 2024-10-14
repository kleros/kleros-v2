import mustache from "mustache";
import { ActionMapping } from "./actionTypes";

export function replacePlaceholdersWithValues(
  mapping: ActionMapping,
  context: Record<string, unknown>
): ActionMapping | ActionMapping[] {
  function replace(obj: ActionMapping): ActionMapping | ActionMapping[] {
    if (typeof obj === "string") {
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
