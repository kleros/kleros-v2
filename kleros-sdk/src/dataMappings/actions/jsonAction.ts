import { JsonMapping } from "../utils/actionTypes";
import { createResultObject } from "src/dataMappings/utils/createResultObject";

export const jsonAction = (mapping: JsonMapping) => {
  const { value: source, seek, populate } = mapping;
  return createResultObject(source, seek, populate);
};
