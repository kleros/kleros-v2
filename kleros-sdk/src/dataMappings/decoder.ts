import request from "graphql-request";
import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { DisputeDetails } from "./disputeDetails";

export type Decoder = (externalDisputeID: string, disputeTemplate: Partial<DisputeDetails>) => Promise<DisputeDetails>;

// https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-10.md
export type CAIP10 = `eip155:${number}:0x${string}`;

export const graphqlQueryFnHelper = async (
  url: string,
  query: TypedDocumentNode<any, any>,
  parametersObject: Record<string, any>,
  chainId = 421613
) => {
  return request(url, query, parametersObject);
};

// TODO: generate graphql query
const disputeTemplateQuery = graphql(`
  query DisputeTemplate($id: ID!) {
    disputeTemplate(id: $id) {
      id
      templateTag
      templateData
      templateDataMappings
    }
  }
`);

export const genericDecoder = async (
  externalDisputeID: string,
  arbitrableDisputeID: string,
  disputeTemplateID: string,
  disputeTemplateRegistry: CAIP10
): Promise<DisputeDetails> => {
  let subgraphUrl;
  switch (disputeTemplateRegistry) {
    case "eip155:421613:0x22A58a17F12A718d18C9B6Acca3E311Da1b00A04": // Devnet
      subgraphUrl = process.env.REACT_APP_DISPUTE_TEMPLATE_ARBGOERLI_SUBGRAPH_DEVNET;
      break;
    case "eip155:421613:0xA55D4b90c1F8D1fD0408232bF6FA498dD6786385": // Testnet
      subgraphUrl = process.env.REACT_APP_DISPUTE_TEMPLATE_ARBGOERLI_SUBGRAPH_TESTNET;
      break;
    default:
      throw new Error(`Unsupported dispute template registry: ${disputeTemplateRegistry}`);
  }
  const { disputeTemplate } = await request(subgraphUrl, disputeTemplateQuery, { id: disputeTemplateID.toString() });
  switch (disputeTemplate.specification) {
    case "KIP99":
      return await kip99Decoder(externalDisputeID, disputeTemplate);
    default:
      throw new Error(`Unsupported dispute template specification: ${disputeTemplate.specification}`);
  }
};
