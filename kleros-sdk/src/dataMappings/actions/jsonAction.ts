import { JsonMapping } from "../utils/actionTypes";
import { createResultObject } from "src/dataMappings/utils/createResultObject";

export const jsonAction = (mapping: JsonMapping) => {
  const { value: source, seek, populate } = mapping;
  let sourceData;

  try {
    sourceData = JSON.parse(source);
  } catch (error) {
    console.error("Failed to parse source as JSON:", source);
    throw error;
  }

  return createResultObject(sourceData, seek, populate);
};
