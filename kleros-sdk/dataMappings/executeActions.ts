import { callAction } from "./actions/callAction";
import { eventAction } from "./actions/eventAction";
import { fetchIpfsJsonAction } from "./actions/fetchIpfsJsonAction";
import { jsonAction } from "./actions/jsonAction";
import { subgraphAction } from "./actions/subgraphAction";
import {
  isAbiCallMapping,
  isAbiEventMapping,
  isFetchIpfsJsonMapping,
  isJsonMapping,
  isSubgraphMapping,
} from "./utils/actionTypeDetectors";
import { ActionMapping } from "./utils/actionTypes";
import { replacePlaceholdersWithValues } from "./utils/replacePlaceholdersWithValues";

export const executeAction = async (mapping: ActionMapping, context = {}) => {
  mapping = replacePlaceholdersWithValues(mapping, context);

  switch (mapping.type) {
    case "graphql":
      if (!isSubgraphMapping(mapping)) {
        throw new Error("Invalid mapping for graphql action.");
      }
      return await subgraphAction(mapping);
    case "json":
      if (!isJsonMapping(mapping)) {
        throw new Error("Invalid mapping for json action.");
      }
      return jsonAction(mapping);
    case "abi/call":
      if (!isAbiCallMapping(mapping)) {
        throw new Error("Invalid mapping for abi/call action.");
      }
      return await callAction(mapping);
    case "abi/event":
      if (!isAbiEventMapping(mapping)) {
        throw new Error("Invalid mapping for abi/event action.");
      }
      return await eventAction(mapping);
    case "fetch/ipfs/json":
      if (!isFetchIpfsJsonMapping(mapping)) {
        throw new Error("Invalid mapping for fetch/ipfs/json action.");
      }
      return await fetchIpfsJsonAction(mapping);
    default:
      throw new Error(`Unsupported action type: ${mapping.type}`);
  }
};

export const executeActions = async (mappings) => {
  let context = {};

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
