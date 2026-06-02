import React, { createContext, useContext, useMemo } from "react";

import { useHomePageQuery, HomePageQuery } from "queries/useHomePageQuery";
export type { HomePageQuery };

interface IContext {
  data: HomePageQuery | undefined;
  error: null | any;
}

export type HomePageQueryDataPoints = keyof HomePageQuery["counters"][number];

const Context = createContext<IContext>({
  data: undefined,
  error: null,
});

export const HomePageProvider: React.FC<{
  children: React.ReactNode;
  timeframe: number;
}> = ({ children, timeframe }) => {
  const { data, error } = useHomePageQuery(timeframe);
  const value = useMemo(() => ({ data, error }), [data, error]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useHomePageContext: () => IContext = () => {
  return useContext(Context);
};
