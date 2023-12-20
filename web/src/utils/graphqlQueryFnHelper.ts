import request from "graphql-request";
import { TypedDocumentNode } from "@graphql-typed-document-node/core";

const CHAINID_TO_DISPUTE_TEMPLATE_SUBGRAPH = {
  421614:
    process.env.REACT_APP_DRT_ARBSEPOLIA_SUBGRAPH ?? "Wrong Subgraph URL. Please check the environment variables.",
};

export const graphqlUrl = (isDisputeTemplate = false, chainId = 421614) => {
  const coreUrl = process.env.REACT_APP_CORE_SUBGRAPH ?? "Wrong Subgraph URL. Please check the environment variables.";
  return isDisputeTemplate ? CHAINID_TO_DISPUTE_TEMPLATE_SUBGRAPH[chainId] : coreUrl;
};

export const graphqlQueryFnHelper = async (
  query: TypedDocumentNode<any, any>,
  parametersObject: Record<string, any>,
  isDisputeTemplate = false,
  chainId = 421614
) => {
  const url = graphqlUrl(isDisputeTemplate, chainId);
  return request(url, query, parametersObject);
};
