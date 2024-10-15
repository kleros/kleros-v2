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
  if ((mapping as SubgraphMapping).endpoint === undefined) {
    throw new Error("Invalid mapping for graphql action.");
  }
  return mapping as SubgraphMapping;
};

export const validateAbiEventMapping = (mapping: ActionMapping) => {
  if ((mapping as AbiEventMapping).abi === undefined || (mapping as AbiEventMapping).eventFilter === undefined) {
    throw new Error("Invalid mapping for abi/event action.");
  }
  return mapping as AbiEventMapping;
};

export const validateAbiCallMapping = (mapping: ActionMapping) => {
  if ((mapping as AbiCallMapping).abi === undefined || (mapping as AbiCallMapping).functionName === undefined) {
    throw new Error("Invalid mapping for abi/call action.");
  }
  return mapping as AbiCallMapping;
};

export const validateJsonMapping = (mapping: ActionMapping) => {
  if ((mapping as JsonMapping).value === undefined) {
    throw new Error("Invalid mapping for json action.");
  }
  return mapping as JsonMapping;
};

export const validateFetchIpfsJsonMapping = (mapping: ActionMapping) => {
  if ((mapping as FetchIpfsJsonMapping).ipfsUri === undefined) {
    throw new Error("Invalid mapping for fetch/ipfs/json action.");
  }
  return mapping as FetchIpfsJsonMapping;
};

export const validateRealityMapping = (mapping: ActionMapping) => {
  if (mapping.type !== "reality" || typeof (mapping as RealityMapping).realityQuestionID !== "string") {
    throw new Error("Invalid mapping for reality action.");
  }
  return mapping as RealityMapping;
};
