import React, { createContext, useContext } from "react";
import { useToggle } from "react-use";

interface IMenuProvider {
  isDappListOpen: boolean;
  toggleIsDappListOpen: (nextValue?: any) => void;

  isHelpOpen: boolean;
  toggleIsHelpOpen: (nextValue?: any) => void;

  isSettingsOpen: boolean;
  toggleIsSettingsOpen: (nextValue?: any) => void;
}

const nop = () => {
  // nop
};

const Context = createContext<IMenuProvider>({
  isDappListOpen: false,
  toggleIsDappListOpen: nop,
  isHelpOpen: false,
  toggleIsHelpOpen: nop,
  isSettingsOpen: false,
  toggleIsSettingsOpen: nop,
});

const MenuProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [isDappListOpen, toggleIsDappListOpen] = useToggle(false);
  const [isHelpOpen, toggleIsHelpOpen] = useToggle(false);
  const [isSettingsOpen, toggleIsSettingsOpen] = useToggle(false);

  const value = {
    isDappListOpen,
    toggleIsDappListOpen,
    isHelpOpen,
    toggleIsHelpOpen,
    isSettingsOpen,
    toggleIsSettingsOpen,
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useMenu = () => useContext(Context);

export default MenuProvider;
