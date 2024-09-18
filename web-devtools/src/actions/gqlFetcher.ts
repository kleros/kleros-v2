"use server";

import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { request } from "graphql-request";

import { getGraphqlUrl } from "./getGraphqlUrl";

export const gqlRequest = async (
  document: TypedDocumentNode<any, any>,
  variables: Record<string, any>,
  chainId?: number,
  isDisputeTemplate?: boolean
) => {
  const url = await getGraphqlUrl(isDisputeTemplate, chainId);
  return await request(url, document, variables);
};
