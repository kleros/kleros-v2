import React, { useMemo, createContext, useContext } from "react";

import { createBatchingExecutor } from "@graphql-tools/batch-execute";
import { AsyncExecutor, ExecutionResult } from "@graphql-tools/utils";
import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { create, windowedFiniteBatchScheduler, Batcher } from "@yornaath/batshit";
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

const fetch = async (url, document, variables) => {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const result = request(url, document, variables).then((res) => ({
      data: res,
    })) as Promise<ExecutionResult>;

    return result;
  } catch (error) {
    console.error("Graph error: ", { error });
    debounceErrorToast("Graph query error: failed to fetch data.");
    return { data: {} };
  }
};

const coreExecutor: AsyncExecutor = async ({ document, variables }) => {
  return fetch(getGraphqlUrl(false), document, variables);
};

const dtrExecutor: AsyncExecutor = async ({ document, variables }) => {
  return fetch(getGraphqlUrl(true), document, variables);
};

const coreBatchExec = createBatchingExecutor(coreExecutor);
const dtrBatchExec = createBatchingExecutor(dtrExecutor);

const fetcher = async (queries: IQuery[]) => {
  const batchdata = await Promise.all(
    queries.map(({ document, variables, isDisputeTemplate }) =>
      isDisputeTemplate
        ? dtrBatchExec({
            document,
            variables,
          })
        : coreBatchExec({
            document,
            variables,
          })
    )
  );

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const processedData = batchdata.map((data, index) => ({ id: queries[index].id, result: data.data }));
  return processedData;
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
