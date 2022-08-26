import React, { createContext, useContext } from "react";
import { useHomePageQuery, HomePageQuery } from "queries/useHomePageQuery";
export type { HomePageQuery };

interface IContext {
  data: HomePageQuery | undefined;
  error: null | any;
  isValidating: boolean;
}

export type HomePageQueryDataPoints =
  | HomePageQuery["pnkstakedDataPoints"]
  | HomePageQuery["pnkredistributedDataPoints"]
  | HomePageQuery["casesDataPoints"]
  | HomePageQuery["ethpaidDataPoints"]
  | HomePageQuery["activeJurorsDataPoints"];

const Context = createContext<IContext>({
  data: undefined,
  error: null,
  isValidating: false,
});

export const HomePageProvider: React.FC<{
  children: React.ReactNode;
  timeframe: number;
}> = ({ children, timeframe }) => {
  const { data, error, isValidating } = useHomePageQuery(timeframe);
  return (
    <Context.Provider value={{ data, error, isValidating }}>
      {children}
    </Context.Provider>
  );
};

export const useHomePageContext: () => IContext = () => {
  return useContext(Context);
};
