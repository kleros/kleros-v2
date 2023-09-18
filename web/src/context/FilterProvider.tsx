import React, { useState, createContext, useContext } from "react";

interface IFilters {
  isList: boolean;
  setIsList: (arg0: boolean) => void;
}

const Context = createContext<IFilters>({
  isList: false,
  setIsList: () => {
    //
  },
});

export const FilterProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [isList, setIsList] = useState(false);

  const value = {
    isList,
    setIsList,
  };
  return <Context.Provider {...{ value }}>{children}</Context.Provider>;
};

export const useFiltersContext = () => useContext(Context);
