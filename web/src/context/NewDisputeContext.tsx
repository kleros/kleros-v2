import React, { createContext, useState, useContext, useEffect, useMemo } from "react";
import { isUndefined } from "utils/index";
import { Address } from "viem";

export type Answer = {
  id?: string;
  title: string;
  description?: string;
  reserved?: boolean;
};

export type Alias = {
  name: string;
  address: string | Address;
};

export interface IDisputeTemplate {
  answers: Answer[];
  aliases?: Alias[];
  arbitrableAddress?: string;
  arbitrableChainID?: string;
  arbitratorAddress?: string;
  arbitratorChainID?: string;
  category?: string;
  description: string;
  frontendUrl?: string;
  lang?: string;
  policyURI?: string;
  question: string;
  specification?: string;
  title: string;
}

interface IDisputeData extends IDisputeTemplate {
  courtId: string;
  numberOfJurors: number;
  numberOfRulingOptions: number;
  policyFile?: File;
  arbitrationCost?: string;
}

interface INewDisputeContext {
  disputeData: IDisputeData;
  setDisputeData: (disputeTemplate: IDisputeData) => void;
  disputeTemplate: IDisputeTemplate;
  resetDisputeData: () => void;
}

//TODO: iterate on a better initial state
const initialDisputeData: IDisputeData = {
  courtId: "1",
  numberOfJurors: 3,
  numberOfRulingOptions: 2,
  title: "",
  description: "",
  question: "",
  answers: [{ title: "" }, { title: "" }],
  aliases: [
    { name: "", address: "" },
    { name: "", address: "" },
  ],
};
const initialDisputeTemplate = initialDisputeData as IDisputeTemplate;

const NewDisputeContext = createContext<INewDisputeContext>({
  disputeData: initialDisputeData,
  setDisputeData: () => {},
  disputeTemplate: initialDisputeTemplate,
  resetDisputeData: () => {},
});

export const useNewDisputeContext = () => useContext(NewDisputeContext);

export const NewDisputeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const localDisputeTemplate = localStorage.getItem("disputeData") ?? undefined;
  const initialState = isUndefined(localDisputeTemplate) ? initialDisputeData : JSON.parse(localDisputeTemplate);
  const [disputeData, setDisputeData] = useState<IDisputeData>(initialState);

  //TODO: reset data on submit or maybe page leave?
  useEffect(() => {
    localStorage.setItem("disputeData", JSON.stringify(disputeData));
  }, [disputeData]);

  //keep updating disputeTemplate
  const disputeTemplate = useMemo(() => disputeData as IDisputeTemplate, [disputeData]);

  return (
    <NewDisputeContext.Provider
      value={{
        disputeData,
        setDisputeData,
        disputeTemplate,
        resetDisputeData: () => setDisputeData(initialDisputeData),
      }}
    >
      {children}
    </NewDisputeContext.Provider>
  );
};
