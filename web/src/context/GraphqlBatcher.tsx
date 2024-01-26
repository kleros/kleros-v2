import React, { createContext, useContext } from "react";
import { arbitrumSepolia } from "wagmi/chains";
import { batchRequests } from "graphql-request";
import { create, indexedResolver, windowScheduler, Batcher } from "@yornaath/batshit";
import { TypedDocumentNode } from "@graphql-typed-document-node/core";

const CHAINID_TO_DISPUTE_TEMPLATE_SUBGRAPH = {
  [arbitrumSepolia.id]:
    process.env.REACT_APP_DRT_ARBSEPOLIA_SUBGRAPH ?? "Wrong Subgraph URL. Please check the environment variables.",
};

interface IGraphqlBatcher {
  graphqlBatcher: Batcher<any, IQuery>;
}

interface IQuery {
  document: TypedDocumentNode<any, any>;
  variables: Record<string, any>;
  isDisputeTemplate?: boolean;
  chainId?: number;
}

const Context = createContext<IGraphqlBatcher | undefined>(undefined);

const GraphqlBatcherProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const graphqlBatcher = create({
    fetcher: async (queries: IQuery[]) => {
      const groups = queries.reduce((acc, { document, variables, isDisputeTemplate, chainId }, i) => {
        const url = graphqlUrl(isDisputeTemplate ?? false, chainId ?? arbitrumSepolia.id);
        if (typeof acc[url] !== "undefined") {
          acc[url] = acc[url].push({ document, variables });
        } else {
          acc[url] = [{ document, variables }];
        }
        return acc;
      }, {});
      const data = await Promise.all(Object.keys(groups).map((url) => batchRequests(url, groups[url])));
      console.log(data);
      return data;
    },
    resolver: indexedResolver(),
    scheduler: windowScheduler(100),
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
