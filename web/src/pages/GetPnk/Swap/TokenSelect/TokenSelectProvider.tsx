import React, { createContext, useContext } from "react";
import { useToggle } from "react-use";

const ToggleContext = createContext<{ selectingToken: boolean; toggleTokenSelect: () => void }>({
  selectingToken: false,
  toggleTokenSelect: () => {},
});

export const TokenSelectProvider = ({ children }) => {
  const [isToggled, setIsToggled] = useToggle(false);

  const toggle = () => {
    setIsToggled((prevState) => !prevState);
  };

  return (
    <ToggleContext.Provider value={{ selectingToken: isToggled, toggleTokenSelect: toggle }}>
      {children}
    </ToggleContext.Provider>
  );
};

export const useTokenSelectContext = () => {
  const context = useContext(ToggleContext);
  if (!context) {
    throw new Error("Context undefined");
  }
  return context;
};
