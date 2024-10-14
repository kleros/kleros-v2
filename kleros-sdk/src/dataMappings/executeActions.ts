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
} from "./utils/actionTypeValidators";
import { ActionMapping } from "./utils/actionTypes";
import { replacePlaceholdersWithValues } from "./utils/replacePlaceholdersWithValues";

export const executeAction = async (mapping: ActionMapping, context: Record<string, unknown> = {}) => {
  mapping = replacePlaceholdersWithValues(mapping, context);

  switch (mapping.type) {
    case "graphql":
      return await subgraphAction(validateSubgraphMapping(mapping));
    case "json":
      return jsonAction(validateJsonMapping(mapping));
    case "abi/call":
      return await callAction(validateAbiCallMapping(mapping), context.alchemyApiKey);
    case "abi/event":
      return await eventAction(validateAbiEventMapping(mapping), context.alchemyApiKey);
    case "fetch/ipfs/json":
      return await fetchIpfsJsonAction(validateFetchIpfsJsonMapping(mapping));
    case "reality":
      mapping = validateRealityMapping(mapping);
      return await retrieveRealityData(mapping.realityQuestionID, context.arbitrableAddress);
    default:
      throw new Error(`Unsupported action type: ${mapping.type}`);
  }
};

export const executeActions = async (mappings, initialContext: Record<string, any> = {}) => {
  const context = { ...initialContext };

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
