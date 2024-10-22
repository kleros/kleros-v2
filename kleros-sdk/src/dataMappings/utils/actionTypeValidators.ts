import { InvalidMappingError } from "../../errors";
import {
  SubgraphMapping,
  AbiEventMapping,
  AbiCallMapping,
  JsonMapping,
  ActionMapping,
  FetchIpfsJsonMapping,
  RealityMapping,
} from "./actionTypes";

export const validateSubgraphMapping = (mapping: ActionMapping) => {
  return validateMapping(mapping as SubgraphMapping, ["endpoint"]);
};

export const validateAbiEventMapping = (mapping: ActionMapping) => {
  return validateMapping(mapping as AbiEventMapping, ["abi", "eventFilter"]);
};

export const validateAbiCallMapping = (mapping: ActionMapping) => {
  return validateMapping(mapping as AbiCallMapping, ["abi", "functionName"]);
};

export const validateJsonMapping = (mapping: ActionMapping) => {
  return validateMapping(mapping as JsonMapping, ["value"]);
};

export const validateFetchIpfsJsonMapping = (mapping: ActionMapping) => {
  return validateMapping(mapping as FetchIpfsJsonMapping, ["ipfsUri"]);
};

export const validateRealityMapping = (mapping: ActionMapping) => {
  if (mapping.type !== "reality" || typeof (mapping as RealityMapping).realityQuestionID !== "string") {
    throw new InvalidMappingError("Expected field 'realityQuestionID' to be a string.");
  }
  return mapping as RealityMapping;
};

const validateMapping = <T extends ActionMapping>(mapping: T, requiredFields: (keyof T)[]) => {
  for (const field of requiredFields) {
    if (mapping[field] === undefined) {
      throw new InvalidMappingError(`${field.toString()} is required for ${mapping.type}`);
    }
  }
  return mapping;
};
