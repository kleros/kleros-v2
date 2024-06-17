import { SubgraphMapping } from "../utils/actionTypes";
import { createResultObject } from "src/dataMappings/utils/createResultObject";

export const subgraphAction = async (mapping: SubgraphMapping) => {
  const { endpoint, query, variables, seek, populate } = mapping;

  console.log("Subgraph action with mapping:", mapping);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log("Response data:", responseData);

    if (responseData.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(responseData.errors)}`);
    }

    const { data } = responseData;

    return createResultObject(data, seek, populate);
  } catch (error) {
    console.error("Error fetching from GraphQL endpoint:", error);
    throw error;
  }
};
