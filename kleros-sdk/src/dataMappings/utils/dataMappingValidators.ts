import {
  SubgraphMapping,
  AbiEventMapping,
  AbiCallMapping,
  JsonMapping,
  DataMapping,
  FetchIpfsJsonMapping,
  RealityMapping,
} from "./dataMappingTypes";

export const validateSubgraphMapping = (mapping: DataMapping<SubgraphMapping>) => {
  if ((mapping as SubgraphMapping).endpoint !== undefined) {
    throw new Error("Invalid mapping for graphql action.");
  }
  return mapping as SubgraphMapping;
};

export const validateAbiEventMapping = (mapping: DataMapping<AbiEventMapping>) => {
  if ((mapping as AbiEventMapping).abi === undefined || (mapping as AbiEventMapping).eventFilter === undefined) {
    throw new Error("Invalid mapping for abi/event action.");
  }
  return mapping as AbiEventMapping;
};

export const validateAbiCallMapping = (mapping: DataMapping<AbiCallMapping>) => {
  if ((mapping as AbiCallMapping).abi === undefined || (mapping as AbiCallMapping).args === undefined) {
    throw new Error("Invalid mapping for abi/call action.");
  }
  return mapping as AbiCallMapping;
};

export const validateJsonMapping = (mapping: DataMapping<JsonMapping>) => {
  if ((mapping as JsonMapping).value === undefined) {
    throw new Error("Invalid mapping for json action.");
  }
  return mapping as JsonMapping;
};

export const validateFetchIpfsJsonMapping = (mapping: DataMapping<FetchIpfsJsonMapping>) => {
  if ((mapping as FetchIpfsJsonMapping).ipfsUri === undefined) {
    throw new Error("Invalid mapping for fetch/ipfs/json action.");
  }
  return mapping as FetchIpfsJsonMapping;
};

export const validateRealityMapping = (mapping: DataMapping<RealityMapping>) => {
  if (mapping.type !== "reality" || typeof (mapping as RealityMapping).realityQuestionID !== "string") {
    throw new Error("Invalid mapping for reality action.");
  }
  return mapping as RealityMapping;
};
