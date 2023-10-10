import React, { createContext, useContext } from "react";
import { useLocalStorage, useToggle } from "react-use";

interface IIsListProvider {
  isList: boolean;
  setIsList: (arg0: boolean) => void;
}

const Context = createContext<IIsListProvider>({
  isList: false,
  setIsList: () => {
    //
  },
});

const IsListProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [isListStorage, setIsListStorage] = useLocalStorage("isList", false);
  const [isList, setIsListState] = useToggle(isListStorage ?? false);
  const setIsList = (toggle: boolean) => {
    setIsListState(toggle);
    setIsListStorage(toggle);
  };

  const value = {
    isList,
    setIsList,
  };
  return <Context.Provider {...{ value }}>{children}</Context.Provider>;
};

export const useIsList = () => useContext(Context);

export default IsListProvider;
