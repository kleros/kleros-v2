import { callAction } from "./actions/callAction";
import { eventAction } from "./actions/eventAction";
import { fetchIpfsJsonAction } from "./actions/fetchIpfsJsonAction";
import { jsonAction } from "./actions/jsonAction";
import { subgraphAction } from "./actions/subgraphAction";
import { retrieveRealityData } from "./retrieveRealityData";
import {
  validateAbiCallMapping,
  validateAbiEventMapping,
  validateFetchIpfsJsonMapping,
  validateJsonMapping,
  validateRealityMapping,
  validateSubgraphMapping,
} from "./utils/dataMappingValidators";
import { DataMapping } from "./utils/dataMappingTypes";
import { replacePlaceholdersWithValues } from "./utils/replacePlaceholdersWithValues";
import { DisputeRequest } from "./utils/disputeRequest";

export const executeAction = async (mapping: DataMapping<any>, context?: DisputeRequest) => {
  mapping = replacePlaceholdersWithValues(mapping, context);

  switch (mapping.type) {
    case "graphql":
      return await subgraphAction(validateSubgraphMapping(mapping));
    case "json":
      return jsonAction(validateJsonMapping(mapping));
    case "abi/call":
      return await callAction(validateAbiCallMapping(mapping));
    case "abi/event":
      return await eventAction(validateAbiEventMapping(mapping));
    case "fetch/ipfs/json":
      return await fetchIpfsJsonAction(validateFetchIpfsJsonMapping(mapping));
    case "reality":
      mapping = validateRealityMapping(mapping);
      if (!context?.arbitrable) {
        throw new Error("Arbitrable address is required for reality action");
      }
      return await retrieveRealityData(mapping.realityQuestionID, context.arbitrable);
    default:
      throw new Error(`Unsupported action type: ${mapping.type}`);
  }
};

export const executeActions = async (mappings, initialContext?: DisputeRequest) => {
  const context = Object.assign({}, initialContext);
  for (const mapping of mappings) {
    const actionResult = await executeAction(mapping, context);
    if (actionResult) {
      Object.keys(actionResult).forEach((key) => {
        context[key] = actionResult[key];
      });
    }
  }

  return context;
};
