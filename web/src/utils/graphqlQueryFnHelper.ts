import request from "graphql-request";
import { TypedDocumentNode } from "@graphql-typed-document-node/core";

const CHAINID_TO_DISPUTETEMPLATE_SUBGRAPH = {
  421613: "https://api.thegraph.com/subgraphs/name/alcercu/disputetemplateregistryarbgrli",
};

export const graphqlQueryFnHelper = async (
  query: TypedDocumentNode<any, any>,
  parametersObject: Record<string, any>,
  isDisputeTemplate = false,
  chainId = 421613
) => {
  const coreUrl =
    process.env.REACT_APP_SUBGRAPH_ENDPOINT ?? "https://api.thegraph.com/subgraphs/name/alcercu/kleroscoretest";
  const url = isDisputeTemplate ? CHAINID_TO_DISPUTETEMPLATE_SUBGRAPH[chainId] : coreUrl;
  return request(url, query, parametersObject);
};
