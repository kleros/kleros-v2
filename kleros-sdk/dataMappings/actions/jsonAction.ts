import { JsonMapping } from "../utils/actionTypes";
import { createResultObject } from "../utils/createResultObject";

export const jsonAction = (mapping: JsonMapping) => {
  const { value: source, seek, populate } = mapping;
  return createResultObject(source, seek, populate);
};
