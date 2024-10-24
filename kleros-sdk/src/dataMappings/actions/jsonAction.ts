import { JsonMapping } from "../utils/actionTypes";
import { createResultObject } from "../utils/createResultObject";

export const jsonAction = (mapping: JsonMapping) => {
  const { value, seek, populate } = mapping;

  // Parse the source if it's a JSON string
  const parsedValue = typeof value === "string" ? JSON.parse(value) : value;

  return createResultObject(parsedValue, seek, populate);
};
