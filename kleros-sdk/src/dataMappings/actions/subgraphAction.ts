import { MAX_SUBGRAPH_RESPONSE_BYTE_SIZE } from "../../consts";
import { SubgraphMapping } from "../utils/actionTypes";
import { createResultObject } from "../utils/createResultObject";
import { readJsonWithLimit } from "../utils/readJsonWithLimit";

export const subgraphAction = async (mapping: SubgraphMapping) => {
  const { endpoint, query, variables, seek, populate } = mapping;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  const { data } = (await readJsonWithLimit(response, MAX_SUBGRAPH_RESPONSE_BYTE_SIZE, endpoint)) as { data: unknown };

  return createResultObject(data, seek, populate);
};
