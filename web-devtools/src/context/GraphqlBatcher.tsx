import React, { useMemo, createContext, useContext } from "react";

import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { create, windowedFiniteBatchScheduler, type Batcher } from "@yornaath/batshit";
import { request } from "graphql-request";

import { debounceErrorToast } from "utils/debounceErrorToast";
import { getGraphqlUrl } from "utils/getGraphqlUrl";

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

const fetcher = async (queries: IQuery[]) => {
  const promises = queries.map(async ({ id, document, variables, isDisputeTemplate, chainId }) => {
    const url = getGraphqlUrl(isDisputeTemplate ?? false, chainId);
    try {
      return request(url, document, variables).then((result) => ({ id, result }));
    } catch (error) {
      console.error("Graph error: ", { error, query: { id, document, variables, isDisputeTemplate, chainId } });
      debounceErrorToast("Graph query error: failed to fetch data.");
      return { id, result: {} };
    }
  });
  const data = await Promise.all(promises);
  return data;
};

const GraphqlBatcherProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const graphqlBatcher = create({
    fetcher,
    resolver: (results, query) => results.find((result) => result.id === query.id)!["result"],
    scheduler: windowedFiniteBatchScheduler({
      windowMs: 100,
      maxBatchSize: 5,
    }),
  });
  return <Context.Provider value={useMemo(() => ({ graphqlBatcher }), [graphqlBatcher])}>{children}</Context.Provider>;
};

export const useGraphqlBatcher = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error("Context Provider not found.");
  }
  return context;
};

export default GraphqlBatcherProvider;
