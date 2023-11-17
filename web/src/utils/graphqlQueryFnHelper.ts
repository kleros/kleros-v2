import request from "graphql-request";
import { TypedDocumentNode } from "@graphql-typed-document-node/core";

const DEPLOYMENT = process.env.REACT_APP_DEPLOYMENT?.toUpperCase() ?? "TESTNET";

const DEPLOYMENTS_TO_KLEROS_CORE_SUBGRAPHS = {
  MAINNET: process.env.REACT_APP_KLEROS_CORE_SUBGRAPH_MAINNET,
  TESTNET: process.env.REACT_APP_KLEROS_CORE_SUBGRAPH_TESTNET,
  DEVNET: process.env.REACT_APP_KLEROS_CORE_SUBGRAPH_DEVNET,
};

const DEPLOYMENTS_TO_DISPUTE_TEMPLATE_ARBSEPOLIA_SUBGRAPHS = {
  MAINNET: process.env.REACT_APP_DISPUTE_TEMPLATE_ARBSEPOLIA_SUBGRAPH_MAINNET,
  TESTNET: process.env.REACT_APP_DISPUTE_TEMPLATE_ARBSEPOLIA_SUBGRAPH_TESTNET,
  DEVNET: process.env.REACT_APP_DISPUTE_TEMPLATE_ARBSEPOLIA_SUBGRAPH_DEVNET,
};

const CHAINID_TO_DISPUTE_TEMPLATE_SUBGRAPH = {
  421614:
    DEPLOYMENTS_TO_DISPUTE_TEMPLATE_ARBSEPOLIA_SUBGRAPHS[DEPLOYMENT] ??
    "https://api.thegraph.com/subgraphs/name/alcercu/disputetemplateregistryarbgrli",
};

export const graphqlUrl = (isDisputeTemplate = false, chainId = 421614) => {
  const coreUrl =
    DEPLOYMENTS_TO_KLEROS_CORE_SUBGRAPHS[DEPLOYMENT] ??
    "https://api.thegraph.com/subgraphs/name/alcercu/kleroscoretest";
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
