import React, { createContext, useState, useContext, useMemo, useCallback } from "react";

import { Address } from "viem";

import { DEFAULT_CHAIN } from "consts/chains";
import { klerosCoreAddress } from "hooks/contracts/generated";
import { useLocalStorage } from "hooks/useLocalStorage";
import { isEmpty, isUndefined } from "utils/index";

export type Answer = {
  id: string;
  title: string;
  description: string;
  reserved?: boolean;
};

export type AliasArray = {
  id?: string;
  name: string;
  address: string | Address;
  isValid?: boolean;
};

export type Alias = Record<string, string>;
export interface IDisputeTemplate {
  answers: Answer[];
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
  aliases?: Alias;
  version: string;
  // attachment: Attachment;
  // type: string;
}

interface IDisputeData extends IDisputeTemplate {
  courtId?: string;
  numberOfJurors: number;
  arbitrationCost?: string;
  aliasesArray?: AliasArray[];
  disputeKitId?: number;
}

interface INewDisputeContext {
  disputeData: IDisputeData;
  setDisputeData: (disputeData: IDisputeData) => void;
  disputeTemplate: IDisputeTemplate;
  resetDisputeData: () => void;
  isSubmittingCase: boolean;
  setIsSubmittingCase: (isSubmittingCase: boolean) => void;
  isPolicyUploading: boolean;
  setIsPolicyUploading: (isPolicyUploading: boolean) => void;
}

const getInitialDisputeData = (): IDisputeData => ({
  numberOfJurors: 3,
  title: "",
  description: "",
  question: "",
  category: "",
  answers: [
    { title: "", id: "1", description: "" },
    { title: "", id: "2", description: "" },
  ],
  aliasesArray: [{ name: "", address: "", id: "1" }],
  disputeKitId: 1,
  version: "1.0",
});

const initialDisputeData = getInitialDisputeData();

const NewDisputeContext = createContext<INewDisputeContext | undefined>(undefined);

export const useNewDisputeContext = () => {
  const context = useContext(NewDisputeContext);
  if (!context) {
    throw new Error("Context Provider not found.");
  }
  return context;
};

export const NewDisputeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [disputeData, setDisputeData] = useLocalStorage<IDisputeData>("disputeData", initialDisputeData);
  const [isSubmittingCase, setIsSubmittingCase] = useState<boolean>(false);
  const [isPolicyUploading, setIsPolicyUploading] = useState<boolean>(false);

  const disputeTemplate = useMemo(() => constructDisputeTemplate(disputeData), [disputeData]);

  const resetDisputeData = useCallback(() => {
    const freshData = getInitialDisputeData();
    setDisputeData(freshData);
  }, [setDisputeData]);

  const contextValues = useMemo(
    () => ({
      disputeData,
      setDisputeData,
      disputeTemplate,
      resetDisputeData,
      isSubmittingCase,
      setIsSubmittingCase,
      isPolicyUploading,
      setIsPolicyUploading,
    }),
    [disputeData, disputeTemplate, resetDisputeData, isSubmittingCase, isPolicyUploading, setDisputeData]
  );

  return <NewDisputeContext.Provider value={contextValues}>{children}</NewDisputeContext.Provider>;
};

const constructDisputeTemplate = (disputeData: IDisputeData) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { courtId, numberOfJurors, arbitrationCost, disputeKitId, ...baseTemplate } = disputeData;

  if (!isUndefined(baseTemplate.aliasesArray)) {
    baseTemplate.aliasesArray = baseTemplate.aliasesArray.filter((item) => item.address !== "" && item.isValid);
    if (baseTemplate.aliasesArray.length === 0) delete baseTemplate.aliasesArray;
    else {
      const aliases: Alias = {};

      for (const alias of baseTemplate.aliasesArray) {
        aliases[alias.name] = alias.address;
      }

      baseTemplate.aliases = aliases;
    }
  }

  for (const answer of baseTemplate.answers) {
    answer.id = "0x" + BigInt(answer.id).toString(16);
  }
  if (!isUndefined(baseTemplate.policyURI) && isEmpty(baseTemplate.policyURI)) delete baseTemplate.policyURI;

  baseTemplate.arbitratorAddress = klerosCoreAddress[DEFAULT_CHAIN];
  baseTemplate.arbitratorChainID = DEFAULT_CHAIN.toString();

  return baseTemplate as IDisputeTemplate;
};
