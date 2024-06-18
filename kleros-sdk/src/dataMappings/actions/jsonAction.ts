import { JsonMapping } from "../utils/actionTypes";
import { createResultObject } from "src/dataMappings/utils/createResultObject";

export const jsonAction = (mapping: JsonMapping) => {
  const { value: source, seek, populate } = mapping;
  const sourceData = JSON.parse(source);

  return createResultObject(sourceData, seek, populate);
};
