import request from "graphql-request";
import { arbitrumSepolia } from "wagmi/chains";
import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { debounceErrorToast } from "./debounceErrorToast";

const CHAINID_TO_DISPUTE_TEMPLATE_SUBGRAPH = {
  [arbitrumSepolia.id]:
    process.env.REACT_APP_DRT_ARBSEPOLIA_SUBGRAPH ?? "Wrong Subgraph URL. Please check the environment variables.",
};

export const graphqlUrl = (isDisputeTemplate = false, chainId = arbitrumSepolia.id) => {
  const coreUrl = process.env.REACT_APP_CORE_SUBGRAPH ?? "Wrong Subgraph URL. Please check the environment variables.";
  return isDisputeTemplate ? CHAINID_TO_DISPUTE_TEMPLATE_SUBGRAPH[chainId] : coreUrl;
};

export const graphqlQueryFnHelper = async (
  query: TypedDocumentNode<any, any>,
  parametersObject: Record<string, any>,
  isDisputeTemplate = false,
  chainId = arbitrumSepolia.id
) => {
  try {
    const url = graphqlUrl(isDisputeTemplate, chainId);
    return await request(url, query, parametersObject);
  } catch (error) {
    console.log("Graph error : ", { error });
    debounceErrorToast("Graph failed : failed to fetch data");
  }
};
