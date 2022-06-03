import React, { createContext, useContext } from "react";
import { useHomePageQuery, HomePageQuery } from "queries/useHomePageQuery";

interface IContext {
  data: HomePageQuery | undefined;
  error: null | any;
  isValidating: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const Context = createContext<IContext>({
  data: undefined,
  error: null,
  isValidating: false,
});

export const HomePageProvider: React.FC<{ timeframe: number }> = ({
  children,
  timeframe,
}) => {
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
