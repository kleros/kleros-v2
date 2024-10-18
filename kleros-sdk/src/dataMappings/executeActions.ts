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
import { Address } from "viem";

// Add these type definitions at the top of the file
type ActionResult = Record<string, unknown> | null | undefined;

// Update the function signature
export const executeAction = async (
  mapping: ActionMapping,
  context: Record<string, unknown> = {}
): Promise<ActionResult> => {
  mapping = replacePlaceholdersWithValues(mapping, context) as ActionMapping;

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
      return await retrieveRealityData(mapping.realityQuestionID, context.arbitrableAddress as Address);
    default:
      throw new Error(`Unsupported action type: ${JSON.stringify(mapping)}`);
  }
};

export const executeActions = async (
  mappings: ActionMapping[],
  initialContext: Record<string, unknown> = {}
): Promise<Record<string, unknown>> => {
  const context: Record<string, unknown> = { ...initialContext };

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
