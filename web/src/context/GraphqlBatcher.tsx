import React, { createContext, useContext } from "react";
import { arbitrumSepolia } from "wagmi/chains";
import { request } from "graphql-request";
import { create, windowedFiniteBatchScheduler, Batcher } from "@yornaath/batshit";
import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { debounceErrorToast } from "utils/debounceErrorToast";

const CHAINID_TO_DISPUTE_TEMPLATE_SUBGRAPH = {
  [arbitrumSepolia.id]:
    process.env.REACT_APP_DRT_ARBSEPOLIA_SUBGRAPH ?? "Wrong Subgraph URL. Please check the environment variables.",
};

interface IGraphqlBatcher {
  graphqlBatcher: Batcher<any, IQuery>;
}

interface IQuery {
  id: string;
  document: TypedDocumentNode<any, any>;
  variables: Record<string, any>;
  isDisputeTemplate?: boolean;
  chainId?: number;
}

const Context = createContext<IGraphqlBatcher | undefined>(undefined);

const GraphqlBatcherProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const graphqlBatcher = create({
    fetcher: async (queries: IQuery[]) => {
      const promises = queries.map(async ({ id, document, variables, isDisputeTemplate, chainId }) => {
        const url = graphqlUrl(isDisputeTemplate ?? false, chainId ?? arbitrumSepolia.id);
        try {
          return request(url, document, variables).then((result) => ({ id, result }));
        } catch (error) {
          console.error("Graph error: ", { error });
          debounceErrorToast("Graph query error: failed to fetch data.");
          return { id, result: {} };
        }
      });
      const data = await Promise.all(promises);
      return data;
    },
    resolver: (results, query) => results.find((result) => result.id === query.id)!["result"],
    scheduler: windowedFiniteBatchScheduler({
      windowMs: 100,
      maxBatchSize: 5,
    }),
  });
  return <Context.Provider value={{ graphqlBatcher }}>{children}</Context.Provider>;
};

export const useGraphqlBatcher = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error("Context Provider not found.");
  }
  return context;
};

export const graphqlUrl = (isDisputeTemplate = false, chainId: number = arbitrumSepolia.id) => {
  const coreUrl = process.env.REACT_APP_CORE_SUBGRAPH ?? "Wrong Subgraph URL. Please check the environment variables.";
  return isDisputeTemplate ? CHAINID_TO_DISPUTE_TEMPLATE_SUBGRAPH[chainId] : coreUrl;
};

export default GraphqlBatcherProvider;
