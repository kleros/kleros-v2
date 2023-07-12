import request from "graphql-request";
import { TypedDocumentNode } from "@graphql-typed-document-node/core";

export const graphqlQueryFnHelper = async (
  isEnabled: boolean,
  query: TypedDocumentNode<any, any>,
  parametersObject: Record<string, any>
) => {
  if (isEnabled) {
    return request(
      "https://api.thegraph.com/subgraphs/name/kleros/kleros-v2-core-arbitrum-goerli",
      query,
      parametersObject
    );
  }
  return;
};
