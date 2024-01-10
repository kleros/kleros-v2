import {
  SubgraphMapping,
  AbiEventMapping,
  AbiCallMapping,
  JsonMapping,
  ActionMapping,
  FetchIpfsJsonMapping,
  RealityMapping,
} from "./actionTypes";

export const isSubgraphMapping = (mapping: ActionMapping): mapping is SubgraphMapping =>
  (mapping as SubgraphMapping).endpoint !== undefined;

export const isAbiEventMapping = (mapping: ActionMapping): mapping is AbiEventMapping =>
  (mapping as AbiEventMapping).abi !== undefined && (mapping as AbiEventMapping).eventFilter !== undefined;

export const isAbiCallMapping = (mapping: ActionMapping): mapping is AbiCallMapping =>
  (mapping as AbiCallMapping).abi !== undefined && (mapping as AbiCallMapping).args !== undefined;

export const isJsonMapping = (mapping: ActionMapping): mapping is JsonMapping =>
  (mapping as JsonMapping).value !== undefined;

export const isFetchIpfsJsonMapping = (mapping: ActionMapping): mapping is FetchIpfsJsonMapping =>
  (mapping as FetchIpfsJsonMapping).ipfsUri !== undefined;

export const isRealityMapping = (mapping: ActionMapping): mapping is RealityMapping =>
  mapping.type === "reality" && typeof (mapping as RealityMapping).realityQuestionID === "string";
