import { type Address } from "viem";

export type JsonMapping = {
  type: string;
  value: object;
  seek: string[];
  populate: string[];
};

export interface SubgraphMapping {
  type: string;
  endpoint: string;
  query: string;
  variables: { [key: string]: unknown };
  seek: string[];
  populate: string[];
}

export type AbiCallMapping = {
  type: string;
  abi: string;
  address: Address;
  args: any[];
  seek: string[];
  populate: string[];
};

export type AbiEventMapping = {
  type: string;
  abi: string;
  address: Address;
  eventFilter: {
    fromBlock: BigInt | string;
    toBlock: BigInt | string;
    args: any;
  };
  seek: string[];
  populate: string[];
};

export type FetchIpfsJsonMapping = {
  type: string;
  ipfsUri: string;
  seek: string[];
  populate: string[];
};

export type RealityMapping = {
  type: "reality";
  realityQuestionID: string;
};

export type ActionMapping =
  | SubgraphMapping
  | AbiEventMapping
  | AbiCallMapping
  | JsonMapping
  | FetchIpfsJsonMapping
  | RealityMapping;
