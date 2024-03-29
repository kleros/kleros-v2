export type DisputeDetails = {
  title: string;
  description: string;
  question: string;
  type: QuestionType;
  answers: Answer[];
  policyURI: string;
  attachment: Attachment;
  frontendUrl: string;
  arbitrableChainID: string;
  arbitrableAddress: `0x${string}`;
  arbitratorChainID: string;
  arbitratorAddress: `0x${string}`;
  category: string;
  lang: string;
  specification: string;
  version: string;
  // missing metadata
};

export enum QuestionType {
  Bool = "bool",
  Datetime = "datetime",
  MultipleSelect = "multiple-select",
  SingleSelect = "single-select",
  Uint = "uint",
}

export type Answer = {
  title: string;
  description: string;
  id: `0x${string}`;
  reserved: boolean;
};

export type Attachment = {
  label: string;
  uri: string;
};
