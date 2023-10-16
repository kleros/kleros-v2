export type DisputeDetails = {
  title: string;
  description: string;
  question: string;
  type: QuestionType;
  answers: Answer[];
  policyURI: string;
  frontendUrl: string;
  arbitrableChainID: string;
  arbitrableAddress: `0x${string}`;
  arbitratorChainID: string;
  arbitratorAddress: `0x${string}`;
  category: string;
  lang: string;
  specification: string;
  version: string;
};

export type Answer = {
  title: string;
  description: string;
  id: `0x${string}`;
  reserved: boolean;
};

export enum QuestionType {
  Bool = "bool",
  Datetime = "datetime",
  MultipleSelect = "multiple-select",
  SingleSelect = "single-select",
  Uint = "uint",
}
